export const config = {
  runtime: 'edge',
  regions: ['hkg1'], // 香港节点，国内访问快
};

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/sb', '') + (url.search || '');
  const target = 'https://epxuylxivkdfxxiucxgg.supabase.co' + path;

  const headers = new Headers({
    'apikey': process.env.SB_ANON_KEY,
    'Authorization': 'Bearer ' + process.env.SB_ANON_KEY,
    'Content-Type': 'application/json',
  });
  
  // 转发 Prefer header
  const prefer = req.headers.get('prefer');
  if (prefer) headers.set('Prefer', prefer);

  const resp = await fetch(target, {
    method: req.method,
    headers,
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.text(),
  });

  // 给 GET 请求加上短缓存头（30秒），减少重复请求
  const responseHeaders = new Headers({
    'Content-Type': resp.headers.get('Content-Type') || 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  if (req.method === 'GET') {
    responseHeaders.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  }

  return new Response(resp.body, {
    status: resp.status,
    headers: responseHeaders,
  });
}
