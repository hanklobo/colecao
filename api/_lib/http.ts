import type { VercelRequest, VercelResponse } from './vercel-types.js';

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
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8')) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

export function getBearer(req: VercelRequest): string | null {
  // Node's IncomingMessage normalizes header keys to lowercase.
  const raw = req.headers.authorization;
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const tok = m[1].trim();
  return tok.length > 0 ? tok : null;
}

// Strip control range, soft hyphen, zero-width family, bidi marks, BOM,
// and other invisible chars — any of which would render the user "blank"
// in the UI and serve as a vector for impersonation.
function stripInvisible(s: string): string {
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x20) continue;                          // ASCII control
    if (cp === 0x7F) continue;                        // DEL
    if (cp === 0xAD) continue;                        // soft hyphen
    if (cp >= 0x200B && cp <= 0x200F) continue;       // ZWSP, ZWNJ, ZWJ, LRM, RLM
    if (cp >= 0x202A && cp <= 0x202E) continue;       // bidi overrides
    if (cp >= 0x2060 && cp <= 0x206F) continue;       // word joiner, invisible math
    if (cp === 0xFEFF) continue;                      // BOM / zero-width nbsp
    out += ch;
  }
  return out;
}

export function trimName(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  const cleaned = stripInvisible(s).trim().slice(0, 40);
  return cleaned.length === 0 ? null : cleaned;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

// Extract the best-guess client IP from Vercel proxy headers. Falls back to
// req.socket.remoteAddress (on Vercel this is the proxy itself — useless
// for rate limiting but a safe default that lumps anonymous callers).
export function clientIp(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff[0]) return xff[0];
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string') return real;
  return req.socket?.remoteAddress ?? 'unknown';
}
