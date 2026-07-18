import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── WhatsApp & PDF config ──────────────────────────────────────────────────
// Hacklabs WhatsApp group for participant updates
const WHATSAPP_LINK =
  Deno.env.get("HACKLABS_WHATSAPP_LINK") ||
  "https://chat.whatsapp.com/KH2urHU2eh9FQWSf9j3TF5";

// ────────────────────────────────────────────────────────────────────────────

function generateHacklabsEmail(d: {
  captain_name: string;
  team_name: string;
  team_code: string;
  payment_amount: number;
  whatsapp_link: string;
  members?: string[];
  payment_date: string;
}): string {
  const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
  const fmt = (n: number) => `&#8377;${n.toLocaleString("en-IN")}`;

  const memberRows = (d.members || [])
    .map(
      (m, i) => `
    <tr>
      <td style="font-family:${FONT};font-size:13px;color:#475569;padding:6px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#64748b;margin-right:8px;">Member ${i + 1}</span>
        <strong style="color:#0f172a;">${m}</strong>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Hacklabs Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0d1a;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;background:#111827;border:1px solid #1e293b;border-radius:12px;overflow:hidden;">

  <!-- HEADER BANNER -->
  <tr><td style="background:linear-gradient(135deg,#0a3d91 0%,#7c3aed 100%);padding:0;text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:40px 40px 32px;">
        <!-- Logo area -->
        <div style="font-family:${FONT};font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);
            letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">ANTILABS PRESENTS</div>
        <div style="font-family:${FONT};font-size:36px;font-weight:900;color:#ffffff;
            letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">HACKLABS</div>
        <div style="font-family:${FONT};font-size:11px;color:rgba(255,255,255,0.65);
            letter-spacing:5px;text-transform:uppercase;">National Hackathon</div>

        <!-- Checkmark badge -->
        <div style="margin:28px auto 0;width:64px;height:64px;background:rgba(255,255,255,0.15);
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            border:2px solid rgba(255,255,255,0.3);">
          <div style="font-size:30px;line-height:64px;text-align:center;">✓</div>
        </div>
      </td></tr>
    </table>
  </td></tr>

  <!-- SUCCESS HEADLINE -->
  <tr><td style="padding:36px 40px 24px;text-align:center;">
    <div style="font-family:${FONT};font-size:13px;font-weight:700;color:#7c3aed;
        text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Registration Successful</div>
    <h1 style="font-family:${FONT};font-size:26px;font-weight:800;color:#f1f5f9;margin:0 0 12px;">
      Welcome to Hacklabs, ${d.captain_name}! 🎉
    </h1>
    <p style="font-family:${FONT};font-size:15px;color:#94a3b8;margin:0;line-height:1.7;">
      Your team <strong style="color:#e2e8f0;">${d.team_name}</strong> has been successfully
      registered and your payment has been confirmed. Get ready to hack, innovate, and compete!
    </p>
  </td></tr>

  <!-- TEAM INFO CARDS -->
  <tr><td style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="48%" valign="top" style="padding-right:8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:18px;">
              <div style="font-family:${FONT};font-size:10px;font-weight:700;color:#7c3aed;
                  text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Team Name</div>
              <div style="font-family:${FONT};font-size:16px;font-weight:700;color:#f1f5f9;">
                ${d.team_name}
              </div>
            </td></tr>
          </table>
        </td>
        <td width="4%"></td>
        <td width="48%" valign="top" style="padding-left:8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:18px;">
              <div style="font-family:${FONT};font-size:10px;font-weight:700;color:#0ea5e9;
                  text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Team Code</div>
              <div style="font-family:${FONT};font-size:15px;font-weight:800;color:#38bdf8;
                  font-variant-numeric:tabular-nums;letter-spacing:1px;">
                ${d.team_code}
              </div>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr><td colspan="3" style="height:12px;"></td></tr>
      <tr>
        <td width="48%" valign="top" style="padding-right:8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:18px;">
              <div style="font-family:${FONT};font-size:10px;font-weight:700;color:#10b981;
                  text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Amount Paid</div>
              <div style="font-family:${FONT};font-size:16px;font-weight:700;color:#34d399;">
                ${fmt(d.payment_amount)}
              </div>
            </td></tr>
          </table>
        </td>
        <td width="4%"></td>
        <td width="48%" valign="top" style="padding-left:8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:18px;">
              <div style="font-family:${FONT};font-size:10px;font-weight:700;color:#f59e0b;
                  text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Registered On</div>
              <div style="font-family:${FONT};font-size:14px;font-weight:700;color:#fcd34d;">
                ${d.payment_date}
              </div>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- TEAM MEMBERS -->
  ${
    d.members && d.members.length > 0
      ? `
  <tr><td style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;">
        <div style="font-family:${FONT};font-size:12px;font-weight:700;color:#94a3b8;
            text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;">Team Members</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:${FONT};font-size:13px;color:#475569;padding:6px 0;border-bottom:1px solid #334155;">
              <span style="color:#64748b;margin-right:8px;">Captain</span>
              <strong style="color:#f1f5f9;">⭐ ${d.captain_name}</strong>
            </td>
          </tr>
          ${memberRows}
        </table>
      </td></tr>
    </table>
  </td></tr>`
      : ""
  }

  <!-- WHATSAPP CTA -->
  <tr><td style="padding:0 40px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(135deg,#064e3b 0%,#065f46 100%);
          border:1px solid #10b981;border-radius:10px;padding:28px;text-align:center;">
        <div style="font-size:28px;margin-bottom:12px;">📣</div>
        <div style="font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;margin-bottom:8px;">
          Join the WhatsApp Group
        </div>
        <p style="font-family:${FONT};font-size:13px;color:#a7f3d0;margin:0 0 20px;line-height:1.6;">
          Stay updated with announcements, schedule changes, and important
          Hacklabs information in real-time. <strong>Don't miss out — join now!</strong>
        </p>
        <a href="${d.whatsapp_link}"
           style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;
                  padding:13px 32px;border-radius:50px;font-family:${FONT};font-size:14px;
                  font-weight:700;letter-spacing:0.5px;">
          💬 Join WhatsApp Group
        </a>
      </td></tr>
    </table>
  </td></tr>

  <!-- NEXT STEPS -->
  <tr><td style="padding:0 40px 36px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#1e293b;border:1px solid #334155;border-left:4px solid #7c3aed;
          border-radius:8px;padding:24px;">
        <div style="font-family:${FONT};font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:16px;">
          📋 What's Next?
        </div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${[
            "Please review the attached <strong>Rules &amp; Regulations PDF</strong> carefully — it contains all competition rules and timelines.",
            "Join the <strong>WhatsApp group</strong> above to receive real-time updates and announcements.",
            "Share your <strong>Team Code</strong> (<code style=\"background:#0f172a;padding:2px 6px;border-radius:3px;font-size:12px;\">" + d.team_code + "</code>) with your teammates so they can join your team.",
            "Log in to <strong>antilabs.in/hacklabs</strong> to access your team dashboard and track your progress.",
          ]
            .map(
              (s) => `<tr>
              <td width="20" valign="top" style="padding-bottom:14px;">
                <div style="width:7px;height:7px;background:#7c3aed;border-radius:50%;margin-top:6px;"></div>
              </td>
              <td style="font-family:${FONT};font-size:13px;color:#94a3b8;line-height:1.65;padding-bottom:14px;">${s}</td>
            </tr>`
            )
            .join("")}
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA BUTTON -->
  <tr><td style="padding:0 40px 40px;text-align:center;">
    <a href="https://antilabs.in/hacklabs/dashboard"
       style="display:inline-block;background:linear-gradient(135deg,#0a3d91,#7c3aed);
              color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;
              font-family:${FONT};font-size:14px;font-weight:700;letter-spacing:0.5px;">
      Go to Hacklabs Dashboard →
    </a>
  </td></tr>

  <!-- FOOTER -->
  <tr><td align="center" style="background:#0a0f1e;padding:24px 40px;border-top:1px solid #1e293b;">
    <div style="font-family:${FONT};font-size:20px;font-weight:900;color:#ffffff;
        letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">ANTILABS</div>
    <div style="font-family:${FONT};font-size:10px;color:#475569;letter-spacing:2px;
        text-transform:uppercase;margin-bottom:16px;">Training &amp; Internships</div>
    <p style="font-family:${FONT};font-size:12px;color:#334155;margin:0;line-height:1.7;">
      &copy; 2026 Antilabs. All rights reserved.<br>
      Questions? Email us at
      <a href="mailto:hacklabs@antilabs.in" style="color:#7c3aed;text-decoration:none;">
        hacklabs@antilabs.in
      </a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ─── Main Handler ───────────────────────────────────────── */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw new Error("Malformed JSON or empty request body.");
    }

    const {
      captain_name,
      captain_email,
      team_name,
      team_code,
      payment_amount,
      members,
    } = body as {
      captain_name?: string;
      captain_email?: string;
      team_name?: string;
      team_code?: string;
      payment_amount?: number;
      members?: string[];
    };

    if (!captain_email) throw new Error("captain_email is required.");
    if (!team_name) throw new Error("team_name is required.");
    if (!team_code) throw new Error("team_code is required.");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");

    const now = new Date();
    const paymentDate = now.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHTML = generateHacklabsEmail({
      captain_name: captain_name || "Participant",
      team_name: team_name,
      team_code: team_code,
      payment_amount: Number(payment_amount) || 199,
      whatsapp_link: WHATSAPP_LINK,
      members: (members || []).filter(Boolean) as string[],
      payment_date: paymentDate,
    });

    // ── Attach Rules & Regulations PDF (bundled locally with function) ──
    const attachments: Array<{
      filename: string;
      content: string;
      type?: string;
    }> = [];
    try {
      // File is bundled alongside index.ts in the same directory
      const pdfBytes = await Deno.readFile(
        new URL("./rules_and_regulations.pdf", import.meta.url)
      );
      let bin = "";
      for (let i = 0; i < pdfBytes.length; i++)
        bin += String.fromCharCode(pdfBytes[i]);
      attachments.push({
        filename: "Hacklabs_Rules_And_Regulations.pdf",
        content: btoa(bin),
        type: "application/pdf",
      });
      console.log(`Rules & Regulations PDF attached (${pdfBytes.length} bytes).`);
    } catch (e: unknown) {
      console.warn(
        "PDF read failed (file missing?):",
        e instanceof Error ? e.message : String(e)
      );
    }

    // ── Send via Resend ──────────────────────────────────────
    console.log(
      `Sending Hacklabs registration email to ${captain_email} for team "${team_name}"...`
    );
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Antilabs Hacklabs <onboarding@antilabs.in>",
        to: [captain_email],
        subject: `🎉 Hacklabs Registration Confirmed — Team "${team_name}"`,
        html: emailHTML,
        attachments,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(resendData.message || "Resend email delivery failure.");
    }

    console.log(`Hacklabs registration email sent! Resend ID: ${resendData.id}`);

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("send-hacklabs-email error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
