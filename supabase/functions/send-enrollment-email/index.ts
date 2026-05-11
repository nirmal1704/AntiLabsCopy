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

  const card = (label: string, value: string, bg: string, border: string, color: string) =>
    `<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${bg};border:1px solid ${border};border-radius:10px;padding:14px 16px;">
      <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${label}</div>
      <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:800;color:${color};">${value}</div>
    </td></tr></table>`;

  const rollCard  = d.roll_number ? card("Roll Number", d.roll_number, "#eef3ff", "#c7d7ff", "#0d5bd7") : "";
  const batchCard = d.batch_name  ? card("Batch", d.batch_name,        "#eef3ff", "#c7d7ff", "#0a3d91") : "";

  const topRow = (rollCard || batchCard) ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
      <td width="50%" style="padding-right:8px;vertical-align:top;">${rollCard}</td>
      <td width="50%" style="padding-left:8px;vertical-align:top;">${batchCard}</td>
    </tr></table>` : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Antilabs Enrollment</title></head>
<body style="margin:0;padding:0;background:#eef2ff;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2ff;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(10,61,145,0.12);">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#0a3d91,#1155cc,#1a7fe8);padding:44px 40px 36px;text-align:center;">
    <div style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:6px;">ANTILABS</div>
    <div style="font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:5px;margin-top:4px;">TRAINING &amp; INTERNSHIPS</div>
    <div style="margin-top:18px;"><span style="font-family:Arial,sans-serif;background:rgba(255,255,255,0.18);color:#fff;padding:7px 22px;border-radius:100px;font-size:13px;font-weight:600;border:1px solid rgba(255,255,255,0.3);">&#127881; Enrollment Confirmed</span></div>
  </td></tr>
  <tr><td height="4" style="background:linear-gradient(90deg,#1a7fe8,#0d5bd7,#0a3d91);font-size:0;">&nbsp;</td></tr>

  <!-- WELCOME -->
  <tr><td style="padding:40px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:24px;">
      <div style="font-size:52px;line-height:1;">&#9989;</div>
      <h1 style="font-family:Arial,sans-serif;font-size:26px;font-weight:800;color:#0f172a;margin:12px 0 8px;">Welcome, ${d.student_name}!</h1>
      <p style="font-family:Arial,sans-serif;font-size:15px;color:#64748b;margin:0;line-height:1.7;">Your enrollment in <strong style="color:#0a3d91;">${d.program_name}</strong><br>is confirmed. We&#39;re thrilled to have you!</p>
    </td></tr></table>

    ${topRow}

    <!-- Amount + Date cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
      <td width="50%" style="padding-right:8px;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Amount Paid</div>
          <div style="font-family:Arial,sans-serif;font-size:19px;font-weight:800;color:#15803d;">${fees}</div>
        </td></tr></table>
      </td>
      <td width="50%" style="padding-left:8px;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#f8faff;border:1px solid #e2eeff;border-radius:10px;padding:14px 16px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Enrolled On</div>
          <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#0f172a;">${d.enrollment_date}</div>
        </td></tr></table>
      </td>
    </tr></table>

    <!-- Next Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>
      <td style="background:#eef3ff;border-left:4px solid #0d5bd7;border-radius:10px;padding:20px 24px;">
        <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#0a3d91;margin-bottom:14px;">&#128205; What Happens Next?</div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${[
            "Check the attached <strong>Instructions PDF</strong> for program details &amp; timelines.",
            "Log in to <strong>antilabs.in/profile</strong> to access your Student Dashboard.",
            "Watch your email for batch schedules &amp; resources.",
          ].map((s, i) => `<tr>
            <td width="28" valign="top" style="padding-bottom:10px;"><div style="width:22px;height:22px;background:#0d5bd7;border-radius:50%;text-align:center;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#fff;line-height:22px;">${i + 1}</div></td>
            <td style="font-family:Arial,sans-serif;font-size:13px;color:#475569;line-height:1.6;padding-left:10px;padding-bottom:10px;">${s}</td>
          </tr>`).join("")}
        </table>
      </td>
    </tr></table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;"><tr><td align="center">
      <a href="https://antilabs.in/profile" style="display:inline-block;background:linear-gradient(135deg,#0a3d91,#0d5bd7);color:#fff;text-decoration:none;padding:15px 48px;border-radius:100px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;">Go to My Dashboard &rarr;</a>
    </td></tr></table>
  </td></tr>

  <!-- INVOICE DIVIDER -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#e2e8f0;font-size:0;">&nbsp;</td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:14px 0 0;">
      <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#0d5bd7;letter-spacing:3px;text-transform:uppercase;">&#9632; PAYMENT INVOICE &#9632;</span>
    </td></tr></table>
  </td></tr>

  <!-- INVOICE HEADER BAND -->
  <tr><td style="background:linear-gradient(135deg,#0a3d91,#1155cc);padding:22px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:5px;">INVOICE</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;">No: <strong style="color:#fff;">${d.invoice_number}</strong> &nbsp;|&nbsp; Date: <strong style="color:#fff;">${d.invoice_date}</strong></div>
      </td>
      <td align="right" valign="middle">
        <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:900;color:#fff;letter-spacing:3px;">ANTILABS</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:2px;">TRAINING &amp; INTERNSHIPS</div>
        <div style="font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.75);margin-top:3px;">onboarding@antilabs.in</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- BILL TO / FROM -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" valign="top" style="padding:20px 20px 16px 40px;">
        <div style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:#0a3d91;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Bill To</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px;">${d.student_name}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#64748b;line-height:1.8;">${d.student_phone}<br>${d.student_address}</div>
      </td>
      <td width="50%" valign="top" align="right" style="padding:20px 40px 16px 20px;">
        <div style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:#0a3d91;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">From</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px;">Antilabs</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#64748b;line-height:1.8;">onboarding@antilabs.in<br>India</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- ITEMS TABLE -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <tr style="background:#0d5bd7;">
        <th align="left"   style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;padding:11px 14px;border:none;">Description</th>
        <th align="center" style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;padding:11px 14px;border:none;width:50px;">Qty</th>
        <th align="center" style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;padding:11px 14px;border:none;width:90px;">Unit Price</th>
        <th align="right"  style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;padding:11px 14px;border:none;width:90px;">Total</th>
      </tr>
      <tr style="background:#f8f9ff;">
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#0f172a;padding:14px;border:1px solid #e2e8f0;">
          <strong>${d.program_name}</strong><br>
          <span style="font-size:11px;color:#64748b;">Antilabs Training Program Enrollment</span>
          ${d.roll_number ? `<br><span style="font-size:11px;color:#0d5bd7;font-weight:600;">Roll No: ${d.roll_number}</span>` : ""}
        </td>
        <td align="center" style="font-family:Arial,sans-serif;font-size:13px;color:#0f172a;padding:14px;border:1px solid #e2e8f0;">1</td>
        <td align="center" style="font-family:Arial,sans-serif;font-size:13px;color:#0f172a;padding:14px;border:1px solid #e2e8f0;">${base}</td>
        <td align="right"  style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#0f172a;padding:14px;border:1px solid #e2e8f0;">${base}</td>
      </tr>
    </table>
  </td></tr>

  <!-- TOTALS -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="55%">&nbsp;</td>
      <td width="45%" style="padding:16px 40px 0;">
        <table width="100%" cellpadding="4" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:13px;color:#64748b;">Sub Total</td>
            <td align="right" style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#0f172a;">${base}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:13px;color:#64748b;">GST (18%)</td>
            <td align="right" style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#0f172a;">${tax}</td>
          </tr>
          <tr><td colspan="2" height="1" style="background:#0d5bd7;font-size:0;line-height:0;padding:0;">&nbsp;</td></tr>
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#0a3d91;padding-top:6px;">Grand Total</td>
            <td align="right" style="font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#0a3d91;padding-top:6px;">${fees}</td>
          </tr>
        </table>
      </td>
    </tr></table>
  </td></tr>

  <!-- PAYMENT INFO -->
  <tr><td style="padding:16px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="background:#eef3ff;border-left:4px solid #0d5bd7;border-radius:6px;padding:12px 16px;font-family:Arial,sans-serif;font-size:12px;color:#334155;line-height:2.2;">
        <strong>Payment Information</strong><br>
        Mode: ${d.payment_method} &nbsp;|&nbsp; Ref: TXN-${d.transaction_id}<br>
        Status: <strong style="color:#15803d;">&#10003; PAID</strong>
      </td>
    </tr></table>
  </td></tr>

  <!-- SEAL + THANK YOU -->
  <tr><td style="padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="50%" valign="middle">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td align="center" valign="middle" style="width:68px;height:68px;border:3px solid #0d5bd7;border-radius:50%;font-family:Arial,sans-serif;font-size:8px;font-weight:900;color:#0d5bd7;text-align:center;line-height:1.4;padding:8px;">ANTILABS<br>CERTIFIED<br>&#10003;</td>
          <td style="padding-left:10px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#334155;">Proprietor,<br>Antilabs</td>
        </tr></table>
      </td>
      <td width="50%" align="right" valign="middle">
        <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:800;color:#0d5bd7;">Thank You! &#127891;</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- BOTTOM BAR -->
  <tr><td height="4" style="background:linear-gradient(90deg,#0a3d91,#0d5bd7,#1a7fe8);font-size:0;">&nbsp;</td></tr>

  <!-- FOOTER -->
  <tr><td align="center" style="background:#f1f5fb;padding:22px 40px;border-top:1px solid #e2eeff;">
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;margin:0;line-height:1.9;">
      &copy; 2025 Antilabs. All rights reserved.<br>
      Questions? Visit <a href="https://antilabs.in/profile" style="color:#0d5bd7;text-decoration:none;font-weight:600;">antilabs.in/profile</a>
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
