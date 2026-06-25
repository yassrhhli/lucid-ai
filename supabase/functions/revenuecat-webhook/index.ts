import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ── Types RevenueCat ───────────────────────────────────────────
type RCEventType =
  | 'INITIAL_PURCHASE' | 'RENEWAL' | 'PRODUCT_CHANGE'
  | 'CANCELLATION' | 'BILLING_ISSUE' | 'EXPIRATION'
  | 'SUBSCRIBER_ALIAS' | 'TRANSFER' | 'NON_RENEWING_PURCHASE';

interface RCEvent {
  type: RCEventType;
  app_user_id: string;
  aliases?: string[];
  expiration_at_ms?: number;
  entitlement_ids?: string[];
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── 1. Vérification du secret — TOUJOURS obligatoire ────────
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!webhookSecret) {
    // Fail closed — si la variable n'est pas configurée, on bloque tout
    console.error('[RC Webhook] REVENUECAT_WEBHOOK_SECRET not configured');
    return new Response('Service misconfigured', { status: 503 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader !== `Bearer ${webhookSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ── 2. Parser le body ────────────────────────────────────────
  let event: RCEvent;
  try {
    const body = await req.json();
    event = body.event as RCEvent;
    if (!event?.type || !event?.app_user_id) {
      return new Response('Invalid payload', { status: 400 });
    }
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // ── 3. Client Supabase admin ─────────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('MY_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  const userId = event.app_user_id;

  // ── 4. Router les événements ─────────────────────────────────
  try {
    switch (event.type) {

      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
      case 'NON_RENEWING_PURCHASE': {
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;
        await adminClient.from('profiles').update({
          is_pro:         true,
          pro_expires_at: expiresAt,
          // Reset le quota si passage en Pro
          interpretation_count_week: 0,
          interpretation_reset_at:   new Date().toISOString(),
        }).eq('id', userId);
        break;
      }

      case 'EXPIRATION':
      case 'CANCELLATION': {
        // Pour CANCELLATION on garde pro jusqu'à expiration réelle
        const expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;
        const isStillActive = expiresAt ? new Date(expiresAt) > new Date() : false;
        await adminClient.from('profiles').update({
          is_pro:         isStillActive,
          pro_expires_at: expiresAt,
        }).eq('id', userId);
        break;
      }

      case 'BILLING_ISSUE': {
        // Ne pas révoquer immédiatement — laisser une grace period
        // RevenueCat gère la grace period et enverra EXPIRATION si non réglé
        break;
      }

      case 'TRANSFER': {
        // Révoquer l'ancien user, activer le nouveau
        if (event.aliases && event.aliases.length > 0) {
          const newUserId = event.aliases[0];
          await adminClient.from('profiles').update({ is_pro: false, pro_expires_at: null }).eq('id', userId);
          await adminClient.from('profiles').update({ is_pro: true }).eq('id', newUserId);
        }
        break;
      }

      default:
        // Événement non géré — on retourne 200 quand même pour pas que RC retry
        break;
    }

    return new Response('OK', { status: 200 });

  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[RC Webhook] Handler error:', message.slice(0, 200));
    return new Response('Internal error', { status: 500 });
  }
});
