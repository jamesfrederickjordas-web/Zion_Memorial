export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;
    if (expectedToken && req.headers['x-callback-token'] !== expectedToken) {
        return res.status(401).json({ error: 'Invalid callback token' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: 'Supabase service credentials not configured' });
    }

    try {
        const event = req.body || {};
        const status = String(event.status || '').toUpperCase();
        const externalId = event.external_id;
        if (!externalId || !['PAID', 'SETTLED'].includes(status)) {
            return res.status(200).json({ received: true, ignored: true });
        }

        const headers = {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        };

        const payResp = await fetch(
            `${supabaseUrl}/rest/v1/payments?payment_reference=eq.${encodeURIComponent(externalId)}&select=*`,
            { headers }
        );
        const payments = await payResp.json();
        const payment = Array.isArray(payments) ? payments[0] : null;
        if (!payment || String(payment.status).toUpperCase() === 'COMPLETED') {
            return res.status(200).json({ received: true });
        }

        const nowIso = new Date().toISOString();
        await fetch(`${supabaseUrl}/rest/v1/payments?id=eq.${payment.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'COMPLETED', paid_at: nowIso })
        });

        if (payment.reservation_id) {
            const resResp = await fetch(
                `${supabaseUrl}/rest/v1/reservations?id=eq.${payment.reservation_id}&select=id,total_price,total_paid,balance,status,notes`,
                { headers }
            );
            const resRows = await resResp.json();
            const r = Array.isArray(resRows) ? resRows[0] : null;
            if (r) {
                const totalPrice = Number(r.total_price || 0);
                const newTotalPaid = Number(Math.min(totalPrice || (Number(r.total_paid || 0) + Number(payment.amount || 0)), Number(r.total_paid || 0) + Number(payment.amount || 0)).toFixed(2));
                const newBalance = Number(Math.max(0, totalPrice - newTotalPaid).toFixed(2));
                const newStatus = newBalance <= 0 && totalPrice > 0 ? 'COMPLETED' : 'APPROVED';
                const notes = String(r.notes || '').replace(/\[Receipt Tag:\s*(?:PENDING VERIFICATION|UNPAID)\]/gi, '[Receipt Tag: PAID]');

                await fetch(`${supabaseUrl}/rest/v1/reservations?id=eq.${r.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        total_paid: newTotalPaid,
                        balance: newBalance,
                        status: newStatus,
                        notes,
                        updated_at: nowIso
                    })
                });
            }
        }

        return res.status(200).json({ received: true, updated: true });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Webhook processing error' });
    }
}
