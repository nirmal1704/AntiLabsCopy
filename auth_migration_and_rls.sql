-- STEP 1: Link public.users to Supabase Auth
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE REFERENCES auth.users(id);

-- STEP 2: Migrate existing users into Supabase Auth
-- This securely hashes their plain-text passwords and moves them to the secure auth.users system
DO $$ 
DECLARE
  u RECORD;
  existing_auth_id UUID;
  new_auth_id UUID;
BEGIN
  FOR u IN SELECT * FROM public.users WHERE auth_id IS NULL LOOP
    
    -- Check if the email already exists in auth.users from a previous attempt
    SELECT id INTO existing_auth_id FROM auth.users WHERE email = u.email LIMIT 1;
    
    BEGIN
      IF existing_auth_id IS NOT NULL THEN
        -- User already in auth.users, just link them
        UPDATE public.users SET auth_id = existing_auth_id WHERE user_id = u.user_id;
      ELSE
        -- Create a new auth.users record
        new_auth_id := gen_random_uuid();
        
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', 
          new_auth_id, 
          'authenticated', 
          'authenticated', 
          u.email, 
          crypt(u.password, gen_salt('bf')), 
          now(), 
          '{"provider":"email","providers":["email"]}',
          jsonb_build_object('name', u.name, 'phone', u.phone_number), 
          COALESCE(u.created_at, now()), 
          now()
        );

        UPDATE public.users SET auth_id = new_auth_id WHERE user_id = u.user_id;
      END IF;
    EXCEPTION WHEN unique_violation THEN
      -- Handle cases where public.users has duplicate emails. 
      -- The first one links successfully, the duplicate throws a unique violation on auth_id.
      RAISE NOTICE 'Skipping user_id % due to duplicate email or phone %', u.user_id, u.email;
    END;

  END LOOP;
END $$;

-- STEP 3: Auto-create public profile for NEW users going forward
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  _age integer;
BEGIN
  -- Safely cast age, defaulting to NULL if blank or invalid
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 4: Secure the public.users table with Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view ONLY their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = auth_id);

-- Allow users to update ONLY their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = auth_id);

-- (Optional) If you want admins to see all profiles, you can add an admin policy later.
