-- Create a secure RPC function to check if an email is already registered.
-- This function runs with SECURITY DEFINER privileges to bypass RLS, but only exposes a boolean result.
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE LOWER(email) = LOWER(TRIM(p_email))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;