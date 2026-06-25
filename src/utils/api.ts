export interface PublicUser {
  id: string;
  name: string;
  code: string | null;
  updatedAt: number;
}

export interface CreatedUser {
  id: string;
  token: string;
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = new Error(`api ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

export async function createUser(name: string): Promise<CreatedUser> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return readJson<CreatedUser>(res);
}

export async function fetchUser(id: string): Promise<PublicUser | null> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    return await readJson<PublicUser>(res);
  } catch {
    return null;
  }
}

export async function updateUser(
  id: string,
  token: string,
  patch: { code?: string; name?: string },
): Promise<{ ok: true; updatedAt: number }> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });
  return readJson<{ ok: true; updatedAt: number }>(res);
}
