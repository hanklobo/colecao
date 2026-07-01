import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { json } from '../_lib/http.js';
import { getJSON, setJSON, setJSONWithTTL } from '../_lib/kv.js';
import {
  apiFootballGet,
  isConfigured,
  normalizeStandings,
  type NormalizedStanding,
  type RawStandingsResponse,
} from '../_lib/worldcup.js';

const LEAGUE_ID = process.env.WC_LEAGUE_ID ?? '1';
const SEASON = process.env.WC_SEASON ?? '2026';

// Standings only change between matchdays (never mid-match), so a much
// longer TTL than fixtures.ts is safe — keeps us well inside the free-tier
// daily quota even with steady traffic.
const TTL = Number(process.env.WC_STANDINGS_TTL ?? 3600);

interface CachedPayload {
  standings: NormalizedStanding[];
  updatedAt: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  if (!isConfigured()) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return json(res, 200, { configured: false, standings: [] });
  }

  const cacheKey = `wc:standings:${LEAGUE_ID}:${SEASON}`;
  const lastGoodKey = `wc:standings:last:${LEAGUE_ID}:${SEASON}`;

  try {
    const cached = await getJSON<CachedPayload>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return json(res, 200, { configured: true, ...cached });
    }
  } catch (err) {
    console.error('worldcup:standings kv read error', err);
  }

  try {
    const raw = await apiFootballGet<RawStandingsResponse>('/standings', { league: LEAGUE_ID, season: SEASON });
    const standings = normalizeStandings(raw);
    const payload: CachedPayload = { standings, updatedAt: Date.now() };

    try {
      await setJSONWithTTL(cacheKey, payload, TTL);
      await setJSON(lastGoodKey, payload);
    } catch (err) {
      console.error('worldcup:standings kv write error', err);
    }

    res.setHeader('Cache-Control', `public, max-age=60, s-maxage=${TTL}`);
    return json(res, 200, { configured: true, ...payload });
  } catch (err) {
    console.error('worldcup:standings upstream error', err);
    try {
      const stale = await getJSON<CachedPayload>(lastGoodKey);
      if (stale) {
        res.setHeader('Cache-Control', 'public, max-age=60');
        return json(res, 200, { configured: true, ...stale, stale: true });
      }
    } catch (err2) {
      console.error('worldcup:standings kv fallback error', err2);
    }
    return json(res, 502, { configured: true, error: 'upstream_error', standings: [] });
  }
}
