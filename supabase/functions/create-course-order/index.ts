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
    let body;
    try {
      body = await req.json();
    } catch {
      throw new Error("Malformed JSON or empty request body.");
    }

    const { application_id, promo_code, customer_email, customer_phone, customer_name, return_url, is_dev } = body;

    if (!application_id) {
        throw new Error("application_id is required.");
    }

    const devMode = !!is_dev;
    const appId = devMode 
      ? Deno.env.get("CASHFREE_TEST_APP_ID")
      : Deno.env.get("CASHFREE_PROD_APP_ID");
      
    const secretKey = devMode 
      ? Deno.env.get("CASHFREE_TEST_SECRET_KEY")
      : Deno.env.get("CASHFREE_PROD_SECRET_KEY");

    if (!appId || !secretKey) {
        throw new Error(`Cashfree ${devMode ? 'test' : 'production'} credentials are not configured in environment variables.`);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase configuration in environment variables.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const numericApplicationId = parseInt(application_id, 10);
    if (isNaN(numericApplicationId)) {
      throw new Error("application_id must be a valid integer.");
    }

    const { data: tx, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("role_id")
      .eq("transaction_id", numericApplicationId)
      .single();

    if (txError || !tx) {
        console.error("Transaction search failed:", txError);
        throw new Error("Transaction not found or invalid.");
    }

    const { data: career, error: careerError } = await supabaseAdmin
      .from("Careers")
      .select("registration_fees")
      .eq("posting_id", tx.role_id)
      .single();

    if (careerError || !career) {
        console.error("Career search failed:", careerError);
        throw new Error("Course/Role details not found.");
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

        if (promoError) {
          console.error("Promo code database query error:", promoError);
        }

        if (promo && promo.discount_percentage) {
            const discount = parseFloat(promo.discount_percentage);
            if (!isNaN(discount) && discount > 0 && discount <= 100) {
                finalAmount = Math.round(rawFee * (1 - discount / 100));
                console.log(`Promo code applied: ${promo_code}. Discount: ${discount}%. Original: ${rawFee}, Final: ${finalAmount}`);
            }
        } else {
            console.log(`Promo code ${promo_code} is invalid or inactive.`);
        }
    }

    const { error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({ fees_amount: finalAmount })
        .eq("transaction_id", numericApplicationId);

    if (updateError) {
        console.error("Failed to update transaction amount in database:", updateError);
        throw new Error("Failed to secure transaction pricing.");
    }

    const endpoint = Deno.env.get("CASHFREE_API_URL") || 
      (devMode 
        ? "https://sandbox.cashfree.com/pg/orders" 
        : "https://api.cashfree.com/pg/orders");

    const payload = {
      order_id: numericApplicationId.toString(),
      order_amount: finalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${numericApplicationId}`,
        customer_name: customer_name || "AntiLabs Customer",
        customer_email: customer_email || "no-reply@antilabs.com",
        customer_phone: customer_phone || "9999999999"
      },
      order_meta: {
        return_url: return_url ? `${return_url}&order_id={order_id}` : "http://localhost:5173/"
      },
      order_note: `Course Registration #${numericApplicationId}`
    };

    console.log(`Creating Cashfree course order for ID ${numericApplicationId} using endpoint: ${endpoint}`);

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
      console.error("Cashfree order creation API error response:", data);
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
    console.error("create-course-order edge function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

