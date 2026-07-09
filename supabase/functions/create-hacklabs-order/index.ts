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
    const { 
      team_id, 
      customer_email, 
      customer_phone, 
      customer_name, 
      return_url, 
      is_dev
    } = body;

    if (!team_id) {
        throw new Error("team_id is required");
    }

    const appId = is_dev 
      ? Deno.env.get("CASHFREE_TEST_APP_ID")
      : Deno.env.get("CASHFREE_PROD_APP_ID");
      
    const secretKey = is_dev 
      ? Deno.env.get("CASHFREE_TEST_SECRET_KEY")
      : Deno.env.get("CASHFREE_PROD_SECRET_KEY");

    // Fallback if test/prod prefix isn't used
    const finalAppId = appId || Deno.env.get("CASHFREE_APP_ID");
    const finalSecretKey = secretKey || Deno.env.get("CASHFREE_SECRET_KEY");

    if (!finalAppId || !finalSecretKey) {
        throw new Error("Cashfree credentials are not configured in environment variables.");
    }

    const finalAmount = 199; // Fixed fee for Hacklabs registration

    const endpoint = is_dev 
      ? "https://sandbox.cashfree.com/pg/orders" 
      : "https://api.cashfree.com/pg/orders";

    // Set up webhook URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const webhookUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/hacklabs-webhook` : "";

    const payload = {
      order_id: `${team_id}_${Date.now()}`, // Append timestamp to allow retries if user cancels and clicks pay again
      order_amount: finalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${team_id}`,
        customer_name: customer_name || "Hacklabs Team Captain",
        customer_email: customer_email || "no-reply@antilabs.com",
        customer_phone: customer_phone || "9999999999"
      },
      order_meta: {
        return_url: return_url ? `${return_url}&order_id={order_id}` : "http://localhost:5173/hacklabs/dashboard",
        notify_url: webhookUrl
      },
      order_note: `Hacklabs Registration for Team #${team_id}`
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-client-id": finalAppId,
        "x-client-secret": finalSecretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create Cashfree order");
    }

    return new Response(JSON.stringify({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      final_amount: finalAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
