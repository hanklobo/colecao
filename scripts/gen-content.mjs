/**
 * Generates the static SEO content hub under public/copa-2026/** and
 * refreshes public/sitemap.xml. Runs before `dev` and `build` (see
 * package.json) so the pages always reflect src/data/checklist2026.json and
 * src/data/featuredListings.json.
 *
 * These are plain static HTML files — no React, no client bundle — so they
 * are instantly crawlable and fast, and they live outside Vite's SPA
 * fallback because Vercel serves a matching static file before it ever
 * applies the vercel.json rewrite to index.html.
 *
 * Run with: npm run content
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pub = resolve(root, 'public');
const SITE = 'https://albumcopa.xyz';

const checklist = JSON.parse(readFileSync(resolve(root, 'src/data/checklist2026.json'), 'utf8'));
const featured = JSON.parse(readFileSync(resolve(root, 'src/data/featuredListings.json'), 'utf8'));

// ── Rebuild the same sequential sticker ids album2026.ts computes ──────────
let nextId = 1;
const sections = checklist.sections.map((raw) => {
  const stickers = raw.stickers.map((st) => ({ ...st, id: nextId++ }));
  return { ...raw, stickers, firstId: stickers[0].id, lastId: stickers[stickers.length - 1].id };
});
const teams = sections.filter((s) => s.group); // excludes INTRO, MUSEU, COCA (sponsor set)
const groups = {};
for (const t of teams) (groups[t.group] ??= []).push(t);

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const slugOf = (team) => slugify(team.name);

// "seleção {PREP} {nome}" — contraction/preposition before each country name
// (do Brasil, da Argentina, dos Estados Unidos, de Portugal...). A handful of
// names take the bare preposition with no article (islands + Portugal/Gana).
const PREP = {
  MEX: 'do', RSA: 'da', KOR: 'da', CZE: 'da', CAN: 'do', BIH: 'da', QAT: 'do',
  SUI: 'da', BRA: 'do', MAR: 'do', HAI: 'do', SCO: 'da', USA: 'dos', PAR: 'do',
  AUS: 'da', TUR: 'da', GER: 'da', CUW: 'de', CIV: 'da', ECU: 'do', NED: 'da',
  JPN: 'do', SWE: 'da', TUN: 'da', BEL: 'da', EGY: 'do', IRN: 'do', NZL: 'da',
  ESP: 'da', CPV: 'de', KSA: 'da', URU: 'do', FRA: 'da', SEN: 'do', IRQ: 'do',
  NOR: 'da', ARG: 'da', ALG: 'da', AUT: 'da', JOR: 'da', POR: 'de', COD: 'da',
  UZB: 'do', COL: 'da', ENG: 'da', CRO: 'da', GHA: 'de', PAN: 'do',
};
const DISPLAY_OVERRIDE = { COD: 'República Democrática do Congo' };
const displayName = (t) => DISPLAY_OVERRIDE[t.id] ?? t.name;
const withPrep = (t) => `${PREP[t.id] ?? 'de'} ${displayName(t)}`;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function flagImg(code, alt, cls = 'flag') {
  if (!code) return '';
  return `<img src="https://flagcdn.com/w80/${code}.png" alt="${esc(alt)}" class="${cls}" loading="lazy" width="28" height="20">`;
}

// ── Shared page shell ───────────────────────────────────────────────────────
const CSS = `
:root{--navy:#0b2e6b;--blue:#1a56b0;--gold:#f4b400;--ink:#111827;--muted:#6b7280;--bg:#f8fafc;--line:#e5e7eb}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.5}
a{color:var(--blue);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:760px;margin:0 auto;padding:0 18px}
header.top{background:linear-gradient(135deg,#071e4a 0%,#0b2e6b 45%,#1a56b0 100%);color:#fff;padding:14px 0}
header.top .wrap{display:flex;align-items:center;gap:10px}
header.top .brand{font-weight:800;letter-spacing:-.02em;font-size:16px}
header.top .brand b{color:var(--gold)}
header.top nav{margin-left:auto;display:flex;gap:14px;font-size:13px}
header.top nav a{color:rgba(255,255,255,.85)}
.crumbs{font-size:12px;color:var(--muted);margin:16px 0 6px}
.crumbs a{color:var(--muted)}
h1{font-size:26px;line-height:1.2;margin:6px 0 10px;letter-spacing:-.01em}
h2{font-size:19px;margin:28px 0 10px}
p.lead{color:#374151;font-size:15px}
.badge{display:inline-block;background:rgba(11,46,107,.08);color:var(--navy);font-weight:700;font-size:11px;letter-spacing:.03em;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:10px}
.cta{display:inline-flex;align-items:center;gap:8px;background:var(--blue);color:#fff;font-weight:700;padding:12px 20px;border-radius:14px;font-size:14px;margin:10px 8px 4px 0}
.cta:hover{background:var(--navy);text-decoration:none}
.cta.gold{background:var(--gold);color:#3a2900}
.cta.gold:hover{background:#e0a600}
.cta.ghost{background:#fff;color:var(--navy);border:1px solid var(--line)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:14px 0}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;display:block;color:inherit}
.card:hover{border-color:var(--blue);text-decoration:none}
.card .flag{border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
.card .name{font-weight:700;font-size:13.5px;margin-top:8px}
.card .meta{color:var(--muted);font-size:11.5px;margin-top:2px}
.group-block{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin:14px 0}
.group-block h3{margin:0 0 10px;font-size:14px;color:var(--navy)}
.group-teams{display:flex;flex-wrap:wrap;gap:8px}
.group-teams a{display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:6px 10px;font-size:12.5px;font-weight:600;color:var(--ink)}
.group-teams a:hover{border-color:var(--blue);text-decoration:none}
table.roster{width:100%;border-collapse:collapse;margin:14px 0;font-size:13.5px}
table.roster th,table.roster td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
table.roster th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.03em}
table.roster td.num{font-variant-numeric:tabular-nums;color:var(--muted);width:46px}
.faq details{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0}
.faq summary{font-weight:700;font-size:14px;cursor:pointer}
.faq p{margin:8px 0 0;color:#374151;font-size:13.5px}
.product{display:flex;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;margin:10px 0;align-items:center}
.product img{width:76px;height:76px;object-fit:contain;flex-shrink:0;background:#f8fafc;border-radius:10px}
.product .title{font-weight:700;font-size:13px;line-height:1.35}
.product .price{font-weight:800;font-size:18px;margin-top:4px}
.product .price small{font-weight:700;font-size:11px}
.product .old{color:var(--muted);font-size:11px;text-decoration:line-through}
.wc-live{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin:14px 0}
.wc-fixture{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.wc-fixture:last-child{border-bottom:none}
.wc-fixture strong{font-variant-numeric:tabular-nums;color:var(--navy)}
.wc-muted{color:var(--muted);font-size:13.5px;margin:0}
footer.site{margin:40px 0 30px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}
`;

function shell({ path, title, description, bodyHtml, jsonLd = [], breadcrumbs = [] }) {
  const canonical = `${SITE}${path}`;
  const crumbsHtml = breadcrumbs.length
    ? `<div class="crumbs">${breadcrumbs.map((c, i) => (i < breadcrumbs.length - 1 ? `<a href="${c.href}">${esc(c.label)}</a> › ` : esc(c.label))).join('')}</div>`
    : '';
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        item: `${SITE}${c.href}`,
      })),
    },
    ...jsonLd,
  ];
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Coleção Copa 2026">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script defer src="/_vercel/insights/script.js"></script>
<style>${CSS}</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/copa-2026/" style="color:#fff">Coleção <b>Copa 2026</b></a>
    <nav>
      <a href="/copa-2026/selecoes/">Seleções</a>
      <a href="/copa-2026/tabela-de-jogos/">Jogos</a>
      <a href="/" style="color:#fcd34d;font-weight:700">Abrir o app</a>
    </nav>
  </div>
</header>
<main class="wrap">
${crumbsHtml}
${bodyHtml}
<footer class="site">
  App não oficial, feito por fãs. Sem vínculo com a FIFA ou a Panini. ·
  <a href="/copa-2026/">Copa 2026</a> · <a href="/">AlbumCopa.xyz</a>
</footer>
</main>
</body>
</html>`;
}

function write(path, html) {
  const dir = resolve(pub, `.${path}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), html);
}

const urls = []; // for sitemap.xml
function track(path, priority, changefreq) {
  urls.push({ path, priority, changefreq });
}

// ── Hub: /copa-2026/ ────────────────────────────────────────────────────────
{
  const path = '/copa-2026/';
  const title = 'Copa do Mundo 2026: grupos, seleções, jogadores e álbum de figurinhas | AlbumCopa';
  const description =
    'Guia completo da Copa do Mundo 2026: os 12 grupos, as 48 seleções e seus jogadores, tabela de jogos e onde comprar o álbum. Organize suas figurinhas de graça no app.';
  const body = `
<span class="badge">FIFA World Cup 2026</span>
<h1>Copa do Mundo 2026 — tudo em um só lugar</h1>
<p class="lead">Canadá, México e Estados Unidos recebem a primeira Copa do Mundo com 48 seleções: 12 grupos,
104 jogos, de 11 de junho a 19 de julho de 2026. Aqui você encontra os grupos, o elenco de cada seleção com o
número da figurinha no álbum, a tabela de jogos e onde comprar — e organiza tudo de graça no app.</p>

<a class="cta" href="/">📖 Abrir o álbum de figurinhas grátis</a>

<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
  <a class="card" href="/copa-2026/grupos/">
    <div class="name">🏆 Grupos da Copa (A–L)</div>
    <div class="meta">As 48 seleções divididas nos 12 grupos</div>
  </a>
  <a class="card" href="/copa-2026/selecoes/">
    <div class="name">⚽ Seleções e jogadores</div>
    <div class="meta">Elenco convocado e número no álbum de cada seleção</div>
  </a>
  <a class="card" href="/copa-2026/tabela-de-jogos/">
    <div class="name">📅 Tabela de jogos</div>
    <div class="meta">Datas das fases e jogos de hoje</div>
  </a>
  <a class="card" href="/copa-2026/onde-comprar-figurinhas-e-album/">
    <div class="name">🛒 Onde comprar</div>
    <div class="meta">Álbum, envelopes e figurinhas avulsas</div>
  </a>
</div>

<h2>Perguntas frequentes</h2>
<div class="faq">
  <details>
    <summary>Quantas figurinhas tem o álbum da Copa do Mundo 2026?</summary>
    <p>O álbum oficial Panini da Copa do Mundo 2026 tem 980 figurinhas: 9 de abertura, 11 do FIFA Museum e
    48 seleções com 20 figurinhas cada (escudo, foto do time e 18 jogadores).</p>
  </details>
  <details>
    <summary>Quando é a final da Copa do Mundo 2026?</summary>
    <p>A final está marcada para 19 de julho de 2026, no MetLife Stadium, em Nova Jersey (EUA).</p>
  </details>
  <details>
    <summary>Quantos jogos tem a Copa do Mundo 2026?</summary>
    <p>Com a expansão para 48 seleções, a Copa 2026 tem 104 jogos ao todo — o maior número da história do torneio.</p>
  </details>
  <details>
    <summary>Como troco figurinhas repetidas online?</summary>
    <p>No app AlbumCopa você marca o que tem e o que está repetido, gera um link e compartilha com um amigo —
    ele abre o link e o app já mostra na hora o que vale a pena trocar. É grátis e sem cadastro.
    <a href="/">Experimente agora</a>.</p>
  </details>
</div>
`;
  write(path, shell({
    path, title, description, bodyHtml: body,
    breadcrumbs: [{ label: 'Início', href: '/' }, { label: 'Copa 2026', href: '/copa-2026/' }],
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        ['Quantas figurinhas tem o álbum da Copa do Mundo 2026?', 'O álbum oficial Panini da Copa do Mundo 2026 tem 980 figurinhas: 9 de abertura, 11 do FIFA Museum e 48 seleções com 20 figurinhas cada.'],
        ['Quando é a final da Copa do Mundo 2026?', 'A final está marcada para 19 de julho de 2026, no MetLife Stadium, em Nova Jersey (EUA).'],
        ['Quantos jogos tem a Copa do Mundo 2026?', 'Com 48 seleções, a Copa 2026 tem 104 jogos ao todo.'],
        ['Como troco figurinhas repetidas online?', 'No app AlbumCopa você marca o que tem e o que está repetido, gera um link e compartilha — o app mostra na hora o que vale trocar.'],
      ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }],
  }));
  track(path, '0.9', 'weekly');
}

// ── Grupos: /copa-2026/grupos/ ──────────────────────────────────────────────
{
  const path = '/copa-2026/grupos/';
  const title = 'Grupos da Copa do Mundo 2026 — os 12 grupos e as 48 seleções';
  const description =
    'Veja os 12 grupos (A a L) da Copa do Mundo 2026 e as 48 seleções que disputam o torneio no Canadá, México e Estados Unidos.';
  const groupBlocks = Object.keys(groups).sort().map((g) => `
  <div class="group-block" id="grupo-${g}">
    <h3>Grupo ${g}</h3>
    <div class="group-teams">
      ${groups[g].map((t) => `<a href="/copa-2026/selecoes/${slugOf(t)}/">${flagImg(t.flagCode, t.name)} ${esc(t.name)}</a>`).join('\n      ')}
    </div>
    <div class="wc-standings-mini" data-group="${g}"></div>
  </div>`).join('\n');
  const body = `
<span class="badge">Fase de grupos</span>
<h1>Grupos da Copa do Mundo 2026</h1>
<p class="lead">As 48 seleções foram divididas em 12 grupos de 4. Toque numa seleção para ver o elenco
convocado e o número de cada figurinha no álbum.</p>
${groupBlocks}
<a class="cta" href="/">📖 Marcar figurinhas no app</a>

<script>
(function () {
  fetch('/api/worldcup/standings').then(function (r) { return r.json(); }).then(function (data) {
    if (!data || data.configured === false || !data.standings || !data.standings.length) return;
    var byGroup = {};
    data.standings.forEach(function (s) {
      (byGroup[s.group] = byGroup[s.group] || []).push(s);
    });
    document.querySelectorAll('.wc-standings-mini').forEach(function (el) {
      var rows = byGroup[el.getAttribute('data-group')];
      if (!rows || !rows.length) return;
      var head = '<tr><th>#</th><th>Seleção</th><th>J</th><th>SG</th><th>Pts</th></tr>';
      var body = rows.map(function (s) {
        return '<tr><td class="num">' + s.rank + 'º</td><td>' + s.team + '</td><td class="num">' + s.played +
          '</td><td class="num">' + (s.goalsDiff > 0 ? '+' : '') + s.goalsDiff + '</td><td class="num"><strong>' + s.points + '</strong></td></tr>';
      }).join('');
      el.innerHTML = '<table class="roster" style="margin-top:10px"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    });
  }).catch(function () { /* leave the plain team list if standings fail to load */ });
})();
</script>
`;
  write(path, shell({
    path, title, description, bodyHtml: body,
    breadcrumbs: [{ label: 'Início', href: '/' }, { label: 'Copa 2026', href: '/copa-2026/' }, { label: 'Grupos', href: path }],
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: teams.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `Grupo ${t.group}: ${t.name}` })),
    }],
  }));
  track(path, '0.8', 'monthly');
}

// ── Seleções: /copa-2026/selecoes/ (index) + one page per team ─────────────
{
  const path = '/copa-2026/selecoes/';
  const title = 'Seleções da Copa do Mundo 2026 — todas as 48 seleções e jogadores';
  const description =
    'As 48 seleções da Copa do Mundo 2026: veja o elenco convocado de cada uma e o número da figurinha no álbum Panini.';
  const cards = teams.map((t) => `
  <a class="card" href="/copa-2026/selecoes/${slugOf(t)}/">
    ${flagImg(t.flagCode, t.name, 'flag')}
    <div class="name">${esc(t.name)}</div>
    <div class="meta">Grupo ${t.group} · figs #${t.firstId}–#${t.lastId}</div>
  </a>`).join('');
  const body = `
