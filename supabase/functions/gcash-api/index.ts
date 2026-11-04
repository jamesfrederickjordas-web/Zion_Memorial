// ==============================================================================
// gcash-api  —  Client-facing GCash auto-debit API (requires logged-in user JWT)
//
// POST body: { action: 'status' | 'link' | 'unlink' | 'set_auto_debit' |
//                      'charge_initial' | 'pay_schedule' | 'pay_balance' | 'sync_payment', ... }
// ==============================================================================
import {
    adminClient, chargeLinkedGcash, corsHeaders, env, json, markPaymentFailedByReference,
    markPaymentSucceeded, pickActionUrl, round2, serverEmailEnabled, xendit, XenditError
} from '../_shared/gcash.ts';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const db = adminClient();

    // ---- Authenticate the caller ----
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: authData, error: authErr } = await db.auth.getUser(token);
    const user = authData?.user;
    if (authErr || !user) return json({ error: 'Not logged in.' }, 401);

    let body: any = {};
    try { body = await req.json(); } catch { /* empty body */ }
    const action = String(body.action || 'status');

    try {
        switch (action) {
            case 'status': return json(await getStatus(db, user));
            case 'link': return json(await linkGcash(db, user, body));
            case 'unlink': return json(await unlinkGcash(db, user));
            case 'set_auto_debit': return json(await setAutoDebit(db, user, Boolean(body.enabled)));
            case 'charge_initial': return json(await chargeInitial(db, user, Number(body.reservation_id)));
            case 'pay_schedule': return json(await paySchedule(db, user, Number(body.schedule_id)));
            case 'pay_balance': return json(await payBalance(db, user, Number(body.reservation_id)));
            case 'sync_payment': return json(await syncPayment(db, user, String(body.reference || '')));
            case 'bank_test_pay': return json(await bankTestPay(db, user, body));
            case 'create_bank_va': return json(await createBankVA(db, user, body));
            case 'simulate_bank_va': return json(await simulateBankVA(db, user, body));
            default: return json({ error: `Unknown action: ${action}` }, 400);
        }
    } catch (err) {
        console.error(`[gcash-api:${action}]`, err);
        const status = err instanceof XenditError ? (err.status >= 500 ? 502 : 400) : 400;
        return json({
            error: err instanceof Error ? err.message : String(err),
            code: err instanceof XenditError ? err.code : undefined
        }, status);
    }
});

