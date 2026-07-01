import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { json } from '../_lib/http.js';
import { getJSON, setJSON, setJSONWithTTL } from '../_lib/kv.js';
import {
  anyLive,
  apiFootballGet,
  isConfigured,
  normalizeFixtures,
  todayBR,
  type NormalizedFixture,
  type RawFixturesResponse,
} from '../_lib/worldcup.js';

// League/season ids for api-football. Confirm yours via GET /api/worldcup/leagues
// (searches "World Cup") once API_FOOTBALL_KEY is set, then override here via
// env vars if different from these defaults.
const LEAGUE_ID = process.env.WC_LEAGUE_ID ?? '1';
const SEASON = process.env.WC_SEASON ?? '2026';

// Free tier is ~100 req/day: cache hard. Short TTL only while a match is
// actually live, long TTL otherwise — tunable without a redeploy.
const TTL_LIVE = Number(process.env.WC_FIXTURES_TTL_LIVE ?? 180);
const TTL_IDLE = Number(process.env.WC_FIXTURES_TTL_IDLE ?? 1800);

interface CachedPayload {
  date: string;
  fixtures: NormalizedFixture[];
  updatedAt: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  if (!isConfigured()) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return json(res, 200, { configured: false, fixtures: [] });
  }

  const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
  const date = dateParam ?? todayBR();
  const cacheKey = `wc:fx:${LEAGUE_ID}:${SEASON}:${date}`;
  const lastGoodKey = `wc:fx:last:${LEAGUE_ID}:${SEASON}:${date}`;

  try {
    const cached = await getJSON<CachedPayload>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30');
      return json(res, 200, { configured: true, ...cached });
    }
  } catch (err) {
    console.error('worldcup:fixtures kv read error', err);
    // fall through to a live fetch — a cache outage shouldn't take the page down
  }

  try {
    const raw = await apiFootballGet<RawFixturesResponse>('/fixtures', {
      league: LEAGUE_ID,
      season: SEASON,
      date,
    });
    const fixtures = normalizeFixtures(raw);
    const payload: CachedPayload = { date, fixtures, updatedAt: Date.now() };
    const ttl = anyLive(fixtures) ? TTL_LIVE : TTL_IDLE;

    try {
      await setJSONWithTTL(cacheKey, payload, ttl);
      await setJSON(lastGoodKey, payload); // no expiry — fallback if the API/quota fails later today
    } catch (err) {
      console.error('worldcup:fixtures kv write error', err);
    }

    res.setHeader('Cache-Control', `public, max-age=30, s-maxage=${ttl}`);
    return json(res, 200, { configured: true, ...payload });
  } catch (err) {
    console.error('worldcup:fixtures upstream error', err);
    try {
      const stale = await getJSON<CachedPayload>(lastGoodKey);
      if (stale) {
        res.setHeader('Cache-Control', 'public, max-age=30');
        return json(res, 200, { configured: true, ...stale, stale: true });
      }
    } catch (err2) {
      console.error('worldcup:fixtures kv fallback error', err2);
    }
    return json(res, 502, { configured: true, error: 'upstream_error', fixtures: [] });
  }
}
