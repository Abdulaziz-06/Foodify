export default async function handler(req, res) {
    // Standard CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // Ensure url starts with a slash
        const path = url.startsWith('/') ? url : `/${url}`;
        const targetUrl = `https://world.openfoodfacts.org${path}`;

        console.log(`Forwarding request to: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                // Highly specific User-Agent as requested by Open Food Facts docs
                // Format: AppName/Version (WebsiteUrl)
                'User-Agent': 'Foodify/1.1 (https://fooodify.vercel.app)',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        // Relay the status code and data
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy Error Details:', error);
        res.status(500).json({
            error: 'Proxy Error',
            message: error.message
        });
    }
}
