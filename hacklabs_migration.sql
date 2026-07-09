-- =============================================================================
-- HackLabs Migration Script — Safe for Main AntiLabs Supabase Project
-- Run this ONCE in the Supabase SQL Editor on the main AntiLabs project.
-- Uses IF NOT EXISTS / CREATE OR REPLACE everywhere — safe to re-run.
-- =============================================================================

-- 0. Required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- STEP 1: GUARD THE handle_new_user TRIGGER
-- Prevents HackLabs signups (which have is_hacklabs=true in metadata) from
-- auto-creating a row in the main public.users table.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _age integer;
BEGIN
  -- Skip creating a public.users row for HackLabs participants
  IF (new.raw_user_meta_data->>'is_hacklabs')::boolean = true THEN
    RETURN new;
  END IF;

  BEGIN
    _age := (new.raw_user_meta_data->>'age')::integer;
  EXCEPTION WHEN others THEN
    _age := NULL;
  END;

  INSERT INTO public.users (auth_id, name, email, phone_number, age, profession, residential_address)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'phone',
    _age,
    new.raw_user_meta_data->>'profession',
    new.raw_user_meta_data->>'address'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =============================================================================
-- STEP 2: CREATE HACKLABS TABLES (IF NOT EXISTS)
-- =============================================================================

-- 2a. Judges whitelist
CREATE TABLE IF NOT EXISTS public.hacklabs_judges (
  email text PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now()
);

-- 2b. Participant core profile
CREATE TABLE IF NOT EXISTS public.hacklabs_personal_details (
  auth_id uuid NOT NULL,
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  dob date NOT NULL,
  gender text NOT NULL,
  profile_photo jsonb,
  unique_user_code text NOT NULL,
  team_id uuid,
  email text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT hacklabs_personal_details_pkey PRIMARY KEY (auth_id),
  CONSTRAINT hacklabs_personal_details_unique_user_code_key UNIQUE (unique_user_code),
  CONSTRAINT hacklabs_personal_details_auth_id_fkey
    FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2c. Teams
CREATE TABLE IF NOT EXISTS public.hacklabs_teams (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  unique_team_code text NOT NULL,
  captain_id uuid NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  cashfree_order_id text,
  cashfree_payment_session_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT hacklabs_teams_pkey PRIMARY KEY (id),
  CONSTRAINT hacklabs_teams_name_key UNIQUE (name),
  CONSTRAINT hacklabs_teams_unique_team_code_key UNIQUE (unique_team_code),
  CONSTRAINT hacklabs_teams_payment_status_check
    CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text])),
  CONSTRAINT hacklabs_teams_captain_id_fkey
    FOREIGN KEY (captain_id) REFERENCES public.hacklabs_personal_details(auth_id)
);

-- Add team_id FK after teams table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'hacklabs_personal_details_team_id_fkey'
  ) THEN
    ALTER TABLE public.hacklabs_personal_details
      ADD CONSTRAINT hacklabs_personal_details_team_id_fkey
        FOREIGN KEY (team_id) REFERENCES public.hacklabs_teams(id);
  END IF;
END $$;

-- 2d. Academic info
CREATE TABLE IF NOT EXISTS public.hacklabs_academic_info (
  auth_id uuid NOT NULL,
  college_name text NOT NULL,
  degree text NOT NULL,
  branch text NOT NULL,
  year_of_study text NOT NULL,
  graduation_year text NOT NULL,
  CONSTRAINT hacklabs_academic_info_pkey PRIMARY KEY (auth_id),
  CONSTRAINT hacklabs_academic_info_auth_id_fkey
    FOREIGN KEY (auth_id) REFERENCES public.hacklabs_personal_details(auth_id) ON DELETE CASCADE
);

-- 2e. Technical info
CREATE TABLE IF NOT EXISTS public.hacklabs_technical_info (
  auth_id uuid NOT NULL,
  github_link text NOT NULL,
  linkedin text,
  portfolio text,
  resume_link text,
  CONSTRAINT hacklabs_technical_info_pkey PRIMARY KEY (auth_id),
  CONSTRAINT hacklabs_technical_info_auth_id_fkey
    FOREIGN KEY (auth_id) REFERENCES public.hacklabs_personal_details(auth_id) ON DELETE CASCADE
);

-- 2f. Invitations
CREATE TABLE IF NOT EXISTS public.hacklabs_invitations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  team_id uuid NOT NULL,
  participant_auth_id uuid NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT hacklabs_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT hacklabs_invitations_type_check
    CHECK (type = ANY (ARRAY['invite'::text, 'request'::text])),
  CONSTRAINT hacklabs_invitations_status_check
    CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  CONSTRAINT hacklabs_invitations_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES public.hacklabs_teams(id),
  CONSTRAINT hacklabs_invitations_participant_auth_id_fkey
    FOREIGN KEY (participant_auth_id) REFERENCES public.hacklabs_personal_details(auth_id)
);

-- 2g. Queries / contact form
CREATE TABLE IF NOT EXISTS public.hacklabs_queries (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  resolved boolean DEFAULT false,
  CONSTRAINT hacklabs_queries_pkey PRIMARY KEY (id)
);

