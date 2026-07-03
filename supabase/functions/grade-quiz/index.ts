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
        const { quiz_id, section_id, answers } = await req.json()

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: quizData, error: quizError } = await supabaseAdmin
            .from('quizzes')
            .select('questions')
            .eq('quiz_id', quiz_id)
            .single()

        if (quizError || !quizData) {
            return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        let score = 0;
        const totalQuestions = quizData.questions.length;

        quizData.questions.forEach((q: any, index: number) => {
            if (answers[index] === q.correctOption) {
                score++;
            }
        });

        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= 80;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('user_id')
            .eq('auth_id', user.id)
            .single()

        if (userError || !userData) {
            return new Response(JSON.stringify({ error: 'User profile not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { error: insertError } = await supabaseAdmin
            .from('quiz_submissions')
            .insert([{
                user_id: userData.user_id,
                quiz_id: quiz_id,
                section_id: section_id,
                score: score,
                total_questions: totalQuestions,
                percentage: parseFloat(percentage.toFixed(2)),
                answers: answers
            }])

        if (insertError) {
            if (insertError.code === '23505') {
                 return new Response(
                    JSON.stringify({ success: true, score, totalQuestions, percentage, passed }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
            return new Response(JSON.stringify({ error: 'Failed to save submission' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(
            JSON.stringify({ success: true, score, totalQuestions, percentage, passed }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
})