<span class="badge">48 seleções</span>
<h1>Seleções da Copa do Mundo 2026</h1>
<p class="lead">Toque numa seleção para ver o elenco convocado para a Copa 2026 e o número de cada
jogador no álbum de figurinhas.</p>
<div class="grid">${cards}</div>
`;
  write(path, shell({
    path, title, description, bodyHtml: body,
    breadcrumbs: [{ label: 'Início', href: '/' }, { label: 'Copa 2026', href: '/copa-2026/' }, { label: 'Seleções', href: path }],
  }));
  track(path, '0.8', 'monthly');
}

for (const t of teams) {
  const slug = slugOf(t);
  const path = `/copa-2026/selecoes/${slug}/`;
  const title = `Seleção ${withPrep(t)} na Copa do Mundo 2026 — jogadores e figurinhas | Grupo ${t.group}`;
  const description = `Elenco ${withPrep(t)} convocado para a Copa do Mundo 2026, do Grupo ${t.group}: veja os 20 cromos do álbum (#${t.firstId} a #${t.lastId}) e marque quem você já tem.`;
  const rows = t.stickers.map((st) => `
      <tr>
        <td class="num">#${st.id}</td>
        <td>${esc(st.name)}</td>
        <td>${st.special ? 'Especial' : 'Jogador'}</td>
      </tr>`).join('');
  const otherInGroup = groups[t.group].filter((x) => x.id !== t.id);
  const body = `
<span class="badge">Grupo ${t.group}</span>
<h1>${flagImg(t.flagCode, t.name, 'flag')} ${esc(t.name)} na Copa do Mundo 2026</h1>
<p class="lead">Elenco ${esc(withPrep(t))} convocado para a Copa 2026 e o número de cada figurinha no álbum
Panini oficial — de #${t.firstId} a #${t.lastId} (escudo, foto do time e 18 jogadores).</p>

<a class="cta" href="/?secao=${t.id}" onclick="window.va&&window.va('event',{name:'content_to_app',data:{cta:'secao',team:'${t.id}'}})">✅ Marcar minhas figurinhas ${esc(withPrep(t))}</a>
<a class="cta ghost" href="/?tab=shopping" onclick="window.va&&window.va('event',{name:'content_to_app',data:{cta:'shopping'}})">🛒 Ver ofertas de álbum e figurinhas</a>

<table class="roster">
  <thead><tr><th>Fig.</th><th>Figurinha</th><th>Tipo</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<h2>Grupo ${t.group}</h2>
<div class="group-teams">
  ${otherInGroup.map((x) => `<a href="/copa-2026/selecoes/${slugOf(x)}/">${flagImg(x.flagCode, x.name)} ${esc(x.name)}</a>`).join('\n  ')}
</div>
<p><a href="/copa-2026/grupos/#grupo-${t.group}">Ver grupo completo</a> · <a href="/copa-2026/selecoes/">Ver todas as seleções</a></p>
`;
  write(path, shell({
    path, title, description, bodyHtml: body,
    breadcrumbs: [
      { label: 'Início', href: '/' },
      { label: 'Copa 2026', href: '/copa-2026/' },
      { label: 'Seleções', href: '/copa-2026/selecoes/' },
      { label: t.name, href: path },
    ],
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'SportsTeam',
      name: t.name,
      sport: 'Soccer',
      memberOf: { '@type': 'SportsOrganization', name: 'FIFA World Cup 2026' },
      athlete: t.stickers.filter((s) => !s.special).map((s) => ({ '@type': 'Person', name: s.name })),
    }],
  }));
  track(path, '0.6', 'monthly');
}

