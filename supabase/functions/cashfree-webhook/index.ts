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

    const secret = Deno.env.get("CASHFREE_TEST_SECRET_KEY");
    if (!secret) {
        throw new Error("Missing CASHFREE_TEST_SECRET_KEY in environment");
    }

    const payload = `${timestamp}${rawBody}`;
    
    const expectedSignature = crypto.createHmac("sha256", secret.trim()).update(payload).digest("base64");

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }

    console.log("Webhook received! Type:", data.type);

    if (data.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data.data.order.order_id;
      console.log("Processing Order ID:", orderId);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !serviceKey) {
          throw new Error("Missing Supabase credentials in environment");
      }

      const supabase = createClient(supabaseUrl, serviceKey);

      const { data: tx, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("transaction_id", orderId)
        .single();

      if (txError) {
          console.error("DB Error fetching transaction:", txError);
          throw new Error(`Database error: ${txError.message}`);
      }
      if (!tx) {
          throw new Error(`Transaction ${orderId} not found in database`);
      }

      console.log("Transaction found. Current status:", tx.payment_status);

      if (tx.payment_status !== "paid") {
        const { error: updateError } = await supabase
          .from("transactions")
          .update({ payment_status: "paid" })
          .eq("transaction_id", orderId);
          
        if (updateError) {
            console.error("Failed to update transaction:", updateError);
            throw new Error("Failed to update transaction status");
        }
        
        console.log("Transaction marked as paid!");

        const { error: rpcError } = await supabase.rpc(
          "assign_batch_and_roll_number",
          { p_transaction_id: parseInt(orderId) }
        );

        if (rpcError) {
          console.error("RPC Failed, running fallback insert. Error:", rpcError);
          const { data: existingReg } = await supabase
            .from("training_registrations")
            .select("registration_id")
            .eq("email", tx.email)
            .maybeSingle();

          if (!existingReg) {
            const { error: insertError } = await supabase
              .from("training_registrations")
              .insert([{
                user_id: tx.user_id,
                role_id: tx.role_id,
                position: tx.position,
                full_name: tx.full_name,
                university_name: tx.university_name,
                college_name: tx.college_name,
                current_year: tx.current_year,
                degree_pursuing: tx.degree_pursuing,
                branch: tx.branch,
                graduation_year: tx.graduation_year,
                mobile_number: tx.mobile_number,
                email: tx.email,
                college_proof_url: tx.college_proof_url,
                resume_url: tx.resume_url,
                fees_amount: tx.fees_amount,
                payment_status: "paid",
              }]);
              if (insertError) console.error("Fallback insert failed:", insertError);
          }
        }
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
