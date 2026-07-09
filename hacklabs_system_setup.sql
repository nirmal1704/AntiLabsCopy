-- Hacklabs Complete Master Setup Script
-- This script safely drops existing tables and creates the entire schema, policies, and functions.

-- 0. Reset Existing Tables and Views
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP VIEW IF EXISTS public.hacklabs_judge_view CASCADE;
DROP TABLE IF EXISTS public.hacklabs_invitations CASCADE;
DROP TABLE IF EXISTS public.hacklabs_academic_info CASCADE;
DROP TABLE IF EXISTS public.hacklabs_technical_info CASCADE;
DROP TABLE IF EXISTS public.hacklabs_personal_details CASCADE;
DROP TABLE IF EXISTS public.hacklabs_teams CASCADE;
DROP TABLE IF EXISTS public.hacklabs_judges CASCADE;

-- 1. Judges Table
CREATE TABLE public.hacklabs_judges (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Personal Details Table (Core Profile)
CREATE TABLE public.hacklabs_personal_details (
  auth_id uuid NOT NULL, 
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  dob date NOT NULL,
  gender text NOT NULL,
  profile_photo jsonb,
  unique_user_code text NOT NULL UNIQUE, 
  team_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hacklabs_personal_details_pkey PRIMARY KEY (auth_id),
  CONSTRAINT hacklabs_personal_details_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Teams Table
CREATE TABLE public.hacklabs_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unique_team_code text NOT NULL UNIQUE, 
  captain_id uuid NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text])),
  cashfree_order_id text,
  cashfree_payment_session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hacklabs_teams_pkey PRIMARY KEY (id),
  CONSTRAINT hacklabs_teams_name_key UNIQUE (name),
  CONSTRAINT hacklabs_teams_captain_id_fkey FOREIGN KEY (captain_id) REFERENCES public.hacklabs_personal_details(auth_id)
);

-- Add team_id foreign key constraint to personal_details
ALTER TABLE public.hacklabs_personal_details 
  ADD CONSTRAINT hacklabs_personal_details_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.hacklabs_teams(id);

-- 4. Academic Info Table
CREATE TABLE public.hacklabs_academic_info (
  auth_id uuid NOT NULL,
  college_name text NOT NULL,
  degree text NOT NULL,
  branch text NOT NULL,
  year_of_study text NOT NULL,
  graduation_year text NOT NULL,
  CONSTRAINT hacklabs_academic_info_pkey PRIMARY KEY (auth_id),
  CONSTRAINT hacklabs_academic_info_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES public.hacklabs_personal_details(auth_id) ON DELETE CASCADE
);

-- 5. Technical Info Table
CREATE TABLE public.hacklabs_technical_info (
  auth_id uuid NOT NULL,
  github_link text NOT NULL,
  linkedin text,
  portfolio text,
  resume_link text,
  CONSTRAINT hacklabs_technical_info_pkey PRIMARY KEY (auth_id),
  CONSTRAINT hacklabs_technical_info_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES public.hacklabs_personal_details(auth_id) ON DELETE CASCADE
);

-- 6. Invitations & Join Requests
CREATE TABLE public.hacklabs_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  participant_auth_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['invite'::text, 'request'::text])), 
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hacklabs_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT hacklabs_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.hacklabs_teams(id),
  CONSTRAINT hacklabs_invitations_participant_auth_id_fkey FOREIGN KEY (participant_auth_id) REFERENCES public.hacklabs_personal_details(auth_id)
);

-- 7. SQL View for Judges
CREATE OR REPLACE VIEW public.hacklabs_judge_view AS
SELECT 
  p.auth_id,
  p.full_name,
  p.mobile_number,
  p.dob,
  p.gender,
  p.unique_user_code,
  a.college_name,
  a.degree,
  a.branch,
  a.year_of_study,
  a.graduation_year,
  t.github_link,
  t.linkedin,
  t.portfolio,
  t.resume_link,
  team.name AS team_name,
  team.unique_team_code,
  team.payment_status
FROM public.hacklabs_personal_details p
LEFT JOIN public.hacklabs_academic_info a ON p.auth_id = a.auth_id
LEFT JOIN public.hacklabs_technical_info t ON p.auth_id = t.auth_id
LEFT JOIN public.hacklabs_teams team ON p.team_id = team.id;

REVOKE ALL ON public.hacklabs_judge_view FROM anon, authenticated;

-- 8. RPC Functions

