import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { json } from '../_lib/http.js';
import { isPushConfigured, sendToAll } from '../_lib/push.js';
import { apiFootballGet, isConfigured, normalizeFixtures, todayBR, type RawFixturesResponse } from '../_lib/worldcup.js';

const LEAGUE_ID = process.env.WC_LEAGUE_ID ?? '1';
const SEASON = process.env.WC_SEASON ?? '2026';

function buildMessage(fixtures: { home: string; away: string; time: string }[]): string {
  if (fixtures.length === 1) {
    const f = fixtures[0];
    return `${f.home} x ${f.away}, às ${f.time}. Vem acompanhar e organizar seu álbum!`;
  }
  const first = fixtures
    .slice(0, 3)
    .map((f) => `${f.time} ${f.home} x ${f.away}`)
    .join(' · ');
  const rest = fixtures.length > 3 ? ` +${fixtures.length - 3}` : '';
  return `${first}${rest}`;
}

// Wired to vercel.json's cron (once a day). Vercel attaches
// `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is set,
// which doubles as the auth check here — the same secret also protects a
// manual curl for testing.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization;
  if (!secret || auth !== `Bearer ${secret}`) {
    return json(res, 401, { error: 'unauthorized' });
  }

  if (!isConfigured() || !isPushConfigured()) {
    return json(res, 200, { sent: 0, note: 'not_configured' });
  }

  const date = todayBR();
  try {
    const raw = await apiFootballGet<RawFixturesResponse>('/fixtures', { league: LEAGUE_ID, season: SEASON, date });
    const fixtures = normalizeFixtures(raw);
    if (fixtures.length === 0) {
      return json(res, 200, { sent: 0, note: 'no_matches_today', date });
    }
    const result = await sendToAll({
      title: fixtures.length === 1 ? '⚽ Jogo hoje!' : `⚽ ${fixtures.length} jogos hoje!`,
      body: buildMessage(fixtures),
      url: '/copa-2026/tabela-de-jogos/',
    });
    return json(res, 200, { ...result, date, fixtures: fixtures.length });
  } catch (err) {
    console.error('push:daily-digest error', err);
    return json(res, 502, { error: 'upstream_error' });
  }
}
