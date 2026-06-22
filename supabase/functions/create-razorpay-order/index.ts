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
    const { application_id, customer_email, customer_phone, customer_name, team_id } = await req.json();

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Missing Razorpay API keys in environment variables.");
    }

    // Razorpay amount is in paise, so 199 INR = 19900 paise
    const amountInPaise = 19900;

    // Create standard base64 auth token for Razorpay Basic Auth
    const authString = btoa(`${keyId}:${keySecret}`);

    // Create the order using Razorpay API
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_hacklabs_${application_id || team_id}`,
        notes: {
          team_id: team_id || "unknown",
          customer_name: customer_name,
          customer_email: customer_email
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay API Error:", data);
      throw new Error(data.error?.description || "Failed to create Razorpay order");
    }

    // Returns the order_id which frontend will use to open the Razorpay Checkout Modal
    return new Response(JSON.stringify({
      order_id: data.id,
      amount: data.amount,
      currency: data.currency
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
