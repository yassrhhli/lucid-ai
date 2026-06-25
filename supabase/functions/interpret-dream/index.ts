import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ── CORS — restreindre en production ──────────────────────────
const ALLOWED_ORIGINS = ['lucidai://', 'https://lucidai.app'];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(data: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

// ── AI Prompts ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Lucid, an expert AI dream analyst combining Jungian psychology, neuroscience, and cross-cultural symbolism. Always respond in valid JSON only. Never add commentary outside the JSON. Respond in the same language as the dream content.`;

const buildPrompt = (content: string, emotions: string[]) =>
  `Analyze this dream and return ONLY a JSON object with exactly these fields:
{
  "symbols": [{"name": "string", "meaning": "string (2-3 sentences)", "archetype": "string or null"}],
  "emotional_analysis": "string (3-4 sentences)",
  "psychological_insight": "string (4-5 sentences)",
  "archetypes": ["string"],
  "recurring_themes": ["string"],
  "affirmation": "string (one powerful, personal affirmation)"
}
Dream: "${content.slice(0, 2000)}"
Emotions reported: ${emotions.length ? emotions.join(', ') : 'not specified'}
Rules: 3–6 symbols. Return ONLY valid JSON, no markdown, no explanation.`;

// ── AI call with timeout ────────────────────────────────────────
async function callAI(
  apiUrl: string,
  apiKey: string,
  model: string,
  content: string,
  emotions: string[],
  timeoutMs = 25_000,
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: buildPrompt(content, emotions) },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${err.slice(0, 200)}`);
    }
    return resp.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Main handler ───────────────────────────────────────────────
serve(async (req) => {
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin);
  }

  try {
    // ── 1. Vérification JWT cryptographique ─────────────────
    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
    const serviceKey   = Deno.env.get('MY_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient  = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) return json({ error: 'Unauthorized' }, 401, origin);

    // ← Vérification cryptographique réelle (remplace atob())
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !user) return json({ error: 'Unauthorized' }, 401, origin);
    const userId = user.id;

    // ── 2. Validation de l'input ────────────────────────────
    let body: any;
    try { body = await req.json(); }
    catch { return json({ error: 'Invalid JSON body' }, 400, origin); }

    const dream_id = body.dream_id?.trim?.();
    if (!dream_id || typeof dream_id !== 'string') {
      return json({ error: 'dream_id is required' }, 400, origin);
    }

    // ── 3. Vérifier que le rêve appartient à cet utilisateur ─
    const { data: dream, error: dreamError } = await adminClient
      .from('dreams')
      .select('id, content, emotions, user_id')
      .eq('id', dream_id)
      .eq('user_id', userId) // ← RLS double-check
      .is('deleted_at', null)
      .single();

    if (dreamError || !dream) return json({ error: 'Dream not found' }, 404, origin);
    if (!dream.content?.trim()) return json({ error: 'Dream content is empty' }, 400, origin);

    // ── 4. Vérifier si interprétation déjà existante ────────
    const { data: existing } = await adminClient
      .from('interpretations')
      .select('*')
      .eq('dream_id', dream_id)
      .maybeSingle();

    if (existing) return json({ interpretation: existing }, 200, origin);

    // ── 5. Quota freemium ───────────────────────────────────
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_pro, interpretation_count_week, interpretation_reset_at')
      .eq('id', userId)
      .single();

    if (!profile) return json({ error: 'Profile not found' }, 404, origin);

    const resetAt = new Date(profile.interpretation_reset_at ?? 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let weekCount = profile.interpretation_count_week ?? 0;

    if (resetAt < weekAgo) {
      await adminClient.from('profiles').update({
        interpretation_count_week: 0,
        interpretation_reset_at: new Date().toISOString(),
      }).eq('id', userId);
      weekCount = 0;
    }

    if (!profile.is_pro && weekCount >= 3) {
      const resets_at = new Date(resetAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return json({
        error: 'QUOTA_EXCEEDED',
        quota: { used: weekCount, limit: 3, resets_at },
      }, 429, origin);
    }

    // ── 6. Fallback chain AI: DeepSeek → Groq → OpenAI ─────
    const providers = [
      {
        name: 'DeepSeek',
        key: Deno.env.get('DEEPSEEK_API_KEY'),
        url: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-chat',
      },
      {
        name: 'Groq',
        key: Deno.env.get('GROQ_API_KEY'),
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
      },
      {
        name: 'OpenAI',
        key: Deno.env.get('OPENAI_API_KEY'),
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4o-mini',
      },
    ].filter(p => p.key);

    if (providers.length === 0) {
      return json({ error: 'No AI providers configured' }, 503, origin);
    }

    let aiData: any = null;
    let usedModel  = '';
    let lastError  = '';

    for (const provider of providers) {
      try {
        aiData = await callAI(
          provider.url, provider.key!, provider.model,
          dream.content, dream.emotions ?? [],
        );
        usedModel = provider.model;
        break;
      } catch (err: any) {
        lastError = `${provider.name}: ${err.message}`;
        continue;
      }
    }

    if (!aiData) {
      return json({ error: 'All AI providers failed', detail: lastError }, 503, origin);
    }

    // ── 7. Parser la réponse ────────────────────────────────
    let parsed: any;
    try {
      const raw = aiData.choices?.[0]?.message?.content ?? '';
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: 'AI returned invalid JSON' }, 502, origin);
    }

    // ── 8. Sauvegarder en DB ────────────────────────────────
    const { data: interpretation, error: insertError } = await adminClient
      .from('interpretations')
      .insert({
        dream_id,
        user_id: userId,
        symbols:               parsed.symbols              ?? [],
        emotional_analysis:    parsed.emotional_analysis   ?? '',
        psychological_insight: parsed.psychological_insight ?? '',
        archetypes:            parsed.archetypes            ?? [],
        recurring_themes:      parsed.recurring_themes      ?? [],
        affirmation:           parsed.affirmation           ?? '',
        model_used:            usedModel,
        tokens_used:           aiData.usage?.total_tokens  ?? 0,
        prompt_version:        'v4.0',
      })
      .select()
      .single();

    if (insertError) {
      return json({ error: 'Failed to save interpretation' }, 500, origin);
    }

    // ── 9. Incrémenter le quota utilisateur ─────────────────
    await adminClient
      .from('profiles')
      .update({ interpretation_count_week: weekCount + 1 })
      .eq('id', userId);

    return json({ interpretation }, 200, origin);

  } catch (err: any) {
    // Log minimal — pas de stack trace en prod
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: 'Internal server error', ref: message.slice(0, 100) }, 500, origin);
  }
});
