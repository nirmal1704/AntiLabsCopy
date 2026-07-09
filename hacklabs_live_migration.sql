-- Hacklabs Live Migration Script
-- This script adds the necessary functions for the secure forgot password flow.
-- It is completely safe to run on a live database and will NOT drop any data.

-- 1. Ensure pgcrypto is enabled (needed for secure password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the secure password update RPC
CREATE OR REPLACE FUNCTION public.update_user_password(new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only the authenticated user can update their own password
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = auth.uid();
END;
$$;

-- Note: Ensure that the 'auth.users' table structure hasn't changed.
-- This function relies on 'encrypted_password' column and 'auth.uid()' function.
