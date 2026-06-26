// Minimal subset of @vercel/node's types so the functions compile without
// adding the package. Vercel injects body parsing and the query/method shims
// at runtime regardless.

import type { IncomingMessage, ServerResponse } from 'node:http';

export interface VercelRequest extends IncomingMessage {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
  cookies?: Record<string, string>;
}

export interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  send(body: string | Buffer | object): VercelResponse;
  json(body: unknown): VercelResponse;
}
