import { useMemo, useState } from 'react';
import { ExternalLinkIcon, SearchIcon } from '../components/Icons';

// ── Featured listings (hardcoded ML ads) ────────────────────────────────────
interface FeaturedListing {
  id: string;
  title: string;
  image: string;          // public image URL from ML CDN
  priceFull?: number;     // original price (riscado)
  price: number;          // current price
  discount?: number;      // % off
  rating: number;         // 0–5
  reviews: number;
  installments?: string;  // e.g. "12x R$ 6,41"
  badge?: string;         // e.g. "MAIS VENDIDO"
  badgeColor?: string;    // tailwind bg class
  tag?: string;           // e.g. "1º em Figurinhas"
  url: string;            // short link
}

const FEATURED: FeaturedListing[] = [
  {
    id: 'kit-10-env',
    title: 'Kit 10 Envelopes Copa do Mundo 2026 — 70 figurinhas Panini',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_906901-MLB79466368641_092024-F.webp',
    priceFull: 94.99,
    price: 65.06,
    discount: 31,
    rating: 4.8,
    reviews: 12757,
    installments: '12x R$ 6,41',
    badge: 'MAIS VENDIDO',
    badgeColor: 'bg-orange-500',
    tag: '1º em Figurinhas',
    url: 'https://meli.la/2rFbrY2',
  },
  {
    id: 'figurinha-personalizada',
    title: 'Kit 2 Figurinhas da Copa do Mundo 2026 Personalizadas',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_600203-MLB79748890698_102024-F.webp',
    priceFull: 26.53,
    price: 20.37,
    discount: 23,
    rating: 5.0,
    reviews: 5,
    badge: 'NOVO',
    badgeColor: 'bg-copa-blue',
    tag: '✨ Figurinha especial',
    url: 'https://meli.la/1iYQjt6',
  },
  {
    id: 'box-estadio',
    title: 'Box Estádio Copa do Mundo Numerado Exclusivo FIFA World Cup 2026',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_962587-MLB79466368641_092024-F.webp',
    price: 1829.90,
    rating: 4.6,
    reviews: 117,
    badge: 'MAIS VENDIDO',
    badgeColor: 'bg-orange-500',
    tag: '16º em Livros Físicos Panini',
    url: 'https://meli.la/33hs4gF',
  },
];

interface Marketplace {
  id: string;
  name: string;
  short: string;
  build: (query: string) => string;
  badgeClass: string;
}

interface Category {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  query: string;
}

const MARKETPLACES: Marketplace[] = [
  {
    id: 'ml',
    name: 'Mercado Livre',
    short: 'ML',
    build: (q) =>
      `https://lista.mercadolivre.com.br/${encodeURIComponent(q).replace(/%20/g, '-')}`,
    badgeClass: 'bg-yellow-300 text-blue-900',
  },
  {
    id: 'shopee',
    name: 'Shopee',
    short: 'SP',
    build: (q) => `https://shopee.com.br/search?keyword=${encodeURIComponent(q)}`,
    badgeClass: 'bg-orange-500 text-white',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    short: 'TT',
    build: (q) => `https://www.tiktok.com/shop/s/${encodeURIComponent(q)}`,
    badgeClass: 'bg-black text-white',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    short: 'AZ',
    build: (q) => `https://www.amazon.com.br/s?k=${encodeURIComponent(q)}`,
    badgeClass: 'bg-slate-900 text-white',
  },
];

const CATEGORIES: Category[] = [
  {
    id: 'cromos',
    title: 'Figurinhas (cromos)',
    emoji: '⚽',
    blurb: 'Cromos avulsos da coleção da Copa 2026 — ideais para fechar o álbum.',
    query: 'figurinhas copa do mundo 2026 panini',
  },
  {
    id: 'envelopes',
    title: 'Envelopes / Pacotinhos',
    emoji: '🎁',
    blurb: 'Pacotinhos lacrados, caixas e displays oficiais Panini.',
    query: 'envelopes panini copa do mundo 2026',
  },
  {
    id: 'album',
    title: 'Álbuns',
    emoji: '📔',
    blurb: 'Álbum capa mole, capa dura e edições especiais.',
    query: 'album copa do mundo 2026 panini',
  },
  {
    id: 'camisas',
    title: 'Camisas das seleções',
    emoji: '👕',
    blurb: 'Camisas oficiais e versões torcedor das 48 seleções.',
    query: 'camisa selecao brasileira 2026',
  },
  {
    id: 'bandeiras',
    title: 'Bandeiras',
    emoji: '🚩',
    blurb: 'Bandeiras de países, mastros e bandeirinhas decorativas.',
    query: 'bandeira copa do mundo paises',
  },
  {
    id: 'outros',
    title: 'Outros produtos',
    emoji: '✨',
    blurb: 'Bolas, chaveiros, canecas e itens colecionáveis da Copa.',
    query: 'copa do mundo 2026 produtos oficiais',
  },
];

