export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
        return res.status(200).json({
            mode: 'unconfigured',
            message: 'XENDIT_SECRET_KEY is not configured in Vercel Environment Variables yet.'
        });
    }

    try {
        const {
            amount,
            externalId,
            payerEmail,
            description,
            successRedirectUrl,
            failureRedirectUrl
        } = req.body || {};

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Invalid payment amount' });
        }

        const authHeader = 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');
        const response = await fetch('https://api.xendit.co/v2/invoices', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                external_id: externalId || `ZMG-CARD-${Date.now()}`,
                amount: Math.round(numericAmount * 100) / 100,
                currency: 'PHP',
                payer_email: payerEmail || undefined,
                description: description || 'Zion Memorial Garden Plot Payment',
                payment_methods: ['CREDIT_CARD', 'DEBIT_CARD'],
                success_redirect_url: successRedirectUrl || undefined,
                failure_redirect_url: failureRedirectUrl || undefined
            })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: data?.message || 'Failed to create Xendit invoice',
                details: data
            });
        }

        return res.status(200).json({
            mode: 'live',
            invoiceId: data.id,
            invoiceUrl: data.invoice_url,
            externalId: data.external_id
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
