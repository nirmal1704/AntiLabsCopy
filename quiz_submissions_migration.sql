-- ============================================================
-- Quiz Submissions Table
-- Stores each quiz attempt by a user.
-- Minimum 80% score required to pass (used to unlock next section).
-- ============================================================

DROP TABLE IF EXISTS public.quiz_submissions CASCADE;

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    submission_id   bigserial PRIMARY KEY,
    user_id         integer NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    quiz_id         bigint NOT NULL REFERENCES public.quizzes(quiz_id) ON DELETE CASCADE,
    section_id      bigint NOT NULL REFERENCES public.sections(section_id) ON DELETE CASCADE,
    score           integer NOT NULL,           -- number of correct answers
    total_questions integer NOT NULL,           -- total questions in quiz
    percentage      numeric(5, 2) NOT NULL,     -- score / total_questions * 100
    passed          boolean NOT NULL GENERATED ALWAYS AS (percentage >= 80) STORED,
    answers         jsonb,                      -- optional: store the answers selected {question_index: chosen_option}
    submitted_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups per user
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id  ON public.quiz_submissions(quiz_id);

-- Disable RLS because this application uses a custom users table and custom auth
-- (Supabase anon key is used for client-side queries)
ALTER TABLE public.quiz_submissions DISABLE ROW LEVEL SECURITY;

