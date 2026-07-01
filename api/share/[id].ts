import type { VercelRequest, VercelResponse } from '../_lib/vercel-types.js';
import { getJSON } from '../_lib/kv.js';
import { userKey, type UserRecord } from '../_lib/types.js';

// Personalized link-unfurl page for trade invites. WhatsApp/Facebook/Twitter
// link previews are built by a crawler that reads raw HTML meta tags — it
// never runs the SPA's JS — so `/?u=xxx` always previewed as the generic
// homepage. This route (aliased to /troca/:id via vercel.json) looks up the
// sharer's name and serves a personalized preview, then immediately sends a
// real visitor on into the app.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !/^[A-Za-z0-9_-]{6,40}$/.test(id)) {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }

  let name = 'Um amigo';
  try {
    const user = await getJSON<UserRecord>(userKey(id));
    if (user?.name) name = user.name;
  } catch (err) {
    console.error('share:preview kv error', err);
    // fall back to the generic name below rather than failing the redirect
  }

  const target = `/?u=${encodeURIComponent(id)}`;
  const title = escapeHtml(`🏆 ${name} quer trocar figurinhas da Copa 2026 com você!`);
  const description = escapeHtml('Abra e veja na hora quais figurinhas repetidas dá pra trocar. Grátis, sem cadastro.');
  const canonical = `https://albumcopa.xyz/troca/${encodeURIComponent(id)}`;
  const targetJson = JSON.stringify(target);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Crawlers keep this page; real visitors bounce through instantly.
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).send(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Coleção Copa 2026">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://albumcopa.xyz/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="https://albumcopa.xyz/og.png">
<meta http-equiv="refresh" content="0;url=${target}">
<script>location.replace(${targetJson});</script>
</head>
<body>
<p>Abrindo o álbum... <a href="${target}">Toque aqui se não for redirecionado</a>.</p>
</body>
</html>`);
}
