export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace('/api/sb', '') + (url.search || '');
  const baseUrl = req.headers['x-sb-url'] || 'https://epxuylxivkdfxxiucxgg.supabase.co';
  const sbKey = process.env.SB_ANON_KEY;
  const target = baseUrl + path;

  const resp = await fetch(target, {
    method: req.method,
    headers: {
      'apikey': sbKey,
      'Authorization': 'Bearer ' + sbKey,
      'Content-Type': 'application/json',
      'Prefer': req.headers['prefer'] || '',
    },
    body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  });

  const data = await resp.text();
  res.status(resp.status).setHeader('Content-Type','application/json');
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  }
  res.send(data);
}
