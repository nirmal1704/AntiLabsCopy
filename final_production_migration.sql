ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow admin full access to blogs" ON public.blogs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.blogs;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.blogs;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.blogs;
CREATE POLICY "Public select blogs" ON public.blogs FOR SELECT USING (true);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select batches" ON public.batches;
CREATE POLICY "Public select batches" ON public.batches FOR SELECT USING (true);

ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select lectures" ON public.lectures;
CREATE POLICY "Public select lectures" ON public.lectures FOR SELECT USING (true);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select sections" ON public.sections;
CREATE POLICY "Public select sections" ON public.sections FOR SELECT USING (true);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select referral_codes" ON public.referral_codes;
CREATE POLICY "Public select referral_codes" ON public.referral_codes FOR SELECT USING (true);

ALTER TABLE public."Careers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON public."Careers";
DROP POLICY IF EXISTS anon_delete ON public."Careers";
DROP POLICY IF EXISTS anon_insert ON public."Careers";
DROP POLICY IF EXISTS anon_select ON public."Careers";
DROP POLICY IF EXISTS anon_update ON public."Careers";
DROP POLICY IF EXISTS "Public select Careers" ON public."Careers";
CREATE POLICY "Public select Careers" ON public."Careers" FOR SELECT USING (true);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon delete on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow anon insert on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow anon update on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access on testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access on testimonials" ON public.testimonials FOR SELECT USING (true);

ALTER TABLE public.enquiry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read" ON public.enquiry;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.enquiry;
DROP POLICY IF EXISTS anon_delete ON public.enquiry;
DROP POLICY IF EXISTS anon_insert ON public.enquiry;
DROP POLICY IF EXISTS anon_select ON public.enquiry;
DROP POLICY IF EXISTS anon_update ON public.enquiry;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.enquiry;
CREATE POLICY "Allow anonymous inserts" ON public.enquiry FOR INSERT WITH CHECK (true);

ALTER TABLE public.ca_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert ca_registrations" ON public.ca_registrations;
CREATE POLICY "Public insert ca_registrations" ON public.ca_registrations FOR INSERT WITH CHECK (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own profile" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users view own profile" ON public.users FOR SELECT USING (auth_id = (select auth.uid()));
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth_id = (select auth.uid()));

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (student_email = (select auth.jwt() ->> 'email'));

ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own drafts" ON public.application_drafts;
CREATE POLICY "Users manage own drafts" ON public.application_drafts FOR ALL USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
CREATE POLICY "Users insert transactions" ON public.transactions FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (user_id = (select auth.uid()));

ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own training_registrations" ON public.training_registrations;
CREATE POLICY "Users view own training_registrations" ON public.training_registrations FOR SELECT USING (user_id = (select auth.uid()));

ALTER TABLE public."Student_Queries" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read" ON public."Student_Queries";
DROP POLICY IF EXISTS "Allow anon update" ON public."Student_Queries";
DROP POLICY IF EXISTS "Users can insert their own queries" ON public."Student_Queries";
DROP POLICY IF EXISTS "Users can view their own queries" ON public."Student_Queries";
CREATE POLICY "Users can insert their own queries" ON public."Student_Queries" FOR INSERT WITH CHECK (user_id = (SELECT user_id FROM public.users WHERE auth_id = (select auth.uid())));
CREATE POLICY "Users can view their own queries" ON public."Student_Queries" FOR SELECT USING (user_id = (SELECT user_id FROM public.users WHERE auth_id = (select auth.uid())));

ALTER TABLE public.capstone_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access to capstone_projects" ON public.capstone_projects;
DROP POLICY IF EXISTS "Public read capstone_projects" ON public.capstone_projects;
CREATE POLICY "Public read capstone_projects" ON public.capstone_projects FOR SELECT USING (true);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access to quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Public read quizzes" ON public.quizzes;
CREATE POLICY "Public read quizzes" ON public.quizzes FOR SELECT USING (true);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own quiz_submissions" ON public.quiz_submissions;
DROP POLICY IF EXISTS "Users view own quiz_submissions" ON public.quiz_submissions;
CREATE POLICY "Users view own quiz_submissions" ON public.quiz_submissions FOR SELECT USING (user_id = (SELECT user_id FROM public.users WHERE auth_id = (select auth.uid())));

ALTER TABLE public.capstone_project_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own capstone_project_submissions" ON public.capstone_project_submissions;
DROP POLICY IF EXISTS "Users view own capstone_project_submissions" ON public.capstone_project_submissions;
CREATE POLICY "Users view own capstone_project_submissions" ON public.capstone_project_submissions FOR SELECT USING (user_id = (SELECT user_id FROM public.users WHERE auth_id = (select auth.uid())));

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users view own user_progress" ON public.user_progress;
CREATE POLICY "Users view own user_progress" ON public.user_progress FOR SELECT USING (user_id = (SELECT user_id FROM public.users WHERE auth_id = (select auth.uid())));

