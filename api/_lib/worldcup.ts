// Thin client for api-football (api-sports.io direct plan, NOT the RapidAPI
// mirror — different header/host). Free tier is ~100 requests/day, so every
// route that uses this MUST cache aggressively (see api/worldcup/fixtures.ts).
//
// Setup: create a free account at https://www.api-football.com/, grab the
// API key from your dashboard, and set it as the API_FOOTBALL_KEY env var in
// Vercel. Until it's set, isConfigured() is false and callers should degrade
// gracefully instead of erroring.

const BASE = 'https://v3.football.api-sports.io';

export function isConfigured(): boolean {
  return !!process.env.API_FOOTBALL_KEY;
}

export async function apiFootballGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error('api_football_not_configured');
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'x-apisports-key': key } });
  if (!res.ok) throw new Error(`api_football_http_${res.status}`);
  return (await res.json()) as T;
}

// "Today" in the audience's timezone, not the server's — a match at
// 23:30 UTC on the 3rd is still "today" (the 3rd) for a Brazilian visitor.
export function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']);

export interface NormalizedFixture {
  home: string;
  away: string;
  time: string;
  score: string | null;
  status: string;
}

export interface RawFixturesResponse {
  response: Array<{
    fixture: { status: { short: string }; date: string };
    teams: { home: { name: string }; away: { name: string } };
    goals: { home: number | null; away: number | null };
  }>;
}

export function normalizeFixtures(raw: RawFixturesResponse): NormalizedFixture[] {
  return raw.response.map((f) => {
    const started = f.goals.home !== null && f.goals.away !== null;
    const time = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(f.fixture.date));
    return {
      home: f.teams.home.name,
      away: f.teams.away.name,
      time,
      score: started ? `${f.goals.home}–${f.goals.away}` : null,
      status: f.fixture.status.short,
    };
  });
}

export function anyLive(fixtures: NormalizedFixture[]): boolean {
  return fixtures.some((f) => LIVE_STATUSES.has(f.status));
}

export interface NormalizedStanding {
  group: string;
  rank: number;
  team: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsDiff: number;
  points: number;
}

export interface RawStandingsResponse {
  response: Array<{
    league: {
      standings: Array<
        Array<{
          rank: number;
          team: { name: string };
          points: number;
          goalsDiff: number;
          group: string;
          all: { played: number; win: number; draw: number; lose: number };
        }>
      >;
    };
  }>;
}

// One flat list, sorted by group then rank — grouping by `.group` on the
// client is a one-liner and keeps this normalizer trivial to keep in sync
// with normalizeFixtures above.
export function normalizeStandings(raw: RawStandingsResponse): NormalizedStanding[] {
  const groups = raw.response[0]?.league?.standings ?? [];
  return groups
    .flat()
    .map((s) => ({
      group: (s.group ?? '').replace(/^Group\s+/i, ''),
      rank: s.rank,
      team: s.team.name,
      played: s.all?.played ?? 0,
      win: s.all?.win ?? 0,
      draw: s.all?.draw ?? 0,
      lose: s.all?.lose ?? 0,
      goalsDiff: s.goalsDiff ?? 0,
      points: s.points ?? 0,
    }))
    .sort((a, b) => (a.group < b.group ? -1 : a.group > b.group ? 1 : a.rank - b.rank));
}