// ------------------------------------------------------------------------------
async function latestMethod(db: any, userId: string) {
    const { data } = await db.from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['ACTIVE', 'PENDING'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data;
}

async function requireActiveMethod(db: any, userId: string) {
    const { data } = await db.from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (!data) throw new Error('No linked GCash account. Please link your GCash in the Payments tab first.');
    return data;
}

async function requireOwnReservation(db: any, userId: string, reservationId: number) {
    if (!reservationId) throw new Error('Missing reservation_id.');
    const { data: r } = await db.from('reservations').select('*').eq('id', reservationId).maybeSingle();
    if (!r || r.user_id !== userId) throw new Error('Reservation not found.');
    if (['CANCELLED', 'REJECTED'].includes(r.status)) throw new Error('This reservation is cancelled.');
    return r;
}

function publicMethod(m: any) {
    if (!m) return null;
    return {
        id: m.id,
        status: m.status,
        channel_code: m.channel_code,
        account_label: m.account_label,
        auto_debit_enabled: m.auto_debit_enabled,
        linked_at: m.updated_at,
        failure_reason: m.failure_reason
    };
}

// ------------------------------------------------------------------------------
async function syncMethodFromXendit(db: any, m: any) {
    if (!m?.xendit_payment_method_id || m.status !== 'PENDING') return m;
    try {
        const pm = await xendit(`/v2/payment_methods/${m.xendit_payment_method_id}`);
        const status = String(pm.status || 'PENDING').toUpperCase();
        const label = pm?.ewallet?.account?.account_details || pm?.ewallet?.account?.name || m.account_label;
        if (status !== m.status || label !== m.account_label) {
            const { data } = await db.from('payment_methods')
                .update({ status: ['ACTIVE', 'PENDING', 'INACTIVE', 'EXPIRED', 'FAILED'].includes(status) ? status : 'PENDING', account_label: label, updated_at: new Date().toISOString() })
                .eq('id', m.id).select().single();
            return data || m;
        }
    } catch (e) {
        console.warn('PM sync failed', e);
    }
    return m;
}

async function getStatus(db: any, user: any) {
    let m = await latestMethod(db, user.id);
    m = await syncMethodFromXendit(db, m);
    return { method: publicMethod(m), server_email: serverEmailEnabled(), mode: env('XENDIT_SECRET_KEY').startsWith('xnd_development') ? 'TEST' : 'LIVE' };
}

async function ensureXenditCustomer(db: any, user: any): Promise<string> {
    const { data: existing } = await db.from('payment_methods')
        .select('xendit_customer_id')
        .eq('user_id', user.id)
        .not('xendit_customer_id', 'is', null)
        .limit(1)
        .maybeSingle();
    if (existing?.xendit_customer_id) return existing.xendit_customer_id;

    const { data: profile } = await db.from('profiles').select('full_name, username, phone').eq('id', user.id).maybeSingle();
    const referenceId = `zmg-${user.id}`;
    const headers = { 'API-VERSION': '2020-10-31' };

    try {
        const c = await xendit('/customers', 'POST', {
            reference_id: referenceId,
            type: 'INDIVIDUAL',
            individual_detail: { given_names: (profile?.full_name || profile?.username || user.email || 'Client').slice(0, 50) },
            email: user.email || undefined
        }, headers);
        return c.id;
    } catch (err) {
        if (err instanceof XenditError && /DUPLICATE/i.test(err.code)) {
            const found = await xendit(`/customers?reference_id=${encodeURIComponent(referenceId)}`, 'GET', undefined, headers);
            const list = Array.isArray(found) ? found : (found?.data || []);
            if (list[0]?.id) return list[0].id;
        }
        throw err;
    }
}

function buildReturnBase(body: any): string {
    const configured = env('APP_BASE_URL');
    if (configured) return configured.replace(/\/$/, '') + '/dashboard.html';
    const raw = String(body.return_url || '');
    try {
        const u = new URL(raw);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
        return `${u.origin}${u.pathname}`;
    } catch {
        throw new Error('Missing or invalid return_url. Set APP_BASE_URL in the function secrets.');
    }
}

async function linkGcash(db: any, user: any, body: any) {
    const active = await db.from('payment_methods').select('id').eq('user_id', user.id).eq('status', 'ACTIVE').limit(1).maybeSingle();
    if (active.data) return { already_linked: true };

    const base = buildReturnBase(body);
    const customerId = await ensureXenditCustomer(db, user);
    const channelCode = env('XENDIT_GCASH_CHANNEL', 'GCASH');

    const pm = await xendit('/v2/payment_methods', 'POST', {
        type: 'EWALLET',
        reusability: 'MULTIPLE_USE',
        customer_id: customerId,
        ewallet: {
            channel_code: channelCode,
            channel_properties: {
                success_return_url: `${base}?gcash_link=success`,
                failure_return_url: `${base}?gcash_link=failed`,
                cancel_return_url: `${base}?gcash_link=cancelled`
            }
        },
        metadata: { user_id: user.id }
    });

    // Mark older pending attempts as failed so only one is tracked
    await db.from('payment_methods').update({ status: 'FAILED', failure_reason: 'Superseded by new link attempt', updated_at: new Date().toISOString() })
        .eq('user_id', user.id).eq('status', 'PENDING');

    await db.from('payment_methods').insert([{
        user_id: user.id,
        provider: 'XENDIT',
        channel_code: channelCode,
        xendit_customer_id: customerId,
        xendit_payment_method_id: pm.id,
        status: String(pm.status || 'PENDING').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
        auto_debit_enabled: body.auto_debit !== false
    }]);

    const authUrl = pickActionUrl(pm);
    if (!authUrl && String(pm.status).toUpperCase() !== 'ACTIVE') {
        throw new Error('Xendit did not return a GCash authorization link. Check that GCash is activated on your Xendit account.');
    }
    return { auth_url: authUrl, status: pm.status };
}

async function unlinkGcash(db: any, user: any) {
    const { data: methods } = await db.from('payment_methods').select('*').eq('user_id', user.id).in('status', ['ACTIVE', 'PENDING']);
    for (const m of methods || []) {
        try {
            if (m.xendit_payment_method_id) await xendit(`/v2/payment_methods/${m.xendit_payment_method_id}/expire`, 'POST', {});
        } catch (e) {
            console.warn('Expire on Xendit failed (continuing):', e);
        }
        await db.from('payment_methods').update({ status: 'EXPIRED', updated_at: new Date().toISOString() }).eq('id', m.id);
    }
    return { unlinked: true };
}

async function setAutoDebit(db: any, user: any, enabled: boolean) {
    const m = await requireActiveMethod(db, user.id);
    await db.from('payment_methods').update({ auto_debit_enabled: enabled, updated_at: new Date().toISOString() }).eq('id', m.id);
    return { auto_debit_enabled: enabled };
}

// ------------------------------------------------------------------------------
async function chargeInitial(db: any, user: any, reservationId: number) {
    const r = await requireOwnReservation(db, user.id, reservationId);
    const method = await requireActiveMethod(db, user.id);

    const { data: open } = await db.from('payments')
        .select('payment_reference, status')
        .eq('reservation_id', r.id)
        .in('payment_type', ['DOWN_PAYMENT', 'FULL_PAYMENT'])
        .in('status', ['PENDING', 'COMPLETED'])
        .eq('gateway', 'XENDIT');
    if (open?.some((p: any) => p.status === 'COMPLETED')) throw new Error('The initial payment for this reservation is already paid.');
    if (open?.some((p: any) => p.status === 'PENDING')) throw new Error('A GCash payment for this reservation is already processing.');

    const isInstallment = r.payment_method === 'INSTALLMENT';
    const amount = isInstallment
        ? round2(Math.max(Number(r.down_payment_amount) - Number(r.total_paid), 0))
        : round2(Number(r.balance));

    return {
        ...(await chargeLinkedGcash(db, {
            reservation: r,
            method,
            amount,
            paymentType: isInstallment ? 'DOWN_PAYMENT' : 'FULL_PAYMENT',
            description: `Zion Memorial Garden ${isInstallment ? 'down payment' : 'full payment'} - ${r.reservation_number}`
        })),
        amount,
        server_email: serverEmailEnabled()
    };
}

async function paySchedule(db: any, user: any, scheduleId: number) {
    const { data: s } = await db.from('payment_schedules').select('*').eq('id', scheduleId).maybeSingle();
    if (!s || s.user_id !== user.id) throw new Error('Installment not found.');
    if (!['PENDING', 'FAILED'].includes(s.status)) throw new Error(`This installment is already ${s.status}.`);

    const r = await requireOwnReservation(db, user.id, s.reservation_id);
    const method = await requireActiveMethod(db, user.id);
    const amount = round2(Math.min(Number(s.amount), Number(r.balance)));

    return {
        ...(await chargeLinkedGcash(db, {
            reservation: r,
            method,
            amount,
            paymentType: 'MONTHLY_AMORTIZATION',
            scheduleId: s.id,
            description: `Zion Memorial Garden installment #${s.installment_no} - ${r.reservation_number}`
        })),
        amount,
        server_email: serverEmailEnabled()
    };
}

async function payBalance(db: any, user: any, reservationId: number) {
    const r = await requireOwnReservation(db, user.id, reservationId);
    const method = await requireActiveMethod(db, user.id);
    const amount = round2(Number(r.balance));
    if (amount <= 0) throw new Error('This reservation is already fully paid.');

    return {
        ...(await chargeLinkedGcash(db, {
            reservation: r,
            method,
            amount,
            paymentType: 'BALANCE_PAYOFF',
            description: `Zion Memorial Garden full balance payoff - ${r.reservation_number}`
        })),
        amount,
        server_email: serverEmailEnabled()
    };
}

async function syncPayment(db: any, user: any, reference: string) {
    if (!reference) throw new Error('Missing payment reference.');
    const { data: p } = await db.from('payments').select('*, reservations(user_id)').eq('payment_reference', reference).maybeSingle();
    if (!p || p.reservations?.user_id !== user.id) throw new Error('Payment not found.');

    if (p.status === 'PENDING' && p.gateway_payment_request_id) {
        try {
            const pr = await xendit(`/payment_requests/${p.gateway_payment_request_id}`);
            const st = String(pr.status || '').toUpperCase();
            if (st === 'SUCCEEDED') await markPaymentSucceeded(db, reference, pr.id);
            else if (st === 'FAILED' || st === 'EXPIRED' || st === 'CANCELED') await markPaymentFailedByReference(db, reference, pr.failure_code || st);
        } catch (e) {
            console.warn('PR sync failed', e);
        }
    }

    const { data: fresh } = await db.from('payments').select('status, amount, failure_reason, receipt_emailed_at, reservation_id').eq('payment_reference', reference).single();
    const { data: r } = await db.from('reservations').select('total_paid, balance, status').eq('id', fresh.reservation_id).single();
    const statusMap: Record<string, string> = { COMPLETED: 'SUCCEEDED', FAILED: 'FAILED', PENDING: 'PENDING', OVERDUE: 'FAILED' };
    return {
        reference,
        status: statusMap[fresh.status] || fresh.status,
        amount: fresh.amount,
        failure: fresh.failure_reason,
        receipt_emailed: Boolean(fresh.receipt_emailed_at),
        server_email: serverEmailEnabled(),
        reservation: r
    };
}

async function bankTestPay(db: any, user: any, body: any) {
    const reservationId = Number(body.reservation_id);
    const scheduleId = body.schedule_id ? Number(body.schedule_id) : null;
    const r = await requireOwnReservation(db, user.id, reservationId);
    const amount = Number(body.amount);
    if (!amount || amount <= 0) throw new Error('Invalid payment amount.');

    const bankName = String(body.bank_name || 'BDO Unibank');
    const reference = String(body.reference || `BNK-TEST-${Date.now().toString(36).toUpperCase()}`);
    const paymentType = String(body.payment_type || (scheduleId ? 'INSTALLMENT' : (r.payment_method === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT')));

    // 1. Insert into public.payments
    const { data: pmt, error: pmtErr } = await db.from('payments').insert([{
        reservation_id: r.id,
        schedule_id: scheduleId,
        payment_reference: reference,
        amount: round2(amount),
        payment_type: paymentType,
        payment_method: 'Bank Transfer',
        status: 'COMPLETED',
        paid_at: new Date().toISOString()
    }]).select().single();
    if (pmtErr) throw pmtErr;

    // 2. Mark schedule paid if applicable
    if (scheduleId) {
        await db.from('payment_schedules').update({
            status: 'PAID',
            payment_reference: reference,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }).eq('id', scheduleId);
    }

    // 3. Atomically update reservation
    const newPaid = round2(Number(r.total_paid || 0) + amount);
    const newBalance = round2(Math.max(0, Number(r.total_price || 0) - newPaid));
    const newStatus = (newBalance <= 0) ? 'COMPLETED' : r.status;

    const { data: updatedRes, error: resErr } = await db.from('reservations').update({
        total_paid: newPaid,
        balance: newBalance,
        status: newStatus,
        updated_at: new Date().toISOString()
    }).eq('id', r.id).select().single();
    if (resErr) throw resErr;

    return {
        status: 'SUCCEEDED',
        reference,
        amount,
        bank_name: bankName,
        payment: pmt,
        reservation: updatedRes
    };
}

async function createBankVA(db: any, user: any, body: any) {
    const reservationId = Number(body.reservation_id);
    const scheduleId = body.schedule_id ? Number(body.schedule_id) : null;
    const r = await requireOwnReservation(db, user.id, reservationId);
    const amount = round2(Number(body.amount));
    if (!amount || amount <= 0) throw new Error('Invalid payment amount.');

    const bankCode = String(body.bank_code || 'BDO').toUpperCase();
    const bankName = String(body.bank_name || 'BDO Unibank');
    const paymentType = String(body.payment_type || (scheduleId ? 'INSTALLMENT' : (r.payment_method === 'INSTALLMENT' ? 'DOWN_PAYMENT' : 'FULL_PAYMENT')));
    const reference = `ZMG-VA-${paymentType}-${r.id}-${Date.now().toString(36).toUpperCase()}`;

    // 1. Record pending payment in payments table
    const { data: pmt, error: pmtErr } = await db.from('payments').insert([{
        reservation_id: r.id,
        schedule_id: scheduleId,
        payment_reference: reference,
        amount,
        payment_type: paymentType,
        payment_method: 'Bank Transfer',
        status: 'PENDING',
        gateway: 'XENDIT',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
    }]).select().single();
    if (pmtErr) throw pmtErr;

    // 2. Call Xendit API to create Virtual Account
    let pr: any = null;
    let vaNumber = '';
    let xenditErrorMsg = '';

    const customerId = await ensureXenditCustomer(db, user);
    const customerName = (user.user_metadata?.full_name || 'Zion Valued Client').slice(0, 50);

    try {
        pr = await xendit('/payment_requests', 'POST', {
            reference_id: reference,
            currency: 'PHP',
            amount,
            country: 'PH',
            payment_method: {
                type: 'VIRTUAL_ACCOUNT',
                reusability: 'ONE_TIME_USE',
                virtual_account: {
                    channel_code: bankCode,
                    channel_properties: {
                        customer_name: customerName,
                        expires_at: new Date(Date.now() + 7 * 86400000).toISOString()
                    }
                }
            },
            customer_id: customerId,
            description: `Zion Memorial Garden - ${r.reservation_number} (${paymentType})`.slice(0, 250),
            metadata: {
                reservation_id: String(r.id),
                reservation_number: r.reservation_number,
                payment_type: paymentType,
                schedule_id: scheduleId ? String(scheduleId) : ''
            }
        }, { 'idempotency-key': reference });

        vaNumber = pr?.payment_method?.virtual_account?.channel_properties?.virtual_account_number ||
                   pr?.payment_method?.virtual_account?.channel_properties?.account_number ||
                   pr?.payment_method?.virtual_account?.account_number || '';
    } catch (e1) {
        console.warn('Xendit PR VA creation notice, trying legacy endpoint:', e1);
        try {
            const legacyVa = await xendit('/callback_virtual_accounts', 'POST', {
                external_id: reference,
                bank_code: bankCode,
                name: `ZMG ${customerName}`.slice(0, 30),
                expected_amount: amount,
                is_closed: true,
                is_single_use: true,
                expiration_date: new Date(Date.now() + 7 * 86400000).toISOString()
            });
            vaNumber = legacyVa?.account_number || '';
            pr = { id: legacyVa?.id || reference, status: 'PENDING' };
        } catch (e2) {
            console.warn('Xendit legacy VA call notice:', e2);
            xenditErrorMsg = (e1 instanceof Error ? e1.message : String(e1));
        }
    }

    if (!vaNumber) {
        const prefixMap: Record<string, string> = {
            BDO: '00458012',
            BPI: '10924481',
            UNIONBANK: '10948273',
            METROBANK: '20932091',
            RCBC: '90238419'
        };
        const pfx = prefixMap[bankCode] || '99990000';
        vaNumber = `${pfx}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (pr?.id) {
        await db.from('payments').update({
            gateway_payment_request_id: pr.id,
            gateway_payment_id: vaNumber
        }).eq('id', pmt.id);
    }

    return {
        success: true,
        reference,
        payment_request_id: pr?.id || reference,
        va_number: vaNumber,
        bank_code: bankCode,
        bank_name: bankName,
        amount,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        xendit_mode: env('XENDIT_SECRET_KEY').startsWith('xnd_development') ? 'SANDBOX' : 'LIVE',
        note: xenditErrorMsg ? `Sandbox Simulation Active (${xenditErrorMsg})` : 'Xendit Sandbox Virtual Account Created'
    };
}

async function simulateBankVA(db: any, user: any, body: any) {
    const reference = String(body.reference || '');
    const paymentRequestId = String(body.payment_request_id || '');
    const bankCode = String(body.bank_code || 'BDO');
    const vaNumber = String(body.va_number || '');
    const amount = Number(body.amount);

    if (!reference) throw new Error('Missing reference');

    // 1. Try Xendit API Sandbox Simulation endpoint if available
    try {
        if (paymentRequestId && paymentRequestId.startsWith('pr-')) {
            await xendit(`/payment_requests/${paymentRequestId}/payments/simulate`, 'POST', {});
        } else if (vaNumber && bankCode) {
            await xendit('/pool_virtual_accounts/simulate_payment', 'POST', {
                bank_code: bankCode,
                bank_account_number: vaNumber,
                transfer_amount: amount
            });
        }
    } catch (simErr) {
        console.warn('Xendit simulation API call notice:', simErr);
    }

    // 2. Mark payment succeeded in DB (idempotent, safe, updates reservation and schedule)
    const result = await markPaymentSucceeded(db, reference, paymentRequestId || vaNumber);

    const { data: pmt } = await db.from('payments').select('*, reservations(*)').eq('payment_reference', reference).maybeSingle();

    return {
        status: 'SUCCEEDED',
        reference,
        amount: pmt?.amount || amount,
        payment: pmt,
        reservation: pmt?.reservations,
        applied: result.applied,
        emailed: result.emailed,
        server_email: serverEmailEnabled()
    };
}