-- 2h. Application drafts
CREATE TABLE IF NOT EXISTS public.hacklabs_application_drafts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  form_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT hacklabs_application_drafts_pkey PRIMARY KEY (id),
  CONSTRAINT hacklabs_application_drafts_user_id_key UNIQUE (user_id),
  CONSTRAINT hacklabs_application_drafts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);


-- =============================================================================
-- STEP 3: VIEWS
-- =============================================================================
CREATE OR REPLACE VIEW public.hacklabs_judge_view AS
SELECT
  p.auth_id, p.full_name, p.mobile_number, p.dob, p.gender,
  p.unique_user_code, p.email, p.created_at,
  a.college_name, a.degree, a.branch, a.year_of_study, a.graduation_year,
  t.github_link, t.linkedin, t.portfolio, t.resume_link,
  team.name AS team_name, team.unique_team_code, team.payment_status
FROM public.hacklabs_personal_details p
LEFT JOIN public.hacklabs_academic_info a ON p.auth_id = a.auth_id
LEFT JOIN public.hacklabs_technical_info t ON p.auth_id = t.auth_id
LEFT JOIN public.hacklabs_teams team ON p.team_id = team.id;

REVOKE ALL ON public.hacklabs_judge_view FROM anon, authenticated;


-- =============================================================================
-- STEP 4: RPC FUNCTIONS
-- =============================================================================

-- Checks hacklabs_personal_details NOT auth.users —
-- prevents blocking AntiLabs main-site users and allows ghost-account recovery
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.hacklabs_personal_details
    WHERE LOWER(email) = LOWER(TRIM(p_email))
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_hacklabs_judge()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.hacklabs_judges WHERE email = auth.email());
END;
$$;

CREATE OR REPLACE FUNCTION public.get_judge_data()
RETURNS SETOF public.hacklabs_judge_view LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.is_hacklabs_judge() THEN
    RAISE EXCEPTION 'Access Denied: You are not an authorized judge.';
  END IF;
  RETURN QUERY SELECT * FROM public.hacklabs_judge_view;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_hacklabs_drafts()
