-- ============================================================
-- Capstone Project Submissions Table
-- Stores user submissions for capstone projects.
-- ============================================================

DROP TABLE IF EXISTS public.capstone_project_submissions CASCADE;

CREATE TABLE IF NOT EXISTS public.capstone_project_submissions (
    submission_id   bigserial PRIMARY KEY,
    user_id         integer NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    project_id      bigint NOT NULL REFERENCES public.capstone_projects(project_id) ON DELETE CASCADE,
    career_id       bigint NOT NULL REFERENCES public."Careers"(posting_id) ON DELETE CASCADE,
    
    -- Student Details (Captured at time of submission or read directly from users, but good to store snapshotted context if needed)
    student_name    character varying NOT NULL,
    student_email   character varying NOT NULL,
    
    -- Project Links
    github_url      text NOT NULL,
    deployed_url    text NOT NULL,
    
    -- Legal / Acknowledgement
    acknowledgement boolean NOT NULL DEFAULT false,
    
    -- Review Status
    status          text NOT NULL DEFAULT 'Pending Review' CHECK (status = ANY (ARRAY['Pending Review', 'Approved', 'Needs Changes'])),
    feedback        text,
    
    submitted_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups per user and project
CREATE INDEX IF NOT EXISTS idx_capstone_submissions_user_id ON public.capstone_project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_capstone_submissions_project_id  ON public.capstone_project_submissions(project_id);

-- Disable RLS because this application uses a custom users table and custom auth
ALTER TABLE public.capstone_project_submissions DISABLE ROW LEVEL SECURITY;
