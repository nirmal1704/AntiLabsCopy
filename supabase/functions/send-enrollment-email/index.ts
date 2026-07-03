import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateEmail(d: {
  student_name: string; program_name: string; roll_number?: string; batch_name?: string;
  invoice_number: string; fees_amount: number; base_amount: number; tax_amount: number;
  enrollment_date: string; invoice_date: string; student_phone: string; student_address: string;
  transaction_id: string | number; payment_method: string;
}): string {
  const fmt = (n: number) => `&#8377;${n.toLocaleString("en-IN")}`;
  const fees = fmt(d.fees_amount), base = fmt(d.base_amount), tax = fmt(d.tax_amount);

  const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

  const card = (label: string, value: string) =>
    `<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;padding:16px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${label}</div>
      <div style="font-family:${FONT};font-size:16px;font-weight:700;color:#0f172a;">${value}</div>
    </td></tr></table>`;

  const rollCard  = d.roll_number ? card("Roll Number", d.roll_number) : "";
  const batchCard = d.batch_name  ? card("Batch", d.batch_name) : "";

  const topRow = (rollCard || batchCard) ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
      <td width="50%" style="padding-right:8px;vertical-align:top;">${rollCard}</td>
      <td width="50%" style="padding-left:8px;vertical-align:top;">${batchCard}</td>
    </tr></table>` : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Antilabs Enrollment</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f7fb;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">

  <!-- HEADER -->
  <tr><td style="background:#0a3d91;padding:40px;text-align:center;">
    <div style="font-family:${FONT};font-size:24px;font-weight:700;color:#ffffff;letter-spacing:4px;">ANTILABS</div>
    <div style="font-family:${FONT};font-size:10px;color:#93c5fd;letter-spacing:3px;margin-top:6px;text-transform:uppercase;">Training &amp; Internships</div>
  </td></tr>

  <!-- WELCOME -->
  <tr><td style="padding:40px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:30px;">
      <div style="font-family:${FONT};font-size:12px;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Enrollment Confirmed</div>
      <h1 style="font-family:${FONT};font-size:24px;font-weight:700;color:#0f172a;margin:0 0 12px;">Welcome, ${d.student_name}</h1>
      <p style="font-family:${FONT};font-size:15px;color:#475569;margin:0;line-height:1.6;">Your enrollment in <strong>${d.program_name}</strong> is confirmed. We are excited to have you onboard.</p>
    </td></tr></table>

    ${topRow}

    <!-- Amount + Date cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr>
      <td width="50%" style="padding-right:8px;vertical-align:top;">
        ${card("Amount Paid", fees)}
      </td>
      <td width="50%" style="padding-left:8px;vertical-align:top;">
        ${card("Enrolled On", d.enrollment_date)}
      </td>
    </tr></table>

    <!-- Next Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;"><tr>
      <td style="border:1px solid #e2e8f0;border-left:4px solid #2563eb;background:#ffffff;padding:24px;">
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:#0f172a;margin-bottom:16px;">Next Steps</div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${[
            "Please review the attached <strong>Instructions PDF</strong> for details and timelines.",
            "Log in to <strong>antilabs.in/profile</strong> to access your Student Dashboard.",
            "You will receive an email regarding batch schedules and resources shortly.",
          ].map((s) => `<tr>
            <td width="16" valign="top" style="padding-bottom:12px;"><div style="width:6px;height:6px;background:#2563eb;border-radius:50%;margin-top:7px;"></div></td>
            <td style="font-family:${FONT};font-size:14px;color:#475569;line-height:1.6;padding-bottom:12px;">${s}</td>
          </tr>`).join("")}
        </table>
      </td>
    </tr></table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td align="center">
      <a href="https://antilabs.in/profile" style="display:inline-block;background:#0a3d91;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-family:${FONT};font-size:14px;font-weight:600;">Access Student Dashboard</a>
    </td></tr></table>
  </td></tr>

  <!-- INVOICE SECTION -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 0 24px;">
      <div style="font-family:${FONT};font-size:16px;font-weight:700;color:#0f172a;margin-bottom:4px;">Payment Invoice</div>
      <div style="font-family:${FONT};font-size:13px;color:#64748b;">Invoice No: ${d.invoice_number} &nbsp;|&nbsp; Date: ${d.invoice_date}</div>
    </td></tr></table>
  </td></tr>

  <!-- BILL TO / FROM -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" valign="top" style="padding-bottom:24px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;margin-bottom:8px;">Billed To</div>
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px;">${d.student_name}</div>
        <div style="font-family:${FONT};font-size:13px;color:#475569;line-height:1.6;">${d.student_phone}<br>${d.student_address}</div>
      </td>
      <td width="50%" valign="top" align="right" style="padding-bottom:24px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;margin-bottom:8px;">From</div>
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px;">Antilabs</div>
        <div style="font-family:${FONT};font-size:13px;color:#475569;line-height:1.6;">onboarding@antilabs.in<br>India</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- ITEMS TABLE -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr>
        <th align="left" style="font-family:${FONT};font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #e2e8f0;">Description</th>
        <th align="center" style="font-family:${FONT};font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #e2e8f0;width:60px;">Qty</th>
        <th align="right" style="font-family:${FONT};font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;padding:12px 0;border-bottom:1px solid #e2e8f0;width:100px;">Amount</th>
      </tr>
      <tr>
        <td style="font-family:${FONT};padding:16px 0;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px;">${d.program_name}</div>
          <div style="font-size:13px;color:#64748b;">Training Program Enrollment</div>
          ${d.roll_number ? '<div style="font-size:12px;color:#2563eb;margin-top:4px;">Roll No: ' + d.roll_number + '</div>' : ''}
        </td>
        <td align="center" style="font-family:${FONT};font-size:14px;color:#475569;padding:16px 0;border-bottom:1px solid #e2e8f0;">1</td>
        <td align="right" style="font-family:${FONT};font-size:14px;color:#0f172a;padding:16px 0;border-bottom:1px solid #e2e8f0;">${base}</td>
      </tr>
    </table>
  </td></tr>

  <!-- TOTALS -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%">&nbsp;</td>
      <td width="50%" style="padding:16px 0;">
        <table width="100%" cellpadding="6" cellspacing="0" border="0">
          <tr>
            <td style="font-family:${FONT};font-size:13px;color:#64748b;padding:4px 0;">Subtotal</td>
            <td align="right" style="font-family:${FONT};font-size:14px;color:#0f172a;padding:4px 0;">${base}</td>
          </tr>
          <tr>
            <td style="font-family:${FONT};font-size:13px;color:#64748b;padding:4px 0;">GST (18%)</td>
            <td align="right" style="font-family:${FONT};font-size:14px;color:#0f172a;padding:4px 0;">${tax}</td>
          </tr>
          <tr>
            <td style="font-family:${FONT};font-size:14px;font-weight:700;color:#0f172a;padding:12px 0 0;border-top:1px solid #e2e8f0;margin-top:8px;">Total Paid</td>
            <td align="right" style="font-family:${FONT};font-size:16px;font-weight:700;color:#0f172a;padding:12px 0 0;border-top:1px solid #e2e8f0;margin-top:8px;">${fees}</td>
          </tr>
        </table>
      </td>
    </tr></table>
  </td></tr>

  <!-- PAYMENT INFO -->
  <tr><td style="padding:16px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;font-family:${FONT};font-size:13px;color:#475569;">
        <div style="font-weight:600;color:#0f172a;margin-bottom:6px;">Payment Details</div>
        Method: ${d.payment_method} &nbsp;&bull;&nbsp; Ref: TXN-${d.transaction_id}<br>
        Status: <strong style="color:#059669;">PAID</strong>
      </td>
    </tr></table>
  </td></tr>

  <!-- SEAL -->
  <tr><td style="padding:40px 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left" valign="middle">
        <img src="https://res.cloudinary.com/dhrntytra/image/upload/v1778999381/Seal_Antilabs_x0mvd0.png" alt="Antilabs Seal" style="width:360px;height:auto;display:block;margin-left:-100px;" />
      </td>
      <td align="right" valign="bottom">
        <div style="font-family:${FONT};font-size:16px;font-weight:600;color:#0f172a;margin-bottom:4px;">Antilabs</div>
        <div style="font-family:${FONT};font-size:13px;color:#64748b;">Authorized Signatory</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td align="center" style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
    <p style="font-family:${FONT};font-size:12px;color:#64748b;margin:0;line-height:1.6;">
      &copy; 2026 Antilabs. All rights reserved.<br>
      If you have any questions, please visit <a href="https://antilabs.in/profile" style="color:#2563eb;text-decoration:none;">antilabs.in/profile</a>.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

/* ─── Main Handler ───────────────────────────────────────── */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      student_name, student_email, student_phone, student_address,
      program_name, transaction_id, fees_amount, roll_number, batch_name, payment_method,
    } = body;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL   = Deno.env.get("SUPABASE_URL");
    const SUPABASE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured.");

    // ── Idempotency: skip if already sent ──────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/invoices?transaction_id=eq.${transaction_id}&email_sent=eq.true&select=invoice_id`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        console.log(`Invoice already sent for transaction ${transaction_id}. Skipping.`);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "already_sent" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // ── Build invoice data ──────────────────────────────────
    const now           = new Date();
    const invoiceDate   = now.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    const enrollDate    = now.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    const invoiceNumber = `ANTL-${now.getFullYear()}-${String(transaction_id).padStart(5, "0")}`;
    const feesNum       = Number(fees_amount) || 0;
    const baseAmount    = Math.round(feesNum / 1.18);
    const taxAmount     = feesNum - baseAmount;

    const emailHTML = generateEmail({
      student_name, program_name, roll_number, batch_name,
      invoice_number: invoiceNumber, fees_amount: feesNum,
      base_amount: baseAmount, tax_amount: taxAmount,
      enrollment_date: enrollDate, invoice_date: invoiceDate,
      student_phone: student_phone || "N/A",
      student_address: student_address || "India",
      transaction_id, payment_method: payment_method || "Online (Cashfree)",
    });

    // ── Fetch Instructions PDF ──────────────────────────────
    const attachments: Array<{ filename: string; content: string; type?: string }> = [];
    try {
      const pdfRes = await fetch("https://antilabs.in/AntiLabs_Training_Program_Instructions.pdf");
      if (pdfRes.ok) {
        const buf = await pdfRes.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = "";
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        attachments.push({ filename: "Antilabs_Training_Program_Instructions.pdf", content: btoa(bin), type: "application/pdf" });
      }
    } catch (e) { console.warn("PDF fetch failed:", e); }

    // ── Send via Resend ─────────────────────────────────────
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Antilabs <onboarding@antilabs.in>",
        to: [student_email],
        subject: `🎉 Welcome to Antilabs! Enrollment for "${program_name}" Confirmed`,
        html: emailHTML,
        attachments,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) throw new Error(resendData.message || "Resend error");

    // ── Store invoice record ────────────────────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json", "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          invoice_number: invoiceNumber, transaction_id: Number(transaction_id),
          student_name, student_email, program_name,
          fees_amount: feesNum, subtotal: baseAmount, tax_amount: taxAmount, grand_total: feesNum,
          payment_method: payment_method || "Online (Cashfree)",
          roll_number: roll_number || null, batch_name: batch_name || null,
          email_sent: true, email_sent_at: new Date().toISOString(),
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id, invoice_number: invoiceNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("send-enrollment-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
