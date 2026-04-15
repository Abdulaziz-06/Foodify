import axios from 'axios';

export default async function handler(req, res) {
    // Basic Security & CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // Ensure the path is valid
        const path = url.startsWith('/') ? url : `/${url}`;
        const targetUrl = `https://world.openfoodfacts.org${path}`;

        console.log('Proxying to:', targetUrl);

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Foodify/1.1 (https://fooodify.vercel.app; support@foodify.com)',
                'Accept': 'application/json'
            },
            timeout: 15000,
            validateStatus: false // Allow us to catch non-200 responses manually
        });

        // Forward the response
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error('Serverless Proxy Crash:', error.message);
        
        // Return a structured error so the frontend doesn't just see "500"
        res.status(500).json({
            error: 'Internal Proxy Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
