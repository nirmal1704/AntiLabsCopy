import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const rawBody = await req.text();
    const data = JSON.parse(rawBody);

    let secret = Deno.env.get("CASHFREE_PROD_SECRET_KEY") || Deno.env.get("CASHFREE_SECRET_KEY");
    // Optionally check if it's test mode
    if (!secret || secret.trim() === '') {
        secret = Deno.env.get("CASHFREE_TEST_SECRET_KEY");
    }
    if (!secret) {
        throw new Error("Missing CASHFREE_SECRET_KEY in environment");
    }

    const payload = `${timestamp}${rawBody}`;
    
    const expectedSignature = crypto.createHmac("sha256", secret.trim()).update(payload).digest("base64");

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }

    console.log("Hacklabs Webhook received! Type:", data.type);

    if (data.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const teamId = data.data.order.order_id;
      console.log("Processing Team ID:", teamId);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !serviceKey) {
          throw new Error("Missing Supabase credentials in environment");
      }

      const supabase = createClient(supabaseUrl, serviceKey);

      const { data: team, error: teamError } = await supabase
        .from("hacklabs_teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (teamError) {
          console.error("DB Error fetching team:", teamError);
          throw new Error(`Database error: ${teamError.message}`);
      }
      if (!team) {
          throw new Error(`Team ${teamId} not found in database`);
      }

      console.log("Team found. Current payment status:", team.payment_status);

      if (team.payment_status !== "paid") {
        const { error: updateError } = await supabase
          .from("hacklabs_teams")
          .update({ 
              payment_status: "paid",
              cashfree_order_id: teamId,
              cashfree_payment_session_id: data.data.payment.cf_payment_id || null
          })
          .eq("id", teamId);
          
        if (updateError) {
            console.error("Failed to update team:", updateError);
            throw new Error("Failed to update team payment status");
        }
        
        console.log("Team marked as paid!");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("CRITICAL WEBHOOK ERROR:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
