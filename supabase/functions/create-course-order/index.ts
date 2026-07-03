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
    const body = await req.json();
    const { application_id, promo_code, customer_email, customer_phone, customer_name, return_url, is_dev } = body;

    if (!application_id) {
        throw new Error("application_id is required");
    }

    const appId = is_dev 
      ? Deno.env.get("CASHFREE_TEST_APP_ID")
      : Deno.env.get("CASHFREE_PROD_APP_ID");
      
    const secretKey = is_dev 
      ? Deno.env.get("CASHFREE_TEST_SECRET_KEY")
      : Deno.env.get("CASHFREE_PROD_SECRET_KEY");

    if (!appId || !secretKey) {
        throw new Error(`Cashfree ${is_dev ? 'test' : 'production'} credentials are not configured in environment variables.`);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("role_id")
      .eq("transaction_id", application_id)
      .single();

    if (txError || !tx) {
        throw new Error("Transaction not found or invalid.");
    }

    const { data: career, error: careerError } = await supabaseAdmin
      .from("Careers")
      .select("registration_fees")
      .eq("posting_id", tx.role_id)
      .single();

    if (careerError || !career) {
        throw new Error("Course/Role not found.");
    }

    const rawFee = career.registration_fees 
      ? parseInt(String(career.registration_fees).replace(/\D/g, ''), 10) 
      : NaN;

    if (isNaN(rawFee) || rawFee <= 0) {
        throw new Error("Invalid course pricing configuration in database.");
    }

    let finalAmount = rawFee;

    if (promo_code) {
        const { data: promo, error: promoError } = await supabaseAdmin
            .from("referral_codes")
            .select("discount_percentage")
            .eq("code", promo_code.trim().toUpperCase())
            .eq("is_active", true)
            .maybeSingle();

        if (promo && promo.discount_percentage) {
            const discount = parseFloat(promo.discount_percentage);
            if (!isNaN(discount) && discount > 0 && discount <= 100) {
                finalAmount = Math.round(rawFee * (1 - discount / 100));
            }
        }
    }

    const { error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({ fees_amount: finalAmount })
        .eq("transaction_id", application_id);

    if (updateError) {
        throw new Error("Failed to secure transaction pricing.");
    }

    const endpoint = is_dev 
      ? "https://sandbox.cashfree.com/pg/orders" 
      : "https://api.cashfree.com/pg/orders";

    const payload = {
      order_id: application_id.toString(),
      order_amount: finalAmount,
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
      order_note: `Course Registration #${application_id}`
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
