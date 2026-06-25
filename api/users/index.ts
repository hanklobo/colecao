import type { VercelRequest, VercelResponse } from '../_lib/vercel-types';
import { setJSON } from '../_lib/kv';
import { newToken, newUserId, sha256Hex } from '../_lib/ids';
import { json, readBody, trimName } from '../_lib/http';
import { userKey, type UserRecord } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  const body = readBody(req);
  const name = trimName(body.name);
  if (!name) return json(res, 400, { error: 'name_required' });

  const id = newUserId();
  const token = newToken();
  const now = Date.now();

  const record: UserRecord = {
    id,
    name,
    tokenHash: sha256Hex(token),
    code: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setJSON(userKey(id), record);
  } catch (err) {
    console.error('users:create kv error', err);
    return json(res, 500, { error: 'storage_error' });
  }

  return json(res, 201, { id, token });
}
