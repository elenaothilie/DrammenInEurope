import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_API = 'https://api.telegram.org';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const notifySecret = process.env.NOTIFY_SECRET;
  if (notifySecret && req.body?.secret !== notifySecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID',
    });
  }

  const message =
    typeof req.body?.message === 'string' ? req.body.message : null;
  if (!message) {
    return res.status(400).json({ error: 'Missing message in body' });
  }

  try {
    const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return res.status(502).json({
        error: 'Telegram API error',
        details: data.description,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notify Telegram error:', err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to send message',
    });
  }
}
