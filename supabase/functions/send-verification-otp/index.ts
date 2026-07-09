import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name } = await req.json();
    if (!email || !password) throw new Error("Email and password required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase credentials");

    const supabase = createClient(supabaseUrl, serviceKey);

    // Generate signup OTP link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: email,
      password: password,
      data: { full_name: full_name || "" }
    });

    if (error) throw error;

    // Send the OTP via Brevo
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) throw new Error("Missing BREVO_API_KEY");

    const otp = data.properties.email_otp;
    
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "HackLabs", email: "reddyrnirmalkumar@gmail.com" },
        to: [{ email: email }],
        subject: "Hacklabs - Verify your Email",
        htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HackLabs Sign In</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Raleway+Dots&family=Raleway:wght@300;400&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Raleway', sans-serif; font-weight: 300; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 50px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 500px; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 40px;">
              <h1 style="margin: 0; font-family: 'Raleway Dots', 'Raleway', sans-serif; font-weight: 400; font-size: 32px; color: #ffffff; letter-spacing: 2px;">
                HackLabs
              </h1>
            </td>
          </tr>
          
          <!-- Body text -->
          <tr>
            <td style="padding-bottom: 20px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 300; color: #ffffff; line-height: 1.6;">
                Verify your identity
              </h2>
              
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #ffffff; line-height: 1.5;">
                Enter the One-Time Password (OTP) below to sign in. This code expires shortly and can only be used once.
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #000000; border: 1px solid #ffffff; padding: 25px; text-align: center; margin: 35px 0;">
                <h2 style="margin: 0; font-family: 'Raleway Dots', 'Raleway', sans-serif; font-size: 48px; color: #ffffff; letter-spacing: 12px; font-weight: 400;">
                  ${otp}
                </h2>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #ffffff; padding-top: 25px;">
              <p style="margin: 0; font-size: 12px; color: #ffffff;">
                AntiLabs
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
      })
    });
    
    if (!res.ok) {
        const err = await res.text();
        console.error("Brevo Error:", err);
        throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
