// Thin Upstash Redis REST wrapper. Vercel KV (Marketplace → Upstash) sets
// KV_REST_API_URL + KV_REST_API_TOKEN automatically; we also accept the
// raw UPSTASH_REDIS_REST_* names so the same code works on plain Upstash.

const URL_ENV = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_ENV =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

function requireEnv() {
  if (!URL_ENV || !TOKEN_ENV) {
    throw new Error(
      'KV not configured: set KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + _TOKEN).',
    );
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
    const text = await res.text().catch(() => '');
    throw new Error(`KV ${command[0]} failed: ${res.status} ${text}`);
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
