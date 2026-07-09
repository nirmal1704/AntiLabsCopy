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

    const { 
      action, 
      order_id, 
      transaction_id, 
      customer_email, 
      customer_phone, 
      customer_name, 
      return_url, 
      is_dev,
      position,
      role_id,
      user_id,
      promo_code,
      team_id
    } = body;

    const appId = Deno.env.get("CASHFREE_APP_ID");
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY");

    if (!appId || !secretKey) {
      throw new Error("Missing Cashfree API keys in environment variables.");
    }

    // ── 1. HACKLABS CHECKOUT FLOW ───────────────────────
    if (team_id) {
      // Hacklabs registration amount
      const orderAmount = 203.70;

      const cashfreeEnv = Deno.env.get("CASHFREE_ENV") || "sandbox";
      const apiUrl = Deno.env.get("CASHFREE_API_URL") || 
        (cashfreeEnv === "production" 
          ? "https://api.cashfree.com/pg/orders" 
          : "https://sandbox.cashfree.com/pg/orders");

      console.log(`Creating Cashfree order for Team #${team_id} using environment: ${cashfreeEnv}`);

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
            customer_id: team_id.toString(),
            customer_name: customer_name || "Hacklabs Participant",
            customer_email: customer_email || "participant@hacklabs.com",
            customer_phone: customer_phone || "9999999999"
          },
          order_meta: {
            return_url: "http://localhost:5173/hacklabs/dashboard",
            payment_methods: ""
          },
          order_tags: {
            team_id: team_id.toString(),
            customer_name: customer_name || "Unknown",
            customer_email: customer_email || "Unknown"
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cashfree API Error Response:", data);
        throw new Error(data.message || "Failed to create Cashfree order");
      }

      return new Response(JSON.stringify({
        order_id: data.order_id,
        payment_session_id: data.payment_session_id,
        amount: data.order_amount,
        currency: data.order_currency
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ── 2. GENERAL COURSE CHECKOUT & VERIFICATION FLOW ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase credentials are not configured in edge function environment.");
    }

    // Verification Mode
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
      let transactionData = null;

      if (transaction_id) {
        // Fetch transaction using service_role via direct REST API call bypassing RLS
        const txSelectRes = await fetch(`${supabaseUrl}/rest/v1/transactions?transaction_id=eq.${transaction_id}`, {
          method: "GET",
          headers: {
            "apikey": supabaseServiceRoleKey,
            "Authorization": `Bearer ${supabaseServiceRoleKey}`
          }
        });
        if (txSelectRes.ok) {
          const txList = await txSelectRes.json();
          transactionData = txList[0] || null;
        }

        if (orderData.order_status === 'PAID') {
          // Update database using service_role via direct REST API call bypassing RLS
          const updateRes = await fetch(`${supabaseUrl}/rest/v1/transactions?transaction_id=eq.${transaction_id}`, {
            method: "PATCH",
            headers: {
              "apikey": supabaseServiceRoleKey,
              "Authorization": `Bearer ${supabaseServiceRoleKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ payment_status: "paid" })
          });
          
          if (!updateRes.ok) {
            const errText = await updateRes.text();
            console.error("Database Update Error:", errText);
          } else {
            if (transactionData) transactionData.payment_status = "paid";
            // Assign batch and roll number via RPC REST call
            const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/assign_batch_and_roll_number`, {
              method: "POST",
              headers: {
                "apikey": supabaseServiceRoleKey,
                "Authorization": `Bearer ${supabaseServiceRoleKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ p_transaction_id: parseInt(transaction_id, 10) })
            });
            if (!rpcRes.ok) {
              const errText = await rpcRes.text();
              console.error("Database RPC Error:", errText);
            } else {
              // Trigger send-enrollment-email Edge Function
              try {
                const emailFuncUrl = `${supabaseUrl}/functions/v1/send-enrollment-email`;
                const emailRes = await fetch(emailFuncUrl, {
                  method: "POST",
                  headers: {
                    "apikey": supabaseServiceRoleKey,
                    "Authorization": `Bearer ${supabaseServiceRoleKey}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    student_name:    transactionData.full_name,
                    student_email:   transactionData.email,
                    student_phone:   transactionData.mobile_number,
                    student_address: transactionData.university_name
                      ? `${transactionData.college_name}, ${transactionData.university_name}, India`
                      : `${transactionData.college_name}, India`,
                    program_name:    transactionData.position,
                    transaction_id:  transaction_id,
                    fees_amount:     transactionData.fees_amount,
                    payment_method:  'Online (Cashfree)',
                  })
                });
                if (!emailRes.ok) {
                  console.error("Failed to trigger send-enrollment-email:", await emailRes.text());
                }
              } catch (emailErr) {
                console.error("Error triggering send-enrollment-email:", emailErr);
              }
            }
          }
        } else if (orderData.order_status !== 'ACTIVE' && orderData.order_status !== 'PAID') {
          // Update to failed or pending
          const status = orderData.order_status === 'ACTIVE' ? 'pending' : 'failed';
          await fetch(`${supabaseUrl}/rest/v1/transactions?transaction_id=eq.${transaction_id}`, {
            method: "PATCH",
            headers: {
              "apikey": supabaseServiceRoleKey,
              "Authorization": `Bearer ${supabaseServiceRoleKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ payment_status: status })
          });
          if (transactionData) transactionData.payment_status = status;
        }
      }

      return new Response(JSON.stringify({
        ...orderData,
        transaction: transactionData
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Price Calculation (Server-Side)
    if (!role_id) {
      throw new Error("role_id is required");
    }

    const careerRes = await fetch(`${supabaseUrl}/rest/v1/Careers?posting_id=eq.${role_id}`, {
      method: "GET",
      headers: {
        "apikey": supabaseServiceRoleKey,
        "Authorization": `Bearer ${supabaseServiceRoleKey}`
      }
    });

    if (!careerRes.ok) {
      throw new Error("Failed to fetch course details from database.");
    }

    const careerData = await careerRes.json();
    const career = careerData[0];
    if (!career) {
      throw new Error("Course/Role not found in database.");
    }

    const rawFee = career.registration_fees 
      ? parseInt(String(career.registration_fees).replace(/\D/g, ''), 10) 
      : NaN;

    if (isNaN(rawFee) || rawFee <= 0) {
        throw new Error("Invalid course pricing configuration in database.");
    }

    let finalAmount = rawFee;

    // Apply promo code if present
    if (promo_code) {
        const promoRes = await fetch(`${supabaseUrl}/rest/v1/referral_codes?code=eq.${encodeURIComponent(promo_code.trim().toUpperCase())}&is_active=eq.true`, {
          method: "GET",
          headers: {
            "apikey": supabaseServiceRoleKey,
            "Authorization": `Bearer ${supabaseServiceRoleKey}`
          }
        });
        if (promoRes.ok) {
          const promoData = await promoRes.json();
          const promo = promoData[0];
          if (promo && promo.discount_percentage) {
            const discount = parseFloat(promo.discount_percentage);
            if (!isNaN(discount) && discount > 0 && discount <= 100) {
              finalAmount = Math.round(rawFee * (1 - discount / 100));
            }
          }
        }
    }

    // Transaction Insertion (Server-Side REST API)
    const txRes = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: "POST",
      headers: {
        "apikey": supabaseServiceRoleKey,
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        user_id: user_id || null,
        position: position,
        role_id: role_id,
        full_name: customer_name,
        mobile_number: customer_phone,
        email: customer_email,
        university_name: "",
        college_name: "",
        current_year: 0,
        degree_pursuing: "",
        branch: "",
        graduation_year: 0,
        college_proof_url: "",
        resume_url: "",
        fees_amount: finalAmount,
        payment_status: "pending"
      })
    });

    if (!txRes.ok) {
      const errText = await txRes.text();
      console.error("Database Insert Error:", errText);
      throw new Error(`Database Insert Error: ${errText}`);
    }

    const txData = await txRes.json();
    const tx = txData[0];
    if (!tx) {
      throw new Error("No transaction record returned from database insert");
    }

    const applicationId = tx.transaction_id;
    const finalReturnUrl = return_url ? return_url.replace("{tx_id}", String(applicationId)) : "";

    // Order Creation Mode
    const endpoint = is_dev 
      ? "https://sandbox.cashfree.com/pg/orders" 
      : "https://api.cashfree.com/pg/orders";

    const payload = {
      order_id: applicationId.toString(),
      order_amount: finalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${applicationId}`,
        customer_name: customer_name || "AntiLabs Customer",
        customer_email: customer_email || "no-reply@antilabs.com",
        customer_phone: customer_phone || "9999999999"
      },
      order_meta: {
        return_url: finalReturnUrl ? `${finalReturnUrl}&order_id={order_id}` : "http://localhost:5173/"
      },
      order_note: `Course Registration #${applicationId}`
    };

    // Create the order using Cashfree API
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
      console.error("Cashfree API Error Response:", data);
      throw new Error(data.message || "Failed to create Cashfree order");
    }

    return new Response(JSON.stringify({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      application_id: applicationId,
      final_amount: finalAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Cashfree edge function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
