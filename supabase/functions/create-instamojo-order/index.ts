import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS Preflight perfectly
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { application_id, customer_email, customer_phone, customer_name, amount, return_url } = await req.json();

    const apiKey = Deno.env.get("INSTAMOJO_API_KEY") || "cb3eb05390f7a7f5eb356df3b5d5a454";
    const authKey = Deno.env.get("INSTAMOJO_AUTH_TOKEN") || "3b8ea4adf46628c9b470477e8bbd8213";

    if (!apiKey || !authKey) {
      throw new Error("Missing Instamojo API keys.");
    }

    const payload = new URLSearchParams({
      'purpose': `Registration #${application_id}`,
      'amount': amount.toString(),
      'buyer_name': customer_name || 'AntiLabs Customer',
      'email': customer_email || 'no-reply@antilabs.com',
      'phone': customer_phone || '9999999999',
      'redirect_url': return_url || 'http://localhost:5174/',
      'send_email': 'true',
      'send_sms': 'false',
      'allow_repeated_payments': 'false'
    });

    const response = await fetch("https://www.instamojo.com/api/1.1/payment-requests/", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "X-Auth-Token": authKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Instamojo API Error:", data);
      throw new Error(data.message ? JSON.stringify(data.message) : "Failed to create Instamojo order");
    }

    return new Response(JSON.stringify({
      payment_request_id: data.payment_request.id,
      longurl: data.payment_request.longurl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
