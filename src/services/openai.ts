import { supabase } from './supabase';
import type { DreamInterpretation } from '@/types/dream';

export interface InterpretationResult {
  interpretation?: DreamInterpretation;
  error?: string;
  quotaExceeded?: boolean;
  quota?: { used: number; limit: number; resets_at: string };
}

export async function interpretDream(dreamId: string): Promise<InterpretationResult> {
  // ── 1. Récupérer le token de session ────────────────────────
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return { error: 'Not authenticated. Please sign in again.' };
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const anonKey     = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  // ── 2. Appel Edge Function — avec retry sur réseau ──────────
  let response: Response;
  let attempts = 0;

  while (attempts < 2) {
    try {
      response = await fetch(`${supabaseUrl}/functions/v1/interpret-dream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': anonKey,
        },
        body: JSON.stringify({ dream_id: dreamId }),
      });
      break;
    } catch (networkErr: any) {
      attempts++;
      if (attempts >= 2) {
        return { error: 'No internet connection. Please try again.' };
      }
      // Attendre 1s avant retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // ── 3. Parser la réponse ─────────────────────────────────────
  let data: any;
  try {
    data = await response!.json();
  } catch {
    return { error: 'Invalid response from server.' };
  }

  // ── 4. Gérer les cas d'erreur ────────────────────────────────
  if (response!.status === 429 && data.error === 'QUOTA_EXCEEDED') {
    return { quotaExceeded: true, quota: data.quota };
  }

  if (response!.status === 401) {
    return { error: 'Session expired. Please sign in again.' };
  }

  if (response!.status === 404) {
    return { error: 'Dream not found.' };
  }

  if (!response!.ok) {
    return { error: data.error ?? 'Interpretation failed. Please try again.' };
  }

  return { interpretation: data.interpretation as DreamInterpretation };
}