CREATE OR REPLACE FUNCTION public.assign_batch_and_roll_number(p_transaction_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx RECORD;
    v_batch_id BIGINT;
    v_batch_code VARCHAR;
    v_prefix VARCHAR;
    v_current_count INTEGER;
    v_new_roll_number VARCHAR;
    v_existing_reg BOOLEAN;
BEGIN
    SELECT * INTO v_tx
    FROM public.transactions
    WHERE transaction_id = p_transaction_id AND payment_status = 'paid';

    IF v_tx IS NULL THEN
        RAISE EXCEPTION 'Transaction not found or not paid';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.training_registrations WHERE email = v_tx.email
    ) INTO v_existing_reg;

    IF v_existing_reg THEN
        RETURN;
    END IF;

    SELECT batch_id, batch_code INTO v_batch_id, v_batch_code
    FROM public.batches
    WHERE status = 'upcoming'
    ORDER BY start_date ASC
    LIMIT 1;

    IF v_batch_id IS NULL THEN
        RAISE EXCEPTION 'No upcoming batches available';
    END IF;

    v_prefix := v_batch_code || '-';

    SELECT COUNT(*) INTO v_current_count
    FROM public.training_registrations
    WHERE batch_id = v_batch_id;

    v_new_roll_number := v_prefix || LPAD((v_current_count + 1)::TEXT, 3, '0');

    INSERT INTO public.training_registrations (
        user_id, role_id, batch_id, position, roll_number, full_name,
        university_name, college_name, current_year, degree_pursuing, branch,
        graduation_year, mobile_number, email, college_proof_url, resume_url,
        fees_amount, payment_status
    ) VALUES (
        v_tx.user_id, v_tx.role_id, v_batch_id, v_tx.position, v_new_roll_number, v_tx.full_name,
        v_tx.university_name, v_tx.college_name, v_tx.current_year, v_tx.degree_pursuing, v_tx.branch,
        v_tx.graduation_year, v_tx.mobile_number, v_tx.email, v_tx.college_proof_url, v_tx.resume_url,
        v_tx.fees_amount, 'paid'
    );
END;
$$;

CREATE OR REPLACE FUNCTION submit_capstone_project(
    p_project_id BIGINT,
    p_career_id BIGINT,
    p_github_url TEXT,
    p_deployed_url TEXT,
    p_acknowledgement BOOLEAN
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id INTEGER;
    v_name VARCHAR;
    v_email VARCHAR;
BEGIN
    SELECT user_id, name, email INTO v_user_id, v_name, v_email
    FROM public.users WHERE auth_id = auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    INSERT INTO public.capstone_project_submissions (
        user_id, project_id, career_id, student_name, student_email,
        github_url, deployed_url, acknowledgement, status
    ) VALUES (
        v_user_id, p_project_id, p_career_id, v_name, v_email,
        p_github_url, p_deployed_url, p_acknowledgement, 'Pending Review'
    );
END;
$$;

CREATE OR REPLACE FUNCTION mark_lecture_complete(p_lecture_id BIGINT) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    SELECT user_id INTO v_user_id FROM public.users WHERE auth_id = auth.uid();
    
    IF v_user_id IS NULL THEN 
        RAISE EXCEPTION 'Not authenticated'; 
    END IF;

    INSERT INTO public.user_progress (user_id, lecture_id, completed)
    VALUES (v_user_id, p_lecture_id, true)
    ON CONFLICT (user_id, lecture_id) DO UPDATE SET completed = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (auth_id, name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_user_account(p_auth_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
BEGIN
    IF auth.uid() != p_auth_id THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT email INTO v_email FROM auth.users WHERE id = p_auth_id;

    IF v_email IS NULL THEN
        RAISE EXCEPTION 'User email not found';
    END IF;

    UPDATE public.transactions SET user_id = (SELECT user_id FROM public.users WHERE auth_id = p_auth_id) WHERE email = v_email AND user_id IS NULL;
    UPDATE public.training_registrations SET user_id = (SELECT user_id FROM public.users WHERE auth_id = p_auth_id) WHERE email = v_email AND user_id IS NULL;
    UPDATE public.invoices SET user_id = (SELECT user_id FROM public.users WHERE auth_id = p_auth_id) WHERE student_email = v_email AND user_id IS NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.assign_batch_and_roll_number(BIGINT) FROM public;
REVOKE EXECUTE ON FUNCTION public.assign_batch_and_roll_number(BIGINT) FROM anon;

REVOKE EXECUTE ON FUNCTION submit_capstone_project(BIGINT, BIGINT, TEXT, TEXT, BOOLEAN) FROM public;
REVOKE EXECUTE ON FUNCTION submit_capstone_project(BIGINT, BIGINT, TEXT, TEXT, BOOLEAN) FROM anon;

REVOKE EXECUTE ON FUNCTION mark_lecture_complete(BIGINT) FROM public;
REVOKE EXECUTE ON FUNCTION mark_lecture_complete(BIGINT) FROM anon;

REVOKE EXECUTE ON FUNCTION link_user_account(UUID) FROM public;
REVOKE EXECUTE ON FUNCTION link_user_account(UUID) FROM anon;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
