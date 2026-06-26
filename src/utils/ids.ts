// Mirror of api/_lib/ids.ts using Web Crypto so the same URL-safe alphabet
// is used on both sides. Used for the auth token only — partner/user IDs
// always come from the server.

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

export function randomToken(size = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let out = '';
  for (let i = 0; i < size; i++) out += ALPHABET[bytes[i] & 63];
  return out;
}

export function isValidUserId(id: string): boolean {
  return /^[A-Za-z0-9_-]{6,40}$/.test(id);
}
