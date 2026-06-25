import type { VercelRequest, VercelResponse } from './vercel-types';

export function readBody(req: VercelRequest): Record<string, unknown> {
  // Vercel parses application/json automatically into req.body, but during
  // local emulation it can arrive as a string. Normalize both cases.
  const body = req.body;
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

export function getBearer(req: VercelRequest): string | null {
  const raw = req.headers.authorization ?? req.headers.Authorization;
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

export function trimName(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const t = s.trim().slice(0, 40);
  return t.length === 0 ? null : t;
}
