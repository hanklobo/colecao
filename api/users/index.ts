import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { incrWithTTL, setNXJSON } from '../_lib/kv.js';
import { newToken, newUserId, sha256Hex } from '../_lib/ids.js';
import { clientIp, json, readBody, trimName } from '../_lib/http.js';
import { userKey, type UserRecord } from '../_lib/types.js';

// Fixed-window IP rate limit: 20 creations per 10 minutes per source IP.
// Plenty for legit users (you create an account once, ever) and tight
// enough that a scripted POST loop hits the wall within seconds.
const RL_LIMIT  = 20;
const RL_WINDOW = 600;

// Cap on retries when SET NX hits a nanoid collision. The space is 64^10,
// so even at 1M users the per-call collision probability is ~1e-8; three
// retries gives effectively infinite headroom.
const ID_RETRIES = 3;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  // Rate limit before we touch anything else, so a flood doesn't cost us
  // body parses or random-id generations.
  const ip = clientIp(req);
  try {
    const count = await incrWithTTL(`rl:create:${ip}`, RL_WINDOW);
    if (count > RL_LIMIT) {
      return json(res, 429, { error: 'rate_limited' });
    }
  } catch (err) {
    console.error('users:create rl error', err);
    return json(res, 500, { error: 'storage_error' });
  }

  const body = readBody(req);
  const name = trimName(body.name);
  if (!name) return json(res, 400, { error: 'name_required' });

  const token = newToken();
  const tokenHash = sha256Hex(token);
  const now = Date.now();

  let id: string | null = null;
  try {
    for (let attempt = 0; attempt < ID_RETRIES; attempt++) {
      const candidate = newUserId();
      const record: UserRecord = {
        id: candidate,
        name,
        tokenHash,
        code: null,
        createdAt: now,
        updatedAt: now,
      };
      const claimed = await setNXJSON(userKey(candidate), record);
      if (claimed) { id = candidate; break; }
    }
  } catch (err) {
    console.error('users:create kv error', err);
    return json(res, 500, { error: 'storage_error' });
  }

  if (!id) return json(res, 503, { error: 'id_exhausted' });

  return json(res, 201, { id, token });
}
