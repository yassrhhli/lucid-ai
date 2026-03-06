// supabase/functions/revenuecat-webhook/index.ts
// Déployer : supabase functions deploy revenuecat-webhook
// Configurer dans RevenueCat Dashboard -> Webhooks -> URL: https://YOUR_PROJECT.supabase.co/functions/v1/revenuecat-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Vérifier le secret webhook RevenueCat
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    const authHeader = req.headers.get('Authorization');

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const event = await req.json();
    const { event: eventData } = event;

    // Événements RevenueCat à traiter
    const HANDLED_EVENTS = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',
      'CANCELLATION',
      'BILLING_ISSUE',
      'SUBSCRIBER_ALIAS',
      'EXPIRATION',
      'UNCANCELLATION',
    ];

    if (!HANDLED_EVENTS.includes(eventData.type)) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Init Supabase avec service role (accès complet)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const appUserId = eventData.app_user_id;
    const entitlements = eventData.entitlements ?? {};
    const isPro = Object.keys(entitlements).includes('pro') &&
      entitlements['pro']?.expires_date
        ? new Date(entitlements['pro'].expires_date) > new Date()
        : false;

    const proExpiresAt = entitlements['pro']?.expires_date ?? null;

    // Mise à jour du profil Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        is_pro: isPro,
        pro_expires_at: proExpiresAt,
        revenuecat_id: appUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appUserId);

    if (error) {
      console.error('Supabase update error:', error);
      return new Response(JSON.stringify({ error: 'DB update failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Webhook] ${eventData.type} for user ${appUserId} — isPro: ${isPro}`);

    return new Response(JSON.stringify({ received: true, isPro }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