// ── Tabela de jogos: /copa-2026/tabela-de-jogos/ ────────────────────────────
{
  const path = '/copa-2026/tabela-de-jogos/';
  const title = 'Tabela e jogos de hoje da Copa do Mundo 2026 — datas e fases';
  const description =
    'Calendário da Copa do Mundo 2026: datas de cada fase, de 11 de junho a 19 de julho, e os jogos de hoje ao vivo.';
  const body = `
<span class="badge">Calendário</span>
<h1>Tabela de jogos da Copa do Mundo 2026</h1>
<p class="lead">A Copa do Mundo 2026 é disputada entre 11 de junho e 19 de julho de 2026, em 16 cidades do
Canadá, México e Estados Unidos, com 48 seleções e 104 jogos — o maior formato da história.</p>

<h2>Jogos de hoje</h2>
<div class="wc-live" id="wc-live">Carregando jogos de hoje…</div>

<h2>Fases e datas</h2>
<table class="roster">
  <thead><tr><th>Fase</th><th>Período</th></tr></thead>
  <tbody>
    <tr><td>Fase de grupos</td><td>11–27 de junho</td></tr>
    <tr><td>Rodada de 32</td><td>28 de junho–3 de julho</td></tr>
    <tr><td>Oitavas de final</td><td>4–7 de julho</td></tr>
    <tr><td>Quartas de final</td><td>9–10 de julho</td></tr>
    <tr><td>Semifinais</td><td>14 de julho</td></tr>
    <tr><td>Terceiro lugar</td><td>18 de julho</td></tr>
    <tr><td>Final</td><td>19 de julho — MetLife Stadium (Nova Jersey)</td></tr>
  </tbody>
</table>

<a class="cta" href="/">📖 Acompanhar sua coleção no app</a>

<script>
(function () {
  var el = document.getElementById('wc-live');
  fetch('/api/worldcup/fixtures').then(function (r) { return r.json(); }).then(function (data) {
    if (!data || data.configured === false) {
      el.innerHTML = '<p class="wc-muted">Placar ao vivo chegando em breve por aqui.</p>';
      return;
    }
    if (!data.fixtures || !data.fixtures.length) {
      el.innerHTML = '<p class="wc-muted">Sem jogos agendados para hoje.</p>';
      return;
    }
    el.innerHTML = data.fixtures.map(function (f) {
      var mid = f.score || f.time || '';
      return '<div class="wc-fixture"><span>' + f.home + '</span><strong>' + mid + '</strong><span>' + f.away + '</span></div>';
    }).join('');
  }).catch(function () {
    el.innerHTML = '<p class="wc-muted">Não foi possível carregar os jogos agora.</p>';
  });
})();
</script>
`;
  write(path, shell({
    path, title, description, bodyHtml: body,
    breadcrumbs: [{ label: 'Início', href: '/' }, { label: 'Copa 2026', href: '/copa-2026/' }, { label: 'Tabela de jogos', href: path }],
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: 'FIFA World Cup 2026',
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      location: [
        { '@type': 'Country', name: 'Canada' },
        { '@type': 'Country', name: 'Mexico' },
        { '@type': 'Country', name: 'United States' },
      ],
    }],
  }));
  track(path, '0.9', 'daily');
}