CREATE OR REPLACE FUNCTION public.is_hacklabs_judge()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.hacklabs_judges WHERE email = auth.email()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_judge_data()
RETURNS SETOF public.hacklabs_judge_view
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_hacklabs_judge() THEN
    RAISE EXCEPTION 'Access Denied: You are not an authorized judge.';
  END IF;

  RETURN QUERY SELECT * FROM public.hacklabs_judge_view;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT team_id FROM public.hacklabs_personal_details WHERE auth_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.invite_user_by_code(target_user_code text, source_team_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_auth_id uuid;
  target_team_id uuid;
BEGIN
  SELECT auth_id, team_id INTO target_auth_id, target_team_id
  FROM public.hacklabs_personal_details
  WHERE unique_user_code = target_user_code;

  IF target_auth_id IS NULL THEN
    RAISE EXCEPTION 'Invalid User Code.';
  END IF;

  IF target_team_id IS NOT NULL THEN
    RAISE EXCEPTION 'This user is already part of a team.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.hacklabs_invitations WHERE team_id = source_team_id AND participant_auth_id = target_auth_id AND status = 'pending') THEN
    RAISE EXCEPTION 'A pending invitation or request already exists for this user.';
  END IF;

  INSERT INTO public.hacklabs_invitations (team_id, participant_auth_id, type, status)
  VALUES (source_team_id, target_auth_id, 'invite', 'pending');
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_hacklabs_invite(invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inv record;
BEGIN
  SELECT * INTO inv FROM public.hacklabs_invitations WHERE id = invite_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF inv.status != 'pending' THEN
    RAISE EXCEPTION 'This invitation is no longer pending.';
  END IF;

  IF inv.type = 'invite' THEN
    IF inv.participant_auth_id != auth.uid() THEN
      RAISE EXCEPTION 'Access Denied: Only the invited participant can accept this invite.';
    END IF;
  ELSIF inv.type = 'request' THEN
    IF NOT EXISTS (SELECT 1 FROM public.hacklabs_teams WHERE id = inv.team_id AND captain_id = auth.uid()) THEN
      RAISE EXCEPTION 'Access Denied: Only the Team Captain can accept this request.';
    END IF;
  END IF;

  UPDATE public.hacklabs_invitations SET status = 'accepted' WHERE id = invite_id;
  UPDATE public.hacklabs_personal_details SET team_id = inv.team_id WHERE auth_id = inv.participant_auth_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_password(new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Requires pgcrypto extension
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = auth.uid();
END;
$$;

-- 9. Row Level Security (RLS) Policies

-- Personal Details
ALTER TABLE public.hacklabs_personal_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data, team members, and pending invites" ON public.hacklabs_personal_details
  FOR SELECT USING (
    auth_id = auth.uid()
    OR (team_id IS NOT NULL AND team_id = public.get_user_team_id())
    OR EXISTS (
      SELECT 1 FROM public.hacklabs_invitations 
      WHERE (participant_auth_id = auth_id AND team_id = public.get_user_team_id())
    )
  );
CREATE POLICY "Users can update own personal details" ON public.hacklabs_personal_details FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own personal details" ON public.hacklabs_personal_details FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Teams
ALTER TABLE public.hacklabs_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are viewable by everyone" ON public.hacklabs_teams FOR SELECT USING (true);
CREATE POLICY "Captains can update teams" ON public.hacklabs_teams FOR UPDATE USING (captain_id = auth.uid());
CREATE POLICY "Authenticated users can create teams" ON public.hacklabs_teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Academic Info
ALTER TABLE public.hacklabs_academic_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Strict view policy for academic info" ON public.hacklabs_academic_info FOR SELECT USING (
  auth_id = auth.uid() OR 
  public.is_hacklabs_judge() OR 
  EXISTS (SELECT 1 FROM public.hacklabs_personal_details WHERE auth_id = hacklabs_academic_info.auth_id)
);
CREATE POLICY "Users can update own academic info" ON public.hacklabs_academic_info FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own academic info" ON public.hacklabs_academic_info FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Technical Info
ALTER TABLE public.hacklabs_technical_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Strict view policy for technical info" ON public.hacklabs_technical_info FOR SELECT USING (
  auth_id = auth.uid() OR 
  public.is_hacklabs_judge() OR 
  EXISTS (SELECT 1 FROM public.hacklabs_personal_details WHERE auth_id = hacklabs_technical_info.auth_id)
);
CREATE POLICY "Users can update own technical info" ON public.hacklabs_technical_info FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own technical info" ON public.hacklabs_technical_info FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Invitations
ALTER TABLE public.hacklabs_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own or team invites" ON public.hacklabs_invitations
  FOR SELECT USING (
    participant_auth_id = auth.uid() 
    OR 
    team_id = public.get_user_team_id()
  );
CREATE POLICY "Users can insert own requests or captain invites" ON public.hacklabs_invitations
  FOR INSERT WITH CHECK (
    (type = 'request' AND participant_auth_id = auth.uid()) 
    OR
    (type = 'invite' AND EXISTS (SELECT 1 FROM public.hacklabs_teams WHERE id = team_id AND captain_id = auth.uid()))
  );

-- RPC: Preview Team by Code (Bypass RLS for preview)
CREATE OR REPLACE FUNCTION public.preview_team_by_code(p_team_code text)
RETURNS TABLE (
    id uuid,
    name text,
    unique_team_code text,
    captain_name text,
    member_names text[]
)
SECURITY DEFINER
AS 
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.unique_team_code,
        c.full_name AS captain_name,
        ARRAY(
            SELECT p.full_name 
            FROM hacklabs_personal_details p 
            WHERE p.team_id = t.id AND p.auth_id != t.captain_id
        ) AS member_names
    FROM hacklabs_teams t
    LEFT JOIN hacklabs_personal_details c ON t.captain_id = c.auth_id
    WHERE t.unique_team_code = p_team_code;
END;
 LANGUAGE plpgsql;

-- RPC: Check Email Exists
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean AS \$\$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(TRIM(p_email))
  );
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
