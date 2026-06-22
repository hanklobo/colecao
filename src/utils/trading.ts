import type { AlbumState, TradeOffer } from '../types';
import { TOTAL_STICKERS } from '../data/album2026';

interface TradingPayload {
  missing: number[];
  duplicates: { id: number; extra: number }[];
}

// ── Compact binary encoding (v2) ────────────────────────────────────────────
// 2 bits per sticker: 0 = missing, 1 = have, 2 = repeated.
// Packed into bytes and base64url-encoded → fixed, small payload that keeps
// the share link short. Legacy JSON codes (no '~' prefix) still decode below.

const V2_PREFIX = '~';

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s: string): Uint8Array {
  let str = s.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeTradeCode(state: AlbumState): string {
  const bytes = new Uint8Array(Math.ceil(TOTAL_STICKERS / 4));
  for (let i = 1; i <= TOTAL_STICKERS; i++) {
    const s = state[i];
    let code = 0;
    if (s) {
      if (s.status === 'have') code = 1;
      else if (s.status === 'repeated') code = 2;
    }
    const idx = i - 1;
    bytes[idx >> 2] |= code << ((idx & 3) * 2);
  }
  return V2_PREFIX + bytesToB64url(bytes);
}

export function decodeTradeCode(code: string): TradingPayload | null {
  const c = code.trim();

  // v2 — compact bitmask
  if (c.startsWith(V2_PREFIX)) {
    try {
      const bytes = b64urlToBytes(c.slice(1));
      const missing: number[] = [];
      const duplicates: { id: number; extra: number }[] = [];
      for (let i = 1; i <= TOTAL_STICKERS; i++) {
        const idx = i - 1;
        const status = (bytes[idx >> 2] >> ((idx & 3) * 2)) & 3;
        if (status === 0) missing.push(i);
        else if (status === 2) duplicates.push({ id: i, extra: 1 });
      }
      return { missing, duplicates };
    } catch {
      return null;
    }
  }

  // legacy — JSON + base64
  try {
    const json = decodeURIComponent(escape(atob(c)));
    const payload = JSON.parse(json) as TradingPayload;
    if (!Array.isArray(payload.missing) || !Array.isArray(payload.duplicates)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function calculateTrade(
  myState: AlbumState,
  theirCode: string,
): TradeOffer | null {
  const theirData = decodeTradeCode(theirCode);
  if (!theirData) return null;

  const myMissingSet = new Set<number>();
  const myDupMap = new Map<number, number>();

  for (let i = 1; i <= TOTAL_STICKERS; i++) {
    const s = myState[i];
    if (!s || s.status === 'missing') {
      myMissingSet.add(i);
    } else if (s.status === 'repeated') {
      myDupMap.set(i, s.count - 1);
    }
  }

  const theirMissingSet = new Set(theirData.missing);
  const theirDupMap = new Map(theirData.duplicates.map((d) => [d.id, d.extra]));

  // I give them: my duplicates that they're missing
  const give: number[] = [];
  for (const [id] of myDupMap) {
    if (theirMissingSet.has(id)) give.push(id);
  }

  // I receive from them: their duplicates that I'm missing
  const receive: number[] = [];
  for (const [id] of theirDupMap) {
    if (myMissingSet.has(id)) receive.push(id);
  }

  return { give, receive };
}

export interface PartnerStats {
  have: number;
  missing: number;
  duplicates: number;
}

export function getPartnerStats(code: string): PartnerStats | null {
  const decoded = decodeTradeCode(code);
  if (!decoded) return null;
  const have = TOTAL_STICKERS - decoded.missing.length;
  const duplicates = decoded.duplicates.reduce((s, d) => s + d.extra, 0);
  return { have, missing: decoded.missing.length, duplicates };
}

export function generateShareUrl(name: string, code: string): string {
  // Build manually: the code uses only URL-safe chars (base64url + '~'),
  // so we skip URLSearchParams to avoid bloating it with percent-escapes.
  return `${window.location.origin}/?t=${code}&de=${encodeURIComponent(name)}`;
}
