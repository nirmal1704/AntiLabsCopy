-- 1. Add a unique constraint to the phone_number column in the users table
-- Note: If you already have duplicate phone numbers in your database, you will need to resolve those before this command will succeed.
ALTER TABLE public.users
ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);
