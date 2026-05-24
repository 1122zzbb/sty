export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从请求头获取目标 endpoint 和 API key
  const targetUrl = req.headers['x-target-url'];
  const apiKey = req.headers['x-api-key'];

  if (!targetUrl || !apiKey) {
    return res.status(400).json({ error: 'Missing x-target-url or x-api-key header' });
  }

  try {
    const resp = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(req.body),
    });

    // 如果是流式响应，直接透传
    if (req.body?.stream) {
      res.status(resp.status);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
        res.end();
      };

      await pump();
    } else {
      // 非流式响应
      const data = await resp.text();
      res.status(resp.status).setHeader('Content-Type', 'application/json');
      res.send(data);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
