const PIXEL_ID = '1757022965440437';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!accessToken) {
        res.status(500).json({ error: 'META_CAPI_ACCESS_TOKEN no configurado' });
        return;
    }

    const { eventId, eventSourceUrl } = req.body || {};
    if (!eventId) {
        res.status(400).json({ error: 'Falta eventId' });
        return;
    }

    const forwardedFor = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const clientIp = forwardedFor || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const payload = {
        data: [{
            event_name: 'Contact',
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: 'website',
            event_source_url: eventSourceUrl || '',
            user_data: {
                client_ip_address: clientIp,
                client_user_agent: userAgent
            },
            custom_data: {
                content_name: 'Contact',
                content_category: 'Lead',
                value: 1.0,
                currency: 'USD'
            }
        }]
    };

    try {
        const metaRes = await fetch(
            `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );
        const metaData = await metaRes.json();

        if (!metaRes.ok) {
            res.status(502).json({ error: 'Meta CAPI error', detail: metaData });
            return;
        }

        res.status(200).json({ ok: true, meta: metaData });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
}
