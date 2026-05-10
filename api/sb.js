export default async function handler(req, res) {
  const path = req.url.replace('/api/sb', '');
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
  res.status(resp.status).setHeader('Content-Type','application/json').send(data);
}
