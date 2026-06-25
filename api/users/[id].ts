import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { getJSON, setJSON } from '../_lib/kv.js';
import { sha256Hex } from '../_lib/ids.js';
import { getBearer, json, readBody, trimName } from '../_lib/http.js';
import { publicUser, userKey, type UserRecord } from '../_lib/types.js';

// Loose upper bound; the v2 trade code for the 980-sticker album is ~330 chars.
const MAX_CODE_LEN = 2000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !/^[A-Za-z0-9_-]{6,40}$/.test(id)) {
    return json(res, 400, { error: 'bad_id' });
  }

  if (req.method === 'GET') return handleGet(res, id);
  if (req.method === 'PUT') return handlePut(req, res, id);

  res.setHeader('Allow', 'GET, PUT');
  return json(res, 405, { error: 'method_not_allowed' });
}

async function handleGet(res: VercelResponse, id: string) {
  let user: UserRecord | null;
  try {
    user = await getJSON<UserRecord>(userKey(id));
  } catch (err) {
    console.error('users:get kv error', err);
    return json(res, 500, { error: 'storage_error' });
  }
  if (!user) return json(res, 404, { error: 'not_found' });
  return json(res, 200, publicUser(user));
}

async function handlePut(req: VercelRequest, res: VercelResponse, id: string) {
  const token = getBearer(req);
  if (!token) return json(res, 401, { error: 'missing_token' });

  let user: UserRecord | null;
  try {
    user = await getJSON<UserRecord>(userKey(id));
  } catch (err) {
    console.error('users:put kv get error', err);
    return json(res, 500, { error: 'storage_error' });
  }
  if (!user) return json(res, 404, { error: 'not_found' });
  if (user.tokenHash !== sha256Hex(token)) {
    return json(res, 403, { error: 'bad_token' });
  }

  const body = readBody(req);
  const codeIn = body.code;
  const nameIn = body.name;

  const next: UserRecord = { ...user, updatedAt: Date.now() };

  if (codeIn !== undefined) {
    if (typeof codeIn !== 'string' || codeIn.length > MAX_CODE_LEN) {
      return json(res, 400, { error: 'bad_code' });
    }
    next.code = codeIn;
  }
  if (nameIn !== undefined) {
    const trimmed = trimName(nameIn);
    if (!trimmed) return json(res, 400, { error: 'bad_name' });
    next.name = trimmed;
  }

  try {
    await setJSON(userKey(id), next);
  } catch (err) {
    console.error('users:put kv set error', err);
    return json(res, 500, { error: 'storage_error' });
  }

  return json(res, 200, { ok: true, updatedAt: next.updatedAt });
}