RETURNS SETOF public.hacklabs_application_drafts LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.is_hacklabs_judge() THEN
    RAISE EXCEPTION 'Access Denied: You are not an authorized judge.';
  END IF;
  RETURN QUERY SELECT * FROM public.hacklabs_application_drafts;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT team_id FROM public.hacklabs_personal_details WHERE auth_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.invite_user_by_code(target_user_code text, source_team_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
DECLARE
  target_auth_id uuid;
  target_team_id uuid;
BEGIN
  SELECT auth_id, team_id INTO target_auth_id, target_team_id
  FROM public.hacklabs_personal_details WHERE unique_user_code = target_user_code;

  IF target_auth_id IS NULL THEN RAISE EXCEPTION 'Invalid User Code.'; END IF;
  IF target_team_id IS NOT NULL THEN RAISE EXCEPTION 'This user is already part of a team.'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.hacklabs_invitations
    WHERE team_id = source_team_id AND participant_auth_id = target_auth_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A pending invitation or request already exists for this user.';
  END IF;

  INSERT INTO public.hacklabs_invitations (team_id, participant_auth_id, type, status)
  VALUES (source_team_id, target_auth_id, 'invite', 'pending');
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_hacklabs_invite(invite_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
DECLARE inv record;
BEGIN
  SELECT * INTO inv FROM public.hacklabs_invitations WHERE id = invite_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invite not found'; END IF;
  IF inv.status != 'pending' THEN RAISE EXCEPTION 'This invitation is no longer pending.'; END IF;

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

CREATE OR REPLACE FUNCTION public.preview_team_by_code(p_team_code text)
RETURNS TABLE(id uuid, name text, unique_team_code text, captain_name text, member_names text[])
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.unique_team_code, c.full_name AS captain_name,
    ARRAY(
      SELECT p.full_name FROM public.hacklabs_personal_details p
      WHERE p.team_id = t.id AND p.auth_id != t.captain_id
    ) AS member_names
  FROM public.hacklabs_teams t
  LEFT JOIN public.hacklabs_personal_details c ON t.captain_id = c.auth_id
  WHERE t.unique_team_code = p_team_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_password(new_password text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = auth.uid();
END;
$$;


-- =============================================================================
-- STEP 5: ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.hacklabs_personal_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own data, team members, and pending invites" ON public.hacklabs_personal_details;
CREATE POLICY "Users can view own data, team members, and pending invites"
  ON public.hacklabs_personal_details FOR SELECT USING (
    auth_id = auth.uid()
    OR (team_id IS NOT NULL AND team_id = public.get_user_team_id())
    OR EXISTS (SELECT 1 FROM public.hacklabs_invitations
               WHERE participant_auth_id = auth_id AND team_id = public.get_user_team_id())
  );
DROP POLICY IF EXISTS "Users can update own personal details" ON public.hacklabs_personal_details;
CREATE POLICY "Users can update own personal details"
  ON public.hacklabs_personal_details FOR UPDATE USING (auth.uid() = auth_id);
DROP POLICY IF EXISTS "Users can insert own personal details" ON public.hacklabs_personal_details;
CREATE POLICY "Users can insert own personal details"
  ON public.hacklabs_personal_details FOR INSERT WITH CHECK (auth.uid() = auth_id);

ALTER TABLE public.hacklabs_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.hacklabs_teams;
CREATE POLICY "Teams are viewable by everyone" ON public.hacklabs_teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Captains can update teams" ON public.hacklabs_teams;
CREATE POLICY "Captains can update teams" ON public.hacklabs_teams FOR UPDATE USING (captain_id = auth.uid());
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.hacklabs_teams;
CREATE POLICY "Authenticated users can create teams" ON public.hacklabs_teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE public.hacklabs_academic_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict view policy for academic info" ON public.hacklabs_academic_info;
CREATE POLICY "Strict view policy for academic info" ON public.hacklabs_academic_info FOR SELECT
  USING (auth_id = auth.uid() OR public.is_hacklabs_judge());
DROP POLICY IF EXISTS "Users can update own academic info" ON public.hacklabs_academic_info;
CREATE POLICY "Users can update own academic info" ON public.hacklabs_academic_info FOR UPDATE USING (auth.uid() = auth_id);
DROP POLICY IF EXISTS "Users can insert own academic info" ON public.hacklabs_academic_info;
CREATE POLICY "Users can insert own academic info" ON public.hacklabs_academic_info FOR INSERT WITH CHECK (auth.uid() = auth_id);

ALTER TABLE public.hacklabs_technical_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict view policy for technical info" ON public.hacklabs_technical_info;
CREATE POLICY "Strict view policy for technical info" ON public.hacklabs_technical_info FOR SELECT
  USING (auth_id = auth.uid() OR public.is_hacklabs_judge());
DROP POLICY IF EXISTS "Users can update own technical info" ON public.hacklabs_technical_info;
CREATE POLICY "Users can update own technical info" ON public.hacklabs_technical_info FOR UPDATE USING (auth.uid() = auth_id);
DROP POLICY IF EXISTS "Users can insert own technical info" ON public.hacklabs_technical_info;
CREATE POLICY "Users can insert own technical info" ON public.hacklabs_technical_info FOR INSERT WITH CHECK (auth.uid() = auth_id);

ALTER TABLE public.hacklabs_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own or team invites" ON public.hacklabs_invitations;
CREATE POLICY "Users can view own or team invites" ON public.hacklabs_invitations FOR SELECT
  USING (participant_auth_id = auth.uid() OR team_id = public.get_user_team_id());
DROP POLICY IF EXISTS "Users can insert own requests or captain invites" ON public.hacklabs_invitations;
CREATE POLICY "Users can insert own requests or captain invites" ON public.hacklabs_invitations FOR INSERT
  WITH CHECK (
    (type = 'request' AND participant_auth_id = auth.uid())
    OR (type = 'invite' AND EXISTS (
      SELECT 1 FROM public.hacklabs_teams WHERE id = team_id AND captain_id = auth.uid()
    ))
  );

ALTER TABLE public.hacklabs_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert queries" ON public.hacklabs_queries;
CREATE POLICY "Anyone can insert queries" ON public.hacklabs_queries FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Only judges can view queries" ON public.hacklabs_queries;
CREATE POLICY "Only judges can view queries" ON public.hacklabs_queries FOR SELECT USING (public.is_hacklabs_judge());
DROP POLICY IF EXISTS "Only judges can update queries" ON public.hacklabs_queries;
CREATE POLICY "Only judges can update queries" ON public.hacklabs_queries FOR UPDATE USING (public.is_hacklabs_judge());
DROP POLICY IF EXISTS "Only judges can delete queries" ON public.hacklabs_queries;
CREATE POLICY "Only judges can delete queries" ON public.hacklabs_queries FOR DELETE USING (public.is_hacklabs_judge());

ALTER TABLE public.hacklabs_judges ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.hacklabs_application_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own drafts" ON public.hacklabs_application_drafts;
CREATE POLICY "Users can insert own drafts" ON public.hacklabs_application_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own drafts" ON public.hacklabs_application_drafts;
CREATE POLICY "Users can update own drafts" ON public.hacklabs_application_drafts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Judges can view all drafts" ON public.hacklabs_application_drafts;
CREATE POLICY "Judges can view all drafts" ON public.hacklabs_application_drafts FOR SELECT USING (public.is_hacklabs_judge());


-- =============================================================================
-- STEP 6: FUNCTION GRANTS
-- =============================================================================
REVOKE ALL ON FUNCTION public.get_judge_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_judge_data() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_hacklabs_drafts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_hacklabs_drafts() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_hacklabs_judge() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_hacklabs_judge() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_user_team_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_team_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.invite_user_by_code(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_user_by_code(text, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.accept_hacklabs_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_hacklabs_invite(uuid) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.preview_team_by_code(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_password(text) TO authenticated, service_role;

-- =============================================================================
-- DONE. All HackLabs tables, policies, and functions are now live.
-- The main AntiLabs tables and users remain completely untouched.
-- =============================================================================
