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

    const appId = Deno.env.get("CASHFREE_APP_ID");
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY");

    if (!appId || !secretKey) {
      throw new Error("Missing Cashfree API keys in environment variables.");
    }

    // Cashfree exact amount with standard fee calculation
    // Base: 199.00
    // Fee (2%): 3.98
    // GST (18% on fee): 0.72
    // Total: 203.70
    const orderAmount = 203.70;

    // Use sandbox endpoint by default, can switch to prod via env var if needed
    const apiUrl = Deno.env.get("CASHFREE_ENV") === "production" 
      ? "https://api.cashfree.com/pg/orders" 
      : "https://sandbox.cashfree.com/pg/orders";

    // Create the order using Cashfree API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: team_id || `cust_${Date.now()}`,
          customer_name: customer_name || "Hacklabs Participant",
          customer_email: customer_email || "participant@hacklabs.com",
          customer_phone: customer_phone || "9999999999" // Cashfree requires a valid 10-digit phone number
        },
        order_meta: {
          return_url: "http://localhost:5173/hacklabs/dashboard", // Update dynamically if needed, but not strictly required for headless checkout modal
          payment_methods: ""
        },
        order_tags: {
          team_id: team_id || "unknown",
          customer_name: customer_name,
          customer_email: customer_email
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree API Error:", data);
      throw new Error(data.message || "Failed to create Cashfree order");
    }

    // Returns the payment_session_id which frontend will use to open the Cashfree Checkout Modal
    return new Response(JSON.stringify({
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
      amount: data.order_amount,
      currency: data.order_currency
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
