-- Hacklabs Judge Addition Script
-- Use this script to quickly and professionally authorize new judges for the platform.
-- Authorized judges can view the judge dashboard and bypass the registration process.

-- Add a new judge (Uncomment and replace with actual email)
-- INSERT INTO public.hacklabs_judges (email) VALUES ('judge_name@antilabs.in');

-- Add multiple judges at once (Uncomment and replace with actual emails)
/*
INSERT INTO public.hacklabs_judges (email) 
VALUES 
  ('judge1@antilabs.in'),
  ('judge2@antilabs.in'),
  ('guestjudge@university.edu')
ON CONFLICT (email) DO NOTHING;
*/

-- View all currently authorized judges
-- SELECT * FROM public.hacklabs_judges ORDER BY created_at DESC;
