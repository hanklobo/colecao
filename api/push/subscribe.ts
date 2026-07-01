import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { json, readBody } from '../_lib/http.js';
import { delKey, setJSON } from '../_lib/kv.js';
import { sha256Hex } from '../_lib/ids.js';

// Stores a browser's PushSubscription so api/push/send.ts and
// api/push/daily-digest.ts can fan a notification out to it later. Public —
// anyone can subscribe themselves, there's nothing sensitive in a
// subscription object beyond the endpoint URL it targets.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    const body = readBody(req);
    const endpoint = typeof body.endpoint === 'string' ? body.endpoint : null;
    if (!endpoint) return json(res, 400, { error: 'invalid_subscription' });
    try {
      await delKey(`push:sub:${sha256Hex(endpoint)}`);
    } catch (err) {
      console.error('push:unsubscribe kv error', err);
      return json(res, 500, { error: 'storage_error' });
    }
    return json(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, DELETE');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  const body = readBody(req);
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : null;
  const keys = body.keys as { p256dh?: unknown; auth?: unknown } | undefined;
  if (!endpoint || typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string') {
    return json(res, 400, { error: 'invalid_subscription' });
  }

  const key = `push:sub:${sha256Hex(endpoint)}`;
  try {
    await setJSON(key, { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } });
  } catch (err) {
    console.error('push:subscribe kv error', err);
    return json(res, 500, { error: 'storage_error' });
  }
  return json(res, 201, { ok: true });
}
