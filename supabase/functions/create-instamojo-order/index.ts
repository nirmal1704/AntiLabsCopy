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
    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("Malformed JSON or empty request body.");
    }

    const { application_id, customer_email, customer_phone, customer_name, amount, return_url } = body;

    // Validation
    if (!application_id) {
      throw new Error("application_id is required.");
    }
    if (amount === undefined || amount === null) {
      throw new Error("amount is required.");
    }

    const apiKey = Deno.env.get("INSTAMOJO_API_KEY") || "cb3eb05390f7a7f5eb356df3b5d5a454";
    const authKey = Deno.env.get("INSTAMOJO_AUTH_TOKEN") || "3b8ea4adf46628c9b470477e8bbd8213";

    if (!apiKey || !authKey) {
      throw new Error("Missing Instamojo API keys.");
    }

    const instamojoEnv = Deno.env.get("INSTAMOJO_ENV") || "sandbox";
    const instamojoUrl = Deno.env.get("INSTAMOJO_API_URL") || 
      (instamojoEnv === "production"
        ? "https://www.instamojo.com/api/1.1/payment-requests/"
        : "https://test.instamojo.com/api/1.1/payment-requests/");

    console.log(`Creating Instamojo order for Application #${application_id} using environment: ${instamojoEnv}`);

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

    const response = await fetch(instamojoUrl, {
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
      console.error("Instamojo API Error Response:", data);
      throw new Error(data.message ? JSON.stringify(data.message) : "Failed to create Instamojo order");
    }

    return new Response(JSON.stringify({
      payment_request_id: data.payment_request.id,
      longurl: data.payment_request.longurl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Instamojo edge function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

