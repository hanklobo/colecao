import { randomBytes, createHash } from 'node:crypto';

// URL-safe alphabet (same as nanoid default).
const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

// 256 / 64 = 4 — byte & 63 is uniform across the 64-char alphabet.
function fromBytes(size: number): string {
  const bytes = randomBytes(size);
  let out = '';
  for (let i = 0; i < size; i++) out += ALPHABET[bytes[i] & 63];
  return out;
}

// 10 chars × 64 ≈ 1.15e18 — collision risk ~1e-7 at 1M users.
export function newUserId(): string {
  return fromBytes(10);
}

// 32 chars of entropy for the auth token — plenty.
export function newToken(): string {
  return fromBytes(32);
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
