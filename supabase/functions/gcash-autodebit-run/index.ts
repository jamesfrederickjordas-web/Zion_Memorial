// ==============================================================================
// gcash-autodebit-run  —  Daily job (called by pg_cron, deploy with --no-verify-jwt)
//
//  1. Charges every installment that is due today or overdue (max 3 attempts,
//     at most one retry per day) for users with an ACTIVE GCash + auto-debit ON.
//  2. Emails a reminder 3 days before each due date.
//
// Protected by the x-cron-secret header (must equal the CRON_SECRET secret).
// You can also trigger it manually for testing (see GCASH_AUTODEBIT_SETUP.md).
// ==============================================================================
import {
    adminClient, chargeLinkedGcash, corsHeaders, env, json, round2, sendReminderEmail
} from '../_shared/gcash.ts';

const MAX_ATTEMPTS = 3;

function manilaDate(offsetDays = 0): string {
    const now = new Date(Date.now() + 8 * 3600 * 1000 + offsetDays * 86400000);
    return now.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    const secret = env('CRON_SECRET');
    if (!secret || req.headers.get('x-cron-secret') !== secret) {
        return json({ error: 'Unauthorized' }, 401);
    }

    const db = adminClient();
    const today = manilaDate(0);
    const oneDayAgo = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    const summary = { date: today, charged: 0, succeeded: 0, pending: 0, failed: 0, skipped: 0, reminders: 0, errors: [] as string[] };

    // ---------------- 1. AUTO-DEBIT DUE INSTALLMENTS ----------------
    const { data: due } = await db.from('payment_schedules')
        .select('*')
        .lte('due_date', today)
        .in('status', ['PENDING', 'FAILED'])
        .lt('attempts', MAX_ATTEMPTS)
        .order('due_date', { ascending: true })
        .limit(200);

    const methodCache = new Map<string, any>();

    for (const s of due || []) {
        try {
            if (s.last_attempt_at && s.last_attempt_at > oneDayAgo) { summary.skipped++; continue; }

            if (!methodCache.has(s.user_id)) {
                const { data: m } = await db.from('payment_methods')
                    .select('*')
                    .eq('user_id', s.user_id)
                    .eq('status', 'ACTIVE')
                    .eq('auto_debit_enabled', true)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                methodCache.set(s.user_id, m || null);
            }
            const method = methodCache.get(s.user_id);
            if (!method) { summary.skipped++; continue; }

            const { data: r } = await db.from('reservations').select('*').eq('id', s.reservation_id).maybeSingle();
            if (!r || ['CANCELLED', 'REJECTED'].includes(r.status) || Number(r.balance) <= 0) {
                summary.skipped++;
                continue;
            }

            const amount = round2(Math.min(Number(s.amount), Number(r.balance)));
            summary.charged++;
            const result = await chargeLinkedGcash(db, {
                reservation: r,
                method,
                amount,
                paymentType: 'MONTHLY_AMORTIZATION',
                scheduleId: s.id,
                description: `Zion Memorial Garden auto-debit installment #${s.installment_no} - ${r.reservation_number}`
            });
            if (result.status === 'SUCCEEDED') summary.succeeded++;
            else if (result.status === 'FAILED') summary.failed++;
            else summary.pending++;
        } catch (err) {
            summary.failed++;
            summary.errors.push(`schedule ${s.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    // ---------------- 2. 3-DAY PRE-DUE REMINDERS ----------------
    const reminderDay = manilaDate(3);
    const { data: upcoming } = await db.from('payment_schedules')
        .select('*')
        .eq('due_date', reminderDay)
        .eq('status', 'PENDING')
        .is('reminder_sent_at', null)
        .limit(500);

    for (const s of upcoming || []) {
        try {
            const { data: r } = await db.from('reservations').select('*').eq('id', s.reservation_id).maybeSingle();
            if (!r || ['CANCELLED', 'REJECTED'].includes(r.status)) continue;
            const { data: m } = await db.from('payment_methods')
                .select('id').eq('user_id', s.user_id).eq('status', 'ACTIVE').eq('auto_debit_enabled', true).limit(1).maybeSingle();
            const sent = await sendReminderEmail(db, s, r, Boolean(m));
            if (sent) {
                summary.reminders++;
                await db.from('payment_schedules').update({ reminder_sent_at: new Date().toISOString() }).eq('id', s.id);
            }
        } catch (err) {
            summary.errors.push(`reminder ${s.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    console.log('[gcash-autodebit-run]', JSON.stringify(summary));
    return json(summary);
});

