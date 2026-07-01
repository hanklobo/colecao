// Thin Upstash Redis REST wrapper. Vercel KV (Marketplace → Upstash) sets
// KV_REST_API_URL + KV_REST_API_TOKEN automatically; we also accept the
// raw UPSTASH_REDIS_REST_* names so the same code works on plain Upstash.

const URL_ENV = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_ENV =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

function requireEnv() {
  if (!URL_ENV || !TOKEN_ENV) {
    throw new Error('kv_not_configured');
  }
  return { url: URL_ENV, token: TOKEN_ENV };
}

async function call<T = unknown>(command: (string | number)[]): Promise<T> {
  const { url, token } = requireEnv();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    // Don't include the response body to avoid leaking sensitive bytes
    // (e.g. echoed auth headers) into function logs.
    throw new Error(`kv_${String(command[0]).toLowerCase()}_failed_${res.status}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await call<string | null>(['GET', key]);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await call(['SET', key, JSON.stringify(value)]);
}

// Same as setJSON, but the key expires on its own after ttlSeconds — used
// for response caches (e.g. worldcup fixtures) that should go stale rather
// than live forever.
export async function setJSONWithTTL<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await call(['SET', key, JSON.stringify(value), 'EX', ttlSeconds]);
}

// Atomic create-if-absent. Returns true when the key was set, false if it
// already existed. Used to avoid clobbering on nanoid collisions.
export async function setNXJSON<T>(key: string, value: T): Promise<boolean> {
  const r = await call<string | null>(['SET', key, JSON.stringify(value), 'NX']);
  return r === 'OK';
}

// Increment a counter and ensure it has a TTL. Returns the new count.
// The TTL is only set on the first increment (when INCR returns 1), so the
// window is a true fixed-window starting at the first hit.
export async function incrWithTTL(key: string, ttlSeconds: number): Promise<number> {
  const n = await call<number>(['INCR', key]);
  if (n === 1) {
    try { await call(['EXPIRE', key, ttlSeconds]); } catch { /* best-effort */ }
  }
  return n;
}
