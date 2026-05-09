-- ============================================================
-- Antilabs: Invoices Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    invoice_id        SERIAL PRIMARY KEY,
    invoice_number    VARCHAR(50) UNIQUE NOT NULL,
    transaction_id    INTEGER REFERENCES public.transactions(transaction_id) ON DELETE SET NULL,
    student_name      VARCHAR(255),
    student_email     VARCHAR(255),
    program_name      VARCHAR(255),
    fees_amount       DECIMAL(10, 2),
    subtotal          DECIMAL(10, 2),
    tax_amount        DECIMAL(10, 2),
    grand_total       DECIMAL(10, 2),
    payment_method    VARCHAR(100) DEFAULT 'Online (Cashfree)',
    roll_number       VARCHAR(100),
    batch_name        VARCHAR(255),
    email_sent        BOOLEAN DEFAULT FALSE,
    email_sent_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by transaction or email
CREATE INDEX IF NOT EXISTS idx_invoices_transaction_id ON public.invoices(transaction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_email   ON public.invoices(student_email);

-- RLS: allow service role full access; anon can only read their own
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage invoices"
    ON public.invoices FOR ALL
    USING (auth.role() = 'service_role');

-- Optional: allow authenticated users to view invoices by their email
-- (uncomment if needed)
-- CREATE POLICY "Students can view own invoices"
--     ON public.invoices FOR SELECT
--     USING (student_email = current_user);

COMMENT ON TABLE public.invoices IS 'Stores generated invoices and tracks email delivery status. Used to prevent duplicate emails on double payment verification.';
