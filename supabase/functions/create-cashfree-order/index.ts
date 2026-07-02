import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, order_id, application_id, customer_email, customer_phone, customer_name, amount, return_url, is_dev } = body;

    const appId = is_dev 
      ? Deno.env.get("CASHFREE_TEST_APP_ID")
      : Deno.env.get("CASHFREE_PROD_APP_ID");
      
    const secretKey = is_dev 
      ? Deno.env.get("CASHFREE_TEST_SECRET_KEY")
      : Deno.env.get("CASHFREE_PROD_SECRET_KEY");

    if (!appId || !secretKey) {
        throw new Error(`Cashfree ${is_dev ? 'test' : 'production'} credentials are not configured in environment variables.`);
    }

    if (action === 'verify') {
      const verifyEndpoint = is_dev 
        ? `https://sandbox.cashfree.com/pg/orders/${order_id}`
        : `https://api.cashfree.com/pg/orders/${order_id}`;
        
      const verifyRes = await fetch(verifyEndpoint, {
        method: "GET",
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json"
        }
      });
      
      const orderData = await verifyRes.json();
      return new Response(JSON.stringify(orderData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const endpoint = is_dev 
      ? "https://sandbox.cashfree.com/pg/orders" 
      : "https://api.cashfree.com/pg/orders";

    const payload = {
      order_id: application_id.toString(),
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${application_id}`,
        customer_name: customer_name || "AntiLabs Customer",
        customer_email: customer_email || "no-reply@antilabs.com",
        customer_phone: customer_phone || "9999999999"
      },
      order_meta: {
        return_url: return_url ? `${return_url}&order_id={order_id}` : "http://localhost:5173/"
      },
      order_note: `Registration #${application_id}`
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree API Error:", data);
      throw new Error(data.message || "Failed to create Cashfree order");
    }

    return new Response(JSON.stringify({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id
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
