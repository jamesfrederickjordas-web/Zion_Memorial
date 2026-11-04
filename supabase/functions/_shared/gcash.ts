// ==============================================================================
// Shared helpers for the GCash auto-debit Edge Functions (Xendit Link & Pay)
// ==============================================================================
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token, x-cron-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

export function env(name: string, fallback = ''): string {
    return Deno.env.get(name) ?? fallback;
}

export function adminClient(): SupabaseClient {
    return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: { persistSession: false, autoRefreshToken: false }
    });
}

export const round2 = (n: number) => Math.round(Number(n || 0) * 100) / 100;

// ------------------------------------------------------------------------------
// Xendit REST client
// ------------------------------------------------------------------------------
const XENDIT_BASE = 'https://api.xendit.co';

export class XenditError extends Error {
    status: number;
    code: string;
    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export async function xendit(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
    extraHeaders: Record<string, string> = {}
): Promise<any> {
    const secret = env('XENDIT_SECRET_KEY');
    if (!secret) throw new XenditError(500, 'MISSING_SECRET', 'XENDIT_SECRET_KEY is not configured on the server.');

    const res = await fetch(`${XENDIT_BASE}${path}`, {
        method,
        headers: {
            Authorization: 'Basic ' + btoa(`${secret}:`),
            'Content-Type': 'application/json',
            ...extraHeaders
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

    if (!res.ok) {
        throw new XenditError(res.status, data?.error_code || 'XENDIT_ERROR', data?.message || `Xendit request failed (${res.status})`);
    }
    return data;
}

export function pickActionUrl(obj: any): string | null {
    const actions: any[] = obj?.actions || obj?.ewallet?.actions || [];
    if (!Array.isArray(actions)) return null;
    const preferred = actions.find(a => a?.url && (a.url_type === 'WEB' || a.action === 'AUTH' || a.action === 'AUTHORIZE'))
        || actions.find(a => a?.url);
    return preferred?.url || null;
}

// ------------------------------------------------------------------------------
// Charge a linked GCash token for a given payment row
// ------------------------------------------------------------------------------
export interface ChargeInput {
    reservation: any;
    method: any;                  // payment_methods row (ACTIVE)
    amount: number;
    paymentType: 'DOWN_PAYMENT' | 'FULL_PAYMENT' | 'MONTHLY_AMORTIZATION' | 'BALANCE_PAYOFF';
    scheduleId?: number | null;
    description: string;
}

export async function chargeLinkedGcash(db: SupabaseClient, input: ChargeInput) {
    const amount = round2(input.amount);
    if (amount <= 0) throw new Error('Nothing to charge for this reservation.');

    const reference = `ZMG-${input.paymentType}-${input.reservation.id}-${Date.now().toString(36).toUpperCase()}`;

    // 1. Record the attempt first (PENDING) so we never lose track of a charge
    const { data: payment, error: payErr } = await db
        .from('payments')
        .insert([{
            reservation_id: input.reservation.id,
            payment_reference: reference,
            amount,
            payment_type: input.paymentType,
            payment_method: 'GCash',
            status: 'PENDING',
            due_date: new Date().toISOString().slice(0, 10),
            gateway: 'XENDIT',
            schedule_id: input.scheduleId ?? null
        }])
        .select()
        .single();
    if (payErr) throw payErr;

    if (input.scheduleId) {
        await db.from('payment_schedules').update({
            status: 'PROCESSING',
            payment_reference: reference,
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq('id', input.scheduleId);
    }

    // 2. Ask Xendit to debit the linked GCash wallet
    let pr: any;
    try {
        pr = await xendit('/payment_requests', 'POST', {
            reference_id: reference,
            amount,
            currency: 'PHP',
            country: 'PH',
            payment_method_id: input.method.xendit_payment_method_id,
            customer_id: input.method.xendit_customer_id || undefined,
            description: input.description.slice(0, 250),
            metadata: {
                reservation_id: String(input.reservation.id),
                reservation_number: input.reservation.reservation_number,
                payment_type: input.paymentType,
                schedule_id: input.scheduleId ? String(input.scheduleId) : ''
            }
        }, { 'idempotency-key': reference });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await markPaymentFailed(db, payment, message);
        throw err;
    }

    await db.from('payments').update({ gateway_payment_request_id: pr.id }).eq('id', payment.id);

    const status = String(pr.status || 'PENDING').toUpperCase();
    if (status === 'SUCCEEDED') {
        const applied = await markPaymentSucceeded(db, reference, pr.id);
        return { reference, status: 'SUCCEEDED', action_url: null, ...applied };
    }
    if (status === 'FAILED') {
        await markPaymentFailed(db, { ...payment, gateway_payment_request_id: pr.id }, pr.failure_code || 'Payment failed');
        return { reference, status: 'FAILED', action_url: null, failure: pr.failure_code || 'FAILED' };
    }
    return { reference, status, action_url: pickActionUrl(pr) };
}

// ------------------------------------------------------------------------------
// Idempotent result handlers (used by webhook, sync and immediate responses)
// ------------------------------------------------------------------------------
export async function markPaymentSucceeded(db: SupabaseClient, reference: string, gatewayPaymentId?: string) {
    // Only the call that flips PENDING -> COMPLETED applies money (no double-counting)
    const { data: rows } = await db
        .from('payments')
        .update({
            status: 'COMPLETED',
            paid_at: new Date().toISOString(),
            gateway_payment_id: gatewayPaymentId || null,
            failure_reason: null
        })
        .eq('payment_reference', reference)
        .neq('status', 'COMPLETED')
        .select();

    const payment = rows?.[0];
    if (!payment) return { applied: false, emailed: false };

    const { data: reservation } = await db.rpc('zmg_apply_payment_to_reservation', {
        p_reservation_id: payment.reservation_id,
        p_amount: payment.amount
    });

    const now = new Date().toISOString();
    if (payment.schedule_id) {
        await db.from('payment_schedules')
            .update({ status: 'PAID', paid_at: now, last_error: null, updated_at: now })
            .eq('id', payment.schedule_id);
    }
    if (payment.payment_type === 'BALANCE_PAYOFF' || Number(reservation?.balance ?? 1) <= 0) {
        await db.from('payment_schedules')
            .update({ status: 'PAID', paid_at: now, payment_reference: reference, updated_at: now })
            .eq('reservation_id', payment.reservation_id)
            .in('status', ['PENDING', 'FAILED', 'PROCESSING']);
    }

    const emailed = await sendReceiptEmail(db, payment, reservation, 'PAID');
    return { applied: true, emailed };
}

export async function markPaymentFailed(db: SupabaseClient, payment: any, reason: string) {
    await db.from('payments')
        .update({ status: 'FAILED', failure_reason: String(reason).slice(0, 500) })
        .eq('id', payment.id)
        .neq('status', 'COMPLETED');

    if (payment.schedule_id) {
        const { data: sched } = await db.from('payment_schedules').select('attempts').eq('id', payment.schedule_id).single();
        await db.from('payment_schedules').update({
            status: 'FAILED',
            attempts: Number(sched?.attempts || 0) + 1,
            last_error: String(reason).slice(0, 500),
            updated_at: new Date().toISOString()
        }).eq('id', payment.schedule_id);
    }
}

export async function markPaymentFailedByReference(db: SupabaseClient, reference: string, reason: string) {
    const { data: payment } = await db.from('payments').select('*').eq('payment_reference', reference).maybeSingle();
    if (payment && payment.status !== 'COMPLETED') await markPaymentFailed(db, payment, reason);
}

// ------------------------------------------------------------------------------
// Server-side email via EmailJS REST API (optional, needs EMAILJS_PRIVATE_KEY)
// ------------------------------------------------------------------------------
export function serverEmailEnabled(): boolean {
    return Boolean(env('EMAILJS_PRIVATE_KEY') && env('EMAILJS_SERVICE_ID') && env('EMAILJS_TEMPLATE_ID') && env('EMAILJS_PUBLIC_KEY'));
}

const peso = (n: number) => `₱ ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function sendEmailJS(params: Record<string, string>): Promise<boolean> {
    if (!serverEmailEnabled()) return false;
    try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: env('EMAILJS_SERVICE_ID'),
                template_id: env('EMAILJS_TEMPLATE_ID'),
                user_id: env('EMAILJS_PUBLIC_KEY'),
                accessToken: env('EMAILJS_PRIVATE_KEY'),
                template_params: params
            })
        });
        if (!res.ok) console.warn('EmailJS error', res.status, await res.text());
        return res.ok;
    } catch (e) {
        console.warn('EmailJS send failed', e);
        return false;
    }
}

async function loadContact(db: SupabaseClient, userId: string) {
    const { data: profile } = await db.from('profiles').select('full_name, username').eq('id', userId).maybeSingle();
    const { data: authUser } = await db.auth.admin.getUserById(userId);
    const email = authUser?.user?.email || '';
    const name = profile?.full_name || profile?.username || email.split('@')[0] || 'Valued Client';
    return { email, name };
}

export async function sendReceiptEmail(db: SupabaseClient, payment: any, reservation: any, tag: string): Promise<boolean> {
    if (!serverEmailEnabled() || !reservation) return false;
    const { email, name } = await loadContact(db, reservation.user_id);
    if (!email) return false;

    const { data: space } = await db.from('memorial_spaces')
        .select('plot_identifier, section_name, category').eq('id', reservation.space_id).maybeSingle();

    const typeLabel: Record<string, string> = {
        DOWN_PAYMENT: 'Down Payment',
        FULL_PAYMENT: 'Full Payment',
        MONTHLY_AMORTIZATION: 'Monthly Installment (Auto-Debit)',
        BALANCE_PAYOFF: 'Remaining Balance Payoff'
    };

    const instructions = `PAYMENT RECEIVED VIA GCASH AUTO-DEBIT (TAG: ${tag}). Reference ${payment.payment_reference}. Present this receipt at the Zion Memorial Garden counter when called.`;
    const ok = await sendEmailJS({
        to_email: email, email, user_email: email, recipient_email: email,
        to_name: name, client_name: name, user_name: name,
        name: 'Zion Memorial Garden', from_name: 'Zion Memorial Garden',
        payment_status_tag: tag, status: tag, tag,
        reservation_number: reservation.reservation_number,
        payment_reference: payment.payment_reference,
        payment_method: `GCash Auto-Debit • ${typeLabel[payment.payment_type] || payment.payment_type}`,
        gcash_reference: payment.gateway_payment_id || payment.gateway_payment_request_id || payment.payment_reference,
        plot_code: space?.plot_identifier || '-',
        section_name: `${space?.section_name || ''} (${space?.category || ''})`,
        plan_type: reservation.plan_type,
        payment_option: reservation.payment_method,
        total_price: peso(reservation.total_price),
        amount_paid_or_due: peso(payment.amount),
        amount: peso(payment.amount),
        remaining_balance: peso(reservation.balance),
        counter_instructions: instructions,
        receipt_date: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
        message: [
            `RECEIPT STATUS TAG: ${tag}`,
            `Reservation: ${reservation.reservation_number}`,
            `Payment: ${typeLabel[payment.payment_type] || payment.payment_type} — ${peso(payment.amount)}`,
            `Reference: ${payment.payment_reference}`,
            `Remaining Balance: ${peso(reservation.balance)}`,
            '',
            instructions
        ].join('\n')
    });

    if (ok) await db.from('payments').update({ receipt_emailed_at: new Date().toISOString() }).eq('id', payment.id);
    return ok;
}

export async function sendReminderEmail(db: SupabaseClient, schedule: any, reservation: any, autoDebit: boolean): Promise<boolean> {
    if (!serverEmailEnabled()) return false;
    const { email, name } = await loadContact(db, schedule.user_id);
    if (!email) return false;

    const msg = autoDebit
        ? `Reminder: your monthly installment #${schedule.installment_no} of ${peso(schedule.amount)} is due on ${schedule.due_date}. It will be AUTOMATICALLY deducted from your linked GCash. Please make sure your GCash has enough balance.`
        : `Reminder: your monthly installment #${schedule.installment_no} of ${peso(schedule.amount)} is due on ${schedule.due_date}. Pay via the Payments tab or at the Zion Memorial Garden counter.`;

    return sendEmailJS({
        to_email: email, email, user_email: email, recipient_email: email,
        to_name: name, client_name: name, user_name: name,
        name: 'Zion Memorial Garden', from_name: 'Zion Memorial Garden',
        payment_status_tag: '3-DAY DUE NOTICE', status: '3-DAY DUE NOTICE', tag: '3-DAY DUE NOTICE',
        reservation_number: reservation?.reservation_number || '',
        payment_reference: `NOTICE-${schedule.id}`,
        payment_method: autoDebit ? 'GCash Auto-Debit' : 'Manual Payment',
        gcash_reference: 'N/A',
        amount_paid_or_due: peso(schedule.amount),
        amount: peso(schedule.amount),
        remaining_balance: peso(reservation?.balance || 0),
        counter_instructions: msg,
        receipt_date: schedule.due_date,
        message: msg
    });
}
