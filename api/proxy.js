import axios from 'axios';

export default async function handler(req, res) {
    // Add CORS headers to allow the frontend to call this function
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
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Construct the full Open Food Facts URL.
        // The URL passed from the frontend will be relative (e.g., /api/v0/product/...)
        const targetUrl = `https://world.openfoodfacts.org${url}`;

        const response = await axios.get(targetUrl, {
            headers: {
                // Open Food Facts requirements: Identify your app with a clear User-Agent
                'User-Agent': 'Foodify - WebApp - Version 1.0 - www.foodify.app',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch from Open Food Facts',
            message: error.message
        });
    }
}