export function ShoppingView() {
  const [activeMarketplace, setActiveMarketplace] = useState<string>('all');
  const [search, setSearch] = useState('');

  const visibleMarkets = useMemo(
    () => (activeMarketplace === 'all'
      ? MARKETPLACES
      : MARKETPLACES.filter((m) => m.id === activeMarketplace)),
    [activeMarketplace],
  );

  const trimmedSearch = search.trim();

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      {/* Hero */}
      <div
        className="relative px-5 pt-6 pb-6 shadow-card-lg overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(135deg, #071e4a 0%, #0b2e6b 45%, #1a56b0 100%)' }}
      >
        <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute -bottom-12 -left-6 w-40 h-40 rounded-full bg-copa-gold/[0.06] pointer-events-none" />

        <p className="relative text-white/55 text-[10px] font-bold uppercase tracking-widest mb-1.5">
          Marketplace
        </p>
        <h2 className="relative font-display font-extrabold text-white text-2xl leading-tight">
          Comprar cromos e itens da Copa
        </h2>
        <p className="relative text-white/70 text-[12px] leading-snug mt-2">
          Buscamos pra você nas principais lojas. Toque numa loja pra ver os anúncios — abre direto
          no site oficial.
        </p>

        {/* Search */}
        <div className="relative mt-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2.5 ring-1 ring-white/15">
            <SearchIcon className="w-4 h-4 text-white/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar algo específico (ex: figurinha Messi)"
              className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-white/50 hover:text-white text-xs font-bold"
              >
                limpar
              </button>
            )}
          </div>
        </div>

        {/* Custom search results */}
        {trimmedSearch && (
          <div className="relative mt-4 grid grid-cols-2 gap-2">
            {MARKETPLACES.map((m) => (
              <a
                key={m.id}
                href={m.build(trimmedSearch)}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center justify-between gap-2 bg-white/95 rounded-xl px-3 py-2.5 active:scale-95 transition-transform"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${m.badgeClass}`}
                  >
                    {m.short}
                  </span>
                  <span className="text-gray-800 text-xs font-bold truncate">{m.name}</span>
                </span>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Featured listings ── */}
      {!trimmedSearch && (
        <div className="px-4 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔥</span>
            <h2 className="font-display font-extrabold text-gray-900 text-base tracking-tight">
              Anúncios em destaque
            </h2>
          </div>
          <div className="space-y-3">
            {FEATURED.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Marketplace filter chips */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 no-scrollbar">
          {[{ id: 'all', name: 'Todas as lojas', short: '★', badgeClass: 'bg-copa-blue text-white' }, ...MARKETPLACES].map((m) => {
            const active = activeMarketplace === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMarketplace(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                  active
                    ? 'bg-copa-blue text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${m.badgeClass}`}>
                  {m.short}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-3 space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-start gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #fef3c7 100%)' }}
              >
                {cat.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-extrabold text-gray-900 text-sm leading-tight">
                  {cat.title}
                </h3>
                <p className="text-gray-500 text-[11px] leading-snug mt-0.5">{cat.blurb}</p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2">
              {visibleMarkets.map((m) => (
                <a
                  key={m.id}
                  href={m.build(cat.query)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2.5 active:scale-95 transition"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${m.badgeClass}`}
                    >
                      {m.short}
                    </span>
                    <span className="text-gray-800 text-xs font-bold truncate">{m.name}</span>
                  </span>
                  <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="px-6 mt-5 mb-2">
        <p className="text-gray-400 text-[10px] text-center leading-relaxed">
          Links levam direto para a busca em cada marketplace. O AlbumCopa não vende, não intermedia
          e não garante esses produtos — confira sempre o vendedor antes de comprar.
        </p>
      </div>
    </div>
  );
}

// ── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, value - (i - 1)));
        const color = fill > 0 ? 'text-yellow-400' : 'text-gray-200';
        return (
          <svg key={i} className={`w-3.5 h-3.5 ${color}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
        );
      })}
    </span>
  );
}

// ── Featured listing card ────────────────────────────────────────────────────

function FeaturedCard({ item }: { item: FeaturedListing }) {
  const fmtBRL = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const intPart = Math.floor(item.price).toLocaleString('pt-BR');
  const decPart = (item.price % 1).toFixed(2).slice(1); // ".06"

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex bg-white rounded-2xl shadow-card overflow-hidden active:scale-[0.98] transition-transform"
      aria-label={`Ver ${item.title} no Mercado Livre`}
    >
      {/* Product image */}
      <div className="w-32 flex-shrink-0 bg-gray-50 relative">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-contain p-2"
          loading="lazy"
        />
        {item.discount && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md leading-none">
            {item.discount}% OFF
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 p-3 flex flex-col gap-1.5">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.badge && (
            <span
              className={`${item.badgeColor ?? 'bg-orange-500'} text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase leading-none`}
            >
              {item.badge}
            </span>
          )}
          {item.tag && (
            <span className="text-copa-blue text-[9px] font-bold leading-none">
              {item.tag}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-gray-900 font-bold text-[12px] leading-snug line-clamp-3">
          {item.title}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-700 text-[11px] font-bold">{item.rating}</span>
          <StarRating value={item.rating} />
          <span className="text-gray-400 text-[10px]">
            ({item.reviews.toLocaleString('pt-BR')})
          </span>
        </div>

        {/* Price block */}
        <div>
          {item.priceFull && (
            <p className="text-gray-400 text-[10px] line-through leading-none mb-0.5">
              R$ {fmtBRL(item.priceFull)}
            </p>
          )}
          <p className="leading-none">
            <span className="text-gray-700 text-[11px] font-medium align-top mt-px mr-0.5 inline-block">
              R$
            </span>
            <span className="text-gray-900 font-extrabold text-[22px] leading-none tabular-nums">
              {intPart}
            </span>
            <span className="text-gray-700 text-[11px] font-bold align-top mt-px inline-block">
              {decPart}
            </span>
          </p>
          {item.installments && (
            <p className="text-gray-500 text-[10px] leading-snug mt-0.5">{item.installments}</p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <span className="inline-flex items-center gap-1 text-copa-blue text-[11px] font-bold">
            Ver no Mercado Livre
            <ExternalLinkIcon className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
