import type { AlbumState, TradeOffer } from '../types';
import { TOTAL_STICKERS } from '../data/album2026';

interface TradingPayload {
  missing: number[];
  duplicates: { id: number; extra: number }[];
}

export function encodeTradeCode(state: AlbumState): string {
  const missing: number[] = [];
  const duplicates: { id: number; extra: number }[] = [];

  for (let i = 1; i <= TOTAL_STICKERS; i++) {
    const s = state[i];
    if (!s || s.status === 'missing') {
      missing.push(i);
    } else if (s.status === 'repeated') {
      duplicates.push({ id: i, extra: s.count - 1 });
    }
  }

  const payload: TradingPayload = { missing, duplicates };
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeTradeCode(code: string): TradingPayload | null {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
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
