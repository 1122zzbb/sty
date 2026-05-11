export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace('/api/sb', '') + (url.search || '');
  const target = 'https://epxuylxivkdfxxiucxgg.supabase.co' + path;

  const resp = await fetch(target, {
    method: req.method,
    headers: {
      'apikey': process.env.SB_ANON_KEY,
      'Authorization': 'Bearer ' + process.env.SB_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': req.headers['prefer'] || '',
    },
    body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  });

  const data = await resp.text();
  res.status(resp.status).setHeader('Content-Type','application/json');
  // 给 GET 请求加上短缓存头，减少重复请求
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  }
  res.send(data);
}
