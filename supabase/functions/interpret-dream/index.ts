import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function decodeJWT(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch { return null; }
}

const SYSTEM_PROMPT = `You are Lucid, an expert AI dream analyst combining Jungian psychology, neuroscience, and cross-cultural symbolism. Always respond in valid JSON. Never add commentary outside the JSON. Respond in the same language as the dream content.`;

const PROMPT = (content: string, emotions: string[]) => `Analyze this dream and return ONLY a JSON object:
{
  "symbols": [{"name": "string", "meaning": "string (2-3 sentences)", "archetype": "string or null"}],
  "emotional_analysis": "string (3-4 sentences)",
  "psychological_insight": "string (4-5 sentences)",
  "archetypes": ["string"],
  "recurring_themes": ["string"],
  "affirmation": "string (one powerful affirmation)"
}
Dream: "${content.slice(0, 2000)}"
Emotions: ${emotions.join(', ') || 'not specified'}
Return ONLY valid JSON with 3-6 symbols.`;

async function callAI(apiUrl: string, apiKey: string, model: string, content: string, emotions: string[]): Promise<any> {
  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: PROMPT(content, emotions) }
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`${model} failed: ${err}`);
  }
  return resp.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('MY_SERVICE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const payload = decodeJWT(token);
    const userId = payload?.sub?.trim();

    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const body = await req.json();
    const dream_id = body.dream_id?.trim();
    if (!dream_id) return new Response(JSON.stringify({ error: 'dream_id required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const { data: dream, error: dreamError } = await adminClient
      .from('dreams').select('*').eq('id', dream_id).eq('user_id', userId).single();
    if (dreamError || !dream) return new Response(JSON.stringify({ error: 'Dream not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const { data: existing } = await adminClient
      .from('interpretations').select('*').eq('dream_id', dream_id).single();
    if (existing) return new Response(JSON.stringify({ interpretation: existing }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const { data: profile } = await adminClient
      .from('profiles').select('is_pro, interpretation_count_week, interpretation_reset_at').eq('id', userId).single();
    if (!profile) return new Response(JSON.stringify({ error: 'Profile not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const resetAt = new Date(profile.interpretation_reset_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let weekCount = profile.interpretation_count_week;
    if (resetAt < weekAgo) {
      await adminClient.from('profiles').update({
        interpretation_count_week: 0,
        interpretation_reset_at: new Date().toISOString()
      }).eq('id', userId);
      weekCount = 0;
    }
    if (!profile.is_pro && weekCount >= 3) {
      return new Response(JSON.stringify({ error: 'QUOTA_EXCEEDED', quota: { used: weekCount, limit: 3 } }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback chain: DeepSeek → Groq → OpenAI
    const providers = [
      { key: Deno.env.get('DEEPSEEK_API_KEY'), url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', name: 'DeepSeek' },
      { key: Deno.env.get('GROQ_API_KEY'), url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', name: 'Groq' },
      { key: Deno.env.get('OPENAI_API_KEY'), url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', name: 'OpenAI' },
    ].filter(p => p.key);

    let aiData: any = null;
    let usedModel = '';

    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name}...`);
        aiData = await callAI(provider.url, provider.key!, provider.model, dream.content, dream.emotions ?? []);
        usedModel = provider.model;
        console.log(`Success with ${provider.name}`);
        break;
      } catch (err) {
        console.error(`${provider.name} failed:`, err);
        continue;
      }
    }

    if (!aiData) {
      return new Response(JSON.stringify({ error: 'All AI providers failed' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(aiData.choices[0].message.content);

    const { data: interpretation, error: insertError } = await adminClient
      .from('interpretations').insert({
        dream_id, user_id: userId,
        symbols: parsed.symbols ?? [],
        emotional_analysis: parsed.emotional_analysis ?? '',
        psychological_insight: parsed.psychological_insight ?? '',
        archetypes: parsed.archetypes ?? [],
        recurring_themes: parsed.recurring_themes ?? [],
        affirmation: parsed.affirmation ?? '',
        model_used: usedModel,
        tokens_used: aiData.usage?.total_tokens ?? 0,
        prompt_version: 'v3.0',
      }).select().single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Save failed', detail: insertError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await adminClient.from('profiles').update({ interpretation_count_week: weekCount + 1 }).eq('id', userId);

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Unhandled:', err);
    return new Response(JSON.stringify({ error: 'Internal error', detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
