/**
 * Vercel serverless function: /api/verify
 *
 * Acts as a server-side proxy between the browser and the Anthropic API.
 * This sidesteps the browser CORS restriction — the browser calls this
 * function on the same origin, and this function calls Anthropic from
 * Node.js where CORS does not apply.
 *
 * The API key is passed in the request header from the browser's
 * localStorage. In a multi-user production deployment you would store
 * the key as a Vercel environment variable instead and remove it from
 * the client entirely.
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(400).json({ error: 'Missing x-api-key header' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await anthropicRes.json();

    // Forward Anthropic's status code and body back to the browser
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy request failed', detail: err.message });
  }
}