// ── Onde comprar: /copa-2026/onde-comprar-figurinhas-e-album/ ──────────────
{
  const path = '/copa-2026/onde-comprar-figurinhas-e-album/';
  const title = 'Onde comprar álbum e figurinhas da Copa do Mundo 2026';
  const description =
    'Onde comprar o álbum, envelopes e figurinhas avulsas da Copa do Mundo 2026 Panini — preços e ofertas atualizadas.';
  const products = featured.map((p) => {
    const priceStr = p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const oldStr = p.priceFull ? `<div class="old">R$ ${p.priceFull.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>` : '';
    return `
  <a class="product" href="${p.url}" target="_blank" rel="noopener noreferrer nofollow sponsored"
     onclick="window.va&&window.va('event',{name:'affiliate_click',data:{id:'${p.id}',source:'seo-page'}})">
    <img src="${p.image}" alt="${esc(p.title)}" loading="lazy">
    <div>
      <div class="title">${esc(p.title)}</div>
      ${oldStr}
      <div class="price"><small>R$</small> ${priceStr}</div>
    </div>
  </a>`;
  }).join('');
  const body = `
<span class="badge">Mercado Livre</span>
<h1>Onde comprar álbum e figurinhas da Copa 2026</h1>
<p class="lead">Separamos os anúncios com melhor avaliação para completar sua coleção: álbum capa dura,
envelopes com figurinhas e itens colecionáveis. Os links levam direto ao anúncio no Mercado Livre.</p>

${products}

<a class="cta" href="/">📖 Organizar minha coleção no app</a>
<a class="cta ghost" href="/?tab=shopping" onclick="window.va&&window.va('event',{name:'content_to_app',data:{cta:'shopping'}})">Ver mais ofertas no app</a>

<h2>Perguntas frequentes</h2>
<div class="faq">
  <details>
    <summary>Quanto custa o álbum da Copa do Mundo 2026?</summary>
    <p>O álbum capa dura costuma custar entre R$ 30 e R$ 60, e cada envelope (6 figurinhas) fica em torno de
    R$ 6 a R$ 8, variando por promoção e vendedor.</p>
  </details>
  <details>
    <summary>Dá para comprar figurinha avulsa (repetida) online?</summary>
    <p>Sim, há vendedores especializados em figurinhas avulsas no Mercado Livre. Outra opção 100% grátis é
    trocar suas repetidas com amigos pelo app AlbumCopa — sem gastar nada a mais.</p>
  </details>
</div>

<p class="wc-muted" style="font-size:11px">Links levam direto para o anúncio no Mercado Livre. O AlbumCopa
não vende, não intermedia e não garante esses produtos — confira sempre o vendedor antes de comprar.</p>
`;
  write(path, shell({
    path, title, description, bodyHtml: body,
    breadcrumbs: [{ label: 'Início', href: '/' }, { label: 'Copa 2026', href: '/copa-2026/' }, { label: 'Onde comprar', href: path }],
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: featured.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: p.url })),
    }],
  }));
  track(path, '0.85', 'weekly');
}

// ── Sitemap ──────────────────────────────────────────────────────────────
{
  const all = [{ path: '/', priority: '1.0', changefreq: 'weekly' }, ...urls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => `  <url>\n    <loc>${SITE}${u.path}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;
  writeFileSync(resolve(pub, 'sitemap.xml'), xml);
}

console.log(`✓ Copa 2026 content hub: ${urls.length + 1} páginas geradas em public/copa-2026/ + sitemap.xml`);
