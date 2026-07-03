-- 1. Add roll_number and batch_id to training_registrations
ALTER TABLE public.training_registrations
ADD COLUMN IF NOT EXISTS roll_number character varying,
ADD COLUMN IF NOT EXISTS batch_id integer;

-- 2. Create Batches table
CREATE TABLE IF NOT EXISTS public.batches (
    batch_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    role_id integer NOT NULL,
    batch_number integer NOT NULL,
    capacity integer NOT NULL DEFAULT 30,
    current_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT batches_pkey PRIMARY KEY (batch_id),
    CONSTRAINT batches_role_id_fkey FOREIGN KEY (role_id) REFERENCES public."Careers"(posting_id)
);

-- 3. Add course_code to Careers if not exists
ALTER TABLE public."Careers"
ADD COLUMN IF NOT EXISTS course_code character varying;

-- Provide some defaults for course_code
UPDATE public."Careers" SET course_code = 'FSDEV' WHERE title ILIKE '%full stack%' AND course_code IS NULL;
UPDATE public."Careers" SET course_code = 'ML' WHERE title ILIKE '%machine learning%' AND course_code IS NULL;
UPDATE public."Careers" SET course_code = 'PY' WHERE title ILIKE '%python%' AND course_code IS NULL;
UPDATE public."Careers" SET course_code = UPPER(SUBSTRING(REGEXP_REPLACE(title, '[^a-zA-Z]', '', 'g'), 1, 3)) WHERE course_code IS NULL;

-- 4. Create an RPC function to process payment and assign batch atomically
CREATE OR REPLACE FUNCTION assign_batch_and_roll_number(
    p_transaction_id integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role_id integer;
    v_email character varying;
    v_course_code character varying;
    v_batch_record RECORD;
    v_roll_number character varying;
    v_new_batch_number integer;
    v_training_reg_id integer;
    v_title text;
BEGIN
    -- Get the transaction info
    SELECT role_id, email INTO v_role_id, v_email
    FROM public.transactions
    WHERE transaction_id = p_transaction_id;

    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Transaction not found';
    END IF;

    -- Check if training_registration already exists and has a roll number
    SELECT registration_id, roll_number INTO v_training_reg_id, v_roll_number
    FROM public.training_registrations
    WHERE email = v_email AND role_id = v_role_id;

    IF v_roll_number IS NOT NULL THEN
        RETURN v_roll_number;
    END IF;

    -- Get the course code
    SELECT course_code, title INTO v_course_code, v_title
    FROM public."Careers"
    WHERE posting_id = v_role_id;

    IF v_course_code IS NULL THEN
        v_course_code := UPPER(SUBSTRING(REGEXP_REPLACE(v_title, '[^a-zA-Z]', '', 'g'), 1, 3));
    END IF;

    -- Find an open batch for this role
    SELECT * INTO v_batch_record
    FROM public.batches
    WHERE role_id = v_role_id AND current_count < capacity
    ORDER BY batch_number ASC
    LIMIT 1
    FOR UPDATE;

    -- If no open batch, create a new one
    IF NOT FOUND THEN
        SELECT COALESCE(MAX(batch_number), 0) + 1 INTO v_new_batch_number
        FROM public.batches
        WHERE role_id = v_role_id;

        INSERT INTO public.batches (role_id, batch_number, capacity, current_count)
        VALUES (v_role_id, v_new_batch_number, 30, 0)
        RETURNING * INTO v_batch_record;
    END IF;

    -- Increment batch count
    UPDATE public.batches
    SET current_count = current_count + 1
    WHERE batch_id = v_batch_record.batch_id;

    -- Generate roll number
    -- Format: Batch_number-courseCode-serielNumber
    v_roll_number := v_batch_record.batch_number || '-' || v_course_code || '-' || (v_batch_record.current_count + 1);

    -- Insert or update training_registrations
    IF v_training_reg_id IS NULL THEN
        INSERT INTO public.training_registrations (
            user_id, position, role_id, full_name, mobile_number, email, 
            university_name, college_name, current_year, degree_pursuing, branch, 
            graduation_year, college_proof_url, resume_url, fees_amount, 
            payment_status, roll_number, batch_id
        )
        SELECT 
            user_id, position, role_id, full_name, mobile_number, email, 
            university_name, college_name, current_year, degree_pursuing, branch, 
            graduation_year, college_proof_url, resume_url, fees_amount, 
            'paid', v_roll_number, v_batch_record.batch_id
        FROM public.transactions
        WHERE transaction_id = p_transaction_id;
    ELSE
        UPDATE public.training_registrations
        SET roll_number = v_roll_number, batch_id = v_batch_record.batch_id
        WHERE registration_id = v_training_reg_id;
    END IF;

    RETURN v_roll_number;
END;
$$;

-- 5. Backfill existing paid students
-- This will loop through all existing paid transactions in chronological order 
-- and assign them batches and roll numbers using the function we just created.
DO $$
DECLARE
    tx RECORD;
BEGIN
    FOR tx IN 
        SELECT transaction_id 
        FROM public.transactions 
        WHERE payment_status = 'paid'
        ORDER BY created_at ASC
    LOOP
        -- This calls our RPC, which will find or create a batch, 
        -- generate the roll number, and update/insert the training_registrations table.
        PERFORM public.assign_batch_and_roll_number(tx.transaction_id);
    END LOOP;
END;
$$;

