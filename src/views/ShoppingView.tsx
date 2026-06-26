import { ExternalLinkIcon } from '../components/Icons';

// ── Featured listings (hardcoded ML ads) ────────────────────────────────────
interface FeaturedListing {
  id: string;
  title: string;
  image: string;
  priceFull?: number;
  price: number;
  discount?: number;
  rating: number;
  reviews: number;
  installments?: string;
  badge?: string;
  badgeColor?: string;
  tag?: string;
  url: string;
}

const FEATURED: FeaturedListing[] = [
  {
    id: 'kit-10-env',
    title: 'Kit 10 Envelopes Copa do Mundo 2026 — 70 figurinhas Panini',
    image: '/kit-10-env.webp',
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
    image: '/figurinha-personalizada.webp',
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
    id: 'album-capa-dura',
    title: 'Álbum Capa Dura Ouro — Copa do Mundo 2026 FIFA World Cup Panini',
    image: '/album-capa-dura.webp',
    priceFull: 59.99,
    price: 39.53,
    discount: 34,
    rating: 4.9,
    reviews: 360,
    badge: 'MAIS VENDIDO',
    badgeColor: 'bg-orange-500',
    tag: '15º em Livros Físicos',
    url: 'https://meli.la/1sopTpB',
  },
  {
    id: 'box-estadio',
    title: 'Box Estádio Copa do Mundo Numerado Exclusivo FIFA World Cup 2026',
    image: '/box-estadio.webp',
    price: 1829.90,
    rating: 4.6,
    reviews: 117,
    badge: 'MAIS VENDIDO',
    badgeColor: 'bg-orange-500',
    tag: '16º em Livros Físicos Panini',
    url: 'https://meli.la/33hs4gF',
  },
];

// ── View ─────────────────────────────────────────────────────────────────────

export function ShoppingView() {
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
          Mercado Livre
        </p>
        <h2 className="relative font-display font-extrabold text-white text-2xl leading-tight">
          Anúncios em destaque
        </h2>
        <p className="relative text-white/70 text-[12px] leading-snug mt-2">
          Seleção especial de produtos para completar sua coleção. Toque para ver no Mercado Livre.
        </p>
      </div>

      {/* Cards */}
      <div className="px-4 pt-4 space-y-3">
        {FEATURED.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="px-6 mt-5 mb-2">
        <p className="text-gray-400 text-[10px] text-center leading-relaxed">
          Links levam direto para o anúncio no Mercado Livre. O AlbumCopa não vende, não intermedia
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
        const filled = value >= i - 0.25;
        return (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-gray-200'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
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
  const decPart = (item.price % 1).toFixed(2).slice(1);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex bg-white rounded-2xl shadow-card overflow-hidden active:scale-[0.98] transition-transform"
      aria-label={`Ver ${item.title} no Mercado Livre`}
    >
      {/* Product image */}
      <div className="w-32 flex-shrink-0 bg-gray-50 relative self-stretch">
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
        {/* Badges */}
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

        {/* Price */}
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
        <div className="mt-auto pt-0.5">
          <span className="inline-flex items-center gap-1 text-copa-blue text-[11px] font-bold">
            Ver no Mercado Livre
            <ExternalLinkIcon className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
