-- ============================================================
-- FIX: Update null user_ids in training_registrations
-- by matching with the correct user_id from transactions
-- ============================================================

-- 1. Fix null user_ids (main fix)
UPDATE public.training_registrations r
SET user_id = t.user_id
FROM public.transactions t
WHERE r.email   = t.email
  AND r.role_id = t.role_id
  AND r.user_id IS NULL
  AND t.user_id IS NOT NULL;

-- 2. Verify — should show no nulls now
SELECT registration_id, user_id, email, role_id, payment_status
FROM public.training_registrations
WHERE payment_status = 'paid'
ORDER BY created_at DESC;

-- ============================================================
-- ALSO FIX: Update trigger to always sync user_id on conflict
-- If somehow a registration already exists with null user_id,
-- the trigger will now update it instead of skipping
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_paid_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS DISTINCT FROM 'paid') THEN

    -- If row already exists, update user_id if it was null
    UPDATE public.training_registrations
    SET user_id = NEW.user_id
    WHERE email   = NEW.email
      AND role_id = NEW.role_id
      AND user_id IS NULL
      AND NEW.user_id IS NOT NULL;

    -- Insert only if no row exists for this email + role_id
    INSERT INTO public.training_registrations (
      user_id, role_id, position, full_name, university_name, college_name,
      current_year, degree_pursuing, branch, graduation_year, mobile_number,
      email, college_proof_url, resume_url, fees_amount, payment_status
    )
    SELECT
      NEW.user_id, NEW.role_id, NEW.position, NEW.full_name, NEW.university_name,
      NEW.college_name, NEW.current_year, NEW.degree_pursuing, NEW.branch,
      NEW.graduation_year, NEW.mobile_number, NEW.email, NEW.college_proof_url,
      NEW.resume_url, NEW.fees_amount, 'paid'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.training_registrations
      WHERE email   = NEW.email
        AND role_id = NEW.role_id
    );

  END IF;
  RETURN NEW;
END;
$$;
