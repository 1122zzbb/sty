export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const basePath = url.pathname.replace('/api/sb', '');
  // Remove Vercel rewrite's extra ?path= param
  url.searchParams.delete('path');
  const qs = url.searchParams.toString();
  const path = basePath + (qs ? '?' + qs : '');
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
      ...(req.headers['range'] ? {'Range': req.headers['range']} : {}),
      ...(req.headers['limit'] ? {'Limit': req.headers['limit']} : {}),
      ...(req.headers['offset'] ? {'Offset': req.headers['offset']} : {}),
    },
    body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  });

  const data = await resp.text();
  res.status(resp.status).setHeader('Content-Type','application/json');
  const cr=resp.headers.get('content-range');
  if(cr)res.setHeader('Content-Range',cr);
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  }
  res.send(data);
}
