import { useMemo, useState } from 'react';
import { ExternalLinkIcon, SearchIcon } from '../components/Icons';

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
      <div className="px-6 mt-5">
        <p className="text-gray-400 text-[10px] text-center leading-relaxed">
          Links levam direto para a busca em cada marketplace. O AlbumCopa não vende, não intermedia
          e não garante esses produtos — confira sempre o vendedor antes de comprar.
        </p>
      </div>
    </div>
  );
}
