// ==============================================================================
// xendit-webhook  —  Receives Xendit callbacks (deploy with --no-verify-jwt)
//
// Xendit Dashboard > Settings > Webhooks: point BOTH of these to this URL:
//   * Payment Methods (payment_method.activated / expired / ...)
//   * Payment Requests / Payments (payment.succeeded / payment.failed)
// ==============================================================================
import {
    adminClient, corsHeaders, env, json, markPaymentFailedByReference, markPaymentSucceeded
} from '../_shared/gcash.ts';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    // ---- Verify the request really came from Xendit ----
    const expected = env('XENDIT_WEBHOOK_TOKEN').trim();
    const received = (req.headers.get('x-callback-token') || req.headers.get('X-Callback-Token') || '').trim();

    if (!expected) {
        console.error('XENDIT_WEBHOOK_TOKEN secret is not set in Supabase Secrets.');
        return json({
            error: 'XENDIT_WEBHOOK_TOKEN is not configured in Supabase Secrets. Please run: supabase secrets set XENDIT_WEBHOOK_TOKEN="<your_xendit_token>"'
        }, 401);
    }

    if (received !== expected) {
        console.error(`Callback token mismatch. Expected starts with: "${expected.slice(0, 4)}...", Received: "${received ? received.slice(0, 4) + '...' : '(empty)'}"`);
        return json({
            error: 'Invalid callback token. The token sent by Xendit does not match XENDIT_WEBHOOK_TOKEN in your Supabase Secrets.'
        }, 401);
    }

    let payload: any;
    try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const db = adminClient();
    const event = String(payload.event || payload.type || '').toLowerCase();
    const data = payload.data || payload;

    await db.from('payment_gateway_events').insert([{
        provider: 'XENDIT',
        event_type: event || null,
        reference: data?.reference_id || data?.id || null,
        payload
    }]);

    try {
        // ---- 1. GCash account linking / tokenization results ----
        // Covers modern "Payment Token Status" (payment_token.*) and v2 (payment_method.*)
        if (event.startsWith('payment_token') || event.startsWith('payment_method')) {
            const pmId = data?.id || data?.payment_token_id || data?.payment_method_id;
            const rawStatus = String(data?.status || '').toUpperCase();
            const status = ['ACTIVE', 'INACTIVE', 'EXPIRED', 'FAILED', 'PENDING'].includes(rawStatus)
                ? rawStatus
                : (event.includes('activated') || event.includes('activation') ? 'ACTIVE'
                    : event.includes('expired') || event.includes('expiry') ? 'EXPIRED'
                    : 'FAILED');
            const label = data?.ewallet?.account?.account_details || data?.ewallet?.account?.name || data?.account_details || null;

            if (pmId) {
                await db.from('payment_methods').update({
                    status,
                    ...(label ? { account_label: label } : {}),
                    failure_reason: data?.failure_code || data?.failure_reason || null,
                    updated_at: new Date().toISOString()
                }).eq('xendit_payment_method_id', pmId);
            }
            return json({ ok: true, type: 'payment_token' });
        }

        // ---- 2. Charge, deduction & Virtual Account results ----
        // Covers modern "Payment Request Status" (payment_request.*), "Payment Status" (payment.*, ewallet.*), and Virtual Accounts (va.*, virtual_account.*)
        if (event.startsWith('payment') || event.startsWith('payment_request') || event.startsWith('ewallet') || event.startsWith('virtual_account') || event.startsWith('va_')) {
            const reference = data?.reference_id || data?.payment_request_id || data?.external_id || data?.id;
            const status = String(data?.status || '').toUpperCase();
            if (!reference) return json({ ok: true, note: 'no reference_id (test event acknowledged)' });

            const isSuccess = status === 'SUCCEEDED' || status === 'COMPLETED' || status === 'PAID' || event.includes('succeeded') || event.includes('capture') || event.includes('paid');
            const isFailure = ['FAILED', 'EXPIRED', 'CANCELED', 'CANCELLED'].includes(status) || event.includes('failed') || event.includes('failure');

            if (isSuccess) {
                await markPaymentSucceeded(db, reference, data?.id || data?.payment_id);
            } else if (isFailure) {
                await markPaymentFailedByReference(db, reference, data?.failure_code || data?.failure_reason || status || 'FAILED');
            }
            return json({ ok: true, type: 'payment_status' });
        }

        return json({ ok: true, ignored: event });
    } catch (err) {
        console.error('Webhook processing error', err);
        // Return 500 so Xendit retries later
        return json({ error: err instanceof Error ? err.message : String(err) }, 500);
    }
});

