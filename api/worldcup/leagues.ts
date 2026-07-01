import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { clientIp, json } from '../_lib/http.js';
import { incrWithTTL } from '../_lib/kv.js';
import { apiFootballGet, isConfigured } from '../_lib/worldcup.js';

// One-time setup helper: hit this once after setting API_FOOTBALL_KEY to
// confirm the real league id/season for the World Cup on your plan, then set
// WC_LEAGUE_ID / WC_SEASON env vars if they differ from fixtures.ts defaults.
// Rate-limited hard since it's not meant for regular traffic — it exists to
// save you a manual curl.
const RL_LIMIT = 20;
const RL_WINDOW = 3600;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  if (!isConfigured()) {
    return json(res, 200, { configured: false, leagues: [] });
  }

  const ip = clientIp(req);
  try {
    const count = await incrWithTTL(`rl:wc-leagues:${ip}`, RL_WINDOW);
    if (count > RL_LIMIT) return json(res, 429, { error: 'rate_limited' });
  } catch (err) {
    console.error('worldcup:leagues rl error', err);
  }

  try {
    const data = await apiFootballGet('/leagues', { search: 'World Cup' });
    return json(res, 200, { configured: true, leagues: data });
  } catch (err) {
    console.error('worldcup:leagues upstream error', err);
    return json(res, 502, { error: 'upstream_error' });
  }
}
