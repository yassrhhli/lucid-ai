import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // ==== VÉRIFICATION HMAC ====
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return new Response('Webhook secret not configured', { status: 500, headers: corsHeaders });
  }

  const signature = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!signature) {
    console.error('Missing signature');
    return new Response('Missing signature', { status: 401, headers: corsHeaders });
  }

  const bodyText = await req.text();
  
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const messageData = encoder.encode(bodyText);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageData
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid HMAC signature');
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }
  } catch (error) {
    console.error('HMAC verification error:', error);
    return new Response('HMAC verification failed', { status: 401, headers: corsHeaders });
  }
  // ==== FIN HMAC ====

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (error) {
    console.error('Invalid JSON body:', error);
    return new Response('Invalid JSON body', { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('MY_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const user_id = body.aliases?.[0] || body.app_user_id;

  if (!user_id) {
    console.error('No user_id found in webhook');
    return new Response('No user_id found', { status: 400, headers: corsHeaders });
  }

  const event = body.event;

  if (event.type === 'TRANSFER') {
    const transferredFrom = event.transferred_from;
    const transferredTo = event.transferred_to;
    
    if (transferredFrom && transferredTo) {
      console.log(`Transfer from ${transferredFrom} to ${transferredTo}`);
      
      await supabase
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', transferredFrom);
      
      await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', transferredTo);
    }
  }

  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    const isPro = event.entitlements?.pro?.is_active || false;
    
    await supabase
      .from('profiles')
      .update({ is_pro: isPro })
      .eq('id', user_id);
  }

  if (event.type === 'EXPIRATION' || event.type === 'CANCELLATION') {
    await supabase
      .from('profiles')
      .update({ is_pro: false })
      .eq('id', user_id);
  }

  console.log(`Webhook processed successfully for user ${user_id}`);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
});
