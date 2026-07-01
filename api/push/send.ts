import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { json, readBody } from '../_lib/http.js';
import { isPushConfigured, sendToAll } from '../_lib/push.js';

// Manual blast for the big moments (torneio começou, sua seleção classificou,
// etc). Protected — this fans out to every subscriber, so it's not public.
// Trigger it yourself:
//   curl -X POST https://albumcopa.xyz/api/push/send \
//     -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" \
//     -d '{"title":"Copa 2026","body":"Sua seleção joga hoje!","url":"/"}'
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization;
  if (!secret || auth !== `Bearer ${secret}`) {
    return json(res, 401, { error: 'unauthorized' });
  }

  if (!isPushConfigured()) {
    return json(res, 200, { sent: 0, note: 'push_not_configured' });
  }

  const body = readBody(req);
  const title = typeof body.title === 'string' ? body.title : 'Copa 2026';
  const message = typeof body.body === 'string' ? body.body : '';
  const url = typeof body.url === 'string' ? body.url : '/';

  try {
    const result = await sendToAll({ title, body: message, url });
    return json(res, 200, result);
  } catch (err) {
    console.error('push:send error', err);
    return json(res, 500, { error: 'send_failed' });
  }
}
