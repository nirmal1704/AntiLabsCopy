import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        let body;
        try {
            body = await req.json()
        } catch {
            return new Response(
                JSON.stringify({ error: 'Malformed JSON or empty request body.' }), 
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { quiz_id, section_id, answers } = body

        if (!quiz_id) {
            return new Response(
                JSON.stringify({ error: 'quiz_id is required' }), 
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!answers || !Array.isArray(answers)) {
            return new Response(
                JSON.stringify({ error: 'answers must be an array' }), 
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            return new Response(
                JSON.stringify({ error: 'Supabase credentials are not configured in environment variables.' }), 
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const supabase = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error("Auth validation failed:", authError);
            return new Response(JSON.stringify({ error: 'Unauthorized user access' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        const { data: quizData, error: quizError } = await supabaseAdmin
            .from('quizzes')
            .select('questions')
            .eq('quiz_id', quiz_id)
            .single()

        if (quizError || !quizData) {
            console.error("Failed to fetch quiz details:", quizError);
            return new Response(JSON.stringify({ error: 'Quiz details not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (!Array.isArray(quizData.questions)) {
            return new Response(JSON.stringify({ error: 'Quiz questions are not configured as an array' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        let score = 0;
        const totalQuestions = quizData.questions.length;

        quizData.questions.forEach((q: any, index: number) => {
            if (answers[index] === q.correctOption) {
                score++;
            }
        });

        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        const passed = percentage >= 80;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('user_id')
            .eq('auth_id', user.id)
            .single()

        if (userError || !userData) {
            console.error("Failed to query user profile:", userError);
            return new Response(JSON.stringify({ error: 'User profile mapping not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { error: insertError } = await supabaseAdmin
            .from('quiz_submissions')
            .insert([{
                user_id: userData.user_id,
                quiz_id: quiz_id,
                section_id: section_id || null,
                score: score,
                total_questions: totalQuestions,
                percentage: parseFloat(percentage.toFixed(2)),
                answers: answers
            }])

        if (insertError) {
            if (insertError.code === '23505') {
                 console.log(`Duplicate submission ignored for quiz_id ${quiz_id}, user_id ${userData.user_id}. Returning success results directly.`);
                 return new Response(
                    JSON.stringify({ success: true, score, totalQuestions, percentage, passed }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
            console.error("Submission insertion failed:", insertError);
            return new Response(JSON.stringify({ error: 'Failed to record quiz submission' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(
            JSON.stringify({ success: true, score, totalQuestions, percentage, passed }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (err: any) {
        console.error("grade-quiz edge function error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})

