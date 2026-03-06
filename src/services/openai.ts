import { supabase } from './supabase';
import type { DreamInterpretation } from '@/types/dream';

export interface InterpretationResult {
  interpretation?: DreamInterpretation;
  error?: string;
  quotaExceeded?: boolean;
  quota?: { used: number; limit: number; resets_at: string };
}

export async function interpretDream(dreamId: string): Promise<InterpretationResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    return { error: 'Not authenticated' };
  }

  console.log('[OpenAI] Token (first 20):', token.slice(0, 20));
  console.log('[OpenAI] Calling Edge Function with dream:', dreamId);

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/interpret-dream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ dream_id: dreamId }),
    }
  );

  console.log('[OpenAI] Response status:', response.status);
  const data = await response.json();
  console.log('[OpenAI] Response:', JSON.stringify(data).slice(0, 300));

  if (response.status === 429 && data.error === 'QUOTA_EXCEEDED') {
    return { quotaExceeded: true, quota: data.quota };
  }

  if (!response.ok) {
    return { error: data.error ?? 'Interpretation failed' };
  }

  return { interpretation: data.interpretation as DreamInterpretation };
}
