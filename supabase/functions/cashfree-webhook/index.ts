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
    
    if (!signature || !timestamp) {
      throw new Error("Missing required x-webhook-signature or x-webhook-timestamp headers.");
    }

    const rawBody = await req.text();
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new Error("Invalid JSON body received.");
    }

    const secret = Deno.env.get("CASHFREE_SECRET_KEY") || Deno.env.get("CASHFREE_TEST_SECRET_KEY");
    if (!secret) {
        throw new Error("Missing CASHFREE_SECRET_KEY or CASHFREE_TEST_SECRET_KEY in environment variables.");
    }

    const payload = `${timestamp}${rawBody}`;
    const expectedSignature = crypto.createHmac("sha256", secret.trim()).update(payload).digest("base64");

    if (signature !== expectedSignature) {
      console.error("Signature mismatch. Expected:", expectedSignature, "Received:", signature);
      throw new Error("Invalid signature verification.");
    }

    console.log("Webhook verified successfully! Event type:", data.type);

    if (data.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data.data?.order?.order_id;
      if (!orderId) {
        throw new Error("Missing order_id in success webhook payload.");
      }

      console.log("Processing successful payment for Order ID:", orderId);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!supabaseUrl || !serviceKey) {
          throw new Error("Missing Supabase credentials in environment");
      }

      const supabase = createClient(supabaseUrl, serviceKey);

      if (typeof orderId === 'string' && orderId.startsWith("hack_")) {
        const teamId = orderId.substring(5);
        console.log(`Processing Hacklabs payment for Team ID: ${teamId}`);

        // Fetch team record
        const { data: team, error: teamError } = await supabase
          .from("hacklabs_teams")
          .select("*")
          .eq("id", teamId)
          .single();

        if (teamError) {
          console.error("DB Error fetching team:", teamError);
          throw new Error(`Database team fetch error: ${teamError.message}`);
        }
        if (!team) {
          throw new Error(`Team #${teamId} not found in database`);
        }

        console.log(`Team found. Current payment status: ${team.payment_status}`);

        if (team.payment_status !== "paid") {
          // Update team status
          const { error: updateTeamError } = await supabase
            .from("hacklabs_teams")
            .update({
              payment_status: "paid",
              cashfree_order_id: orderId
            })
            .eq("id", teamId);

          if (updateTeamError) {
            console.error("Failed to update team status:", updateTeamError);
            throw new Error("Failed to update team status");
          }

          // Update captain's details to join this team
          const { error: updateCaptainError } = await supabase
            .from("hacklabs_personal_details")
            .update({ team_id: teamId })
            .eq("auth_id", team.captain_id);

          if (updateCaptainError) {
            console.error("Failed to associate captain with team:", updateCaptainError);
            throw new Error("Failed to associate captain with team");
          }

          console.log("Team marked as paid and captain associated successfully!");
        } else {
          console.log(`Team #${teamId} was already marked as paid.`);
        }
      } else {
        const numericOrderId = parseInt(orderId, 10);
        if (isNaN(numericOrderId)) {
          throw new Error(`Order ID ${orderId} is not a valid integer transaction ID.`);
        }

        const { data: tx, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("transaction_id", numericOrderId)
          .single();

        if (txError) {
            console.error("DB Error fetching transaction:", txError);
            throw new Error(`Database transaction fetch error: ${txError.message}`);
        }
        if (!tx) {
            throw new Error(`Transaction #${numericOrderId} not found in database`);
        }

        console.log(`Transaction found. Current status: ${tx.payment_status}`);

        if (tx.payment_status !== "paid") {
          const { error: updateError } = await supabase
            .from("transactions")
            .update({ payment_status: "paid" })
            .eq("transaction_id", numericOrderId);
            
          if (updateError) {
              console.error("Failed to update transaction status:", updateError);
              throw new Error("Failed to update transaction status");
          }
          
          console.log("Transaction marked as paid!");

          const { error: rpcError } = await supabase.rpc(
            "assign_batch_and_roll_number",
            { p_transaction_id: numericOrderId }
          );

          if (rpcError) {
            console.error("RPC failed, running fallback insert. Error:", rpcError);
            const { data: existingReg } = await supabase
              .from("training_registrations")
              .select("registration_id")
              .eq("email", tx.email)
              .maybeSingle();

            if (!existingReg) {
              console.log("No existing registration found. Creating fallback registration record...");
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
                if (insertError) {
                  console.error("Fallback insert failed:", insertError);
                } else {
                  console.log("Fallback registration created successfully.");
                }
            } else {
              console.log("Registration already exists for email:", tx.email);
            }
          } else {
            console.log("RPC assign_batch_and_roll_number completed successfully.");
          }
        } else {
          console.log(`Transaction #${numericOrderId} was already marked as paid.`);
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

