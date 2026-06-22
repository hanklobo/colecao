import { useState } from 'react';
import { getFlagUrl } from '../utils/flags';
import { CloseIcon, CheckIcon, GiveIcon, ReceiveIcon } from './Icons';

interface Props {
  onClose: () => void;
  /** true on first ever visit — tweaks the copy / button label */
  firstTime?: boolean;
}

// ── Small flag helper ───────────────────────────────────────────────────────
function Flag({ id, className }: { id: string; className?: string }) {
  const url = getFlagUrl(id, 80);
  return (
    <span className={`inline-block overflow-hidden bg-gray-100 ${className}`}>
      {url && <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />}
    </span>
  );
}

// ── Slide 1 illustration: floating flags around the trophy ──────────────────
function HeroArt() {
  return (
    <div className="relative h-44 w-full flex items-center justify-center">
      {/* glow */}
      <div className="absolute w-40 h-40 rounded-full bg-copa-gold/30 blur-2xl" />
      {/* trophy / ball badge */}
      <div className="relative w-24 h-24 rounded-[28px] bg-gradient-to-br from-copa-gold to-amber-500 shadow-card-lg flex items-center justify-center text-5xl animate-float">
        🏆
      </div>
      {/* scattered flags */}
      <Flag id="BRA" className="absolute left-3 top-4 w-12 h-8 rounded-lg shadow-card ring-2 ring-white/70 -rotate-12 animate-float" />
      <Flag id="ARG" className="absolute right-4 top-2 w-12 h-8 rounded-lg shadow-card ring-2 ring-white/70 rotate-12 animate-float" />
      <Flag id="FRA" className="absolute left-8 bottom-2 w-11 h-7 rounded-lg shadow-card ring-2 ring-white/70 rotate-6 animate-float" />
      <Flag id="ESP" className="absolute right-8 bottom-3 w-11 h-7 rounded-lg shadow-card ring-2 ring-white/70 -rotate-6 animate-float" />
      <Flag id="GER" className="absolute left-1/2 -translate-x-1/2 top-0 w-10 h-6 rounded-md shadow-card ring-2 ring-white/70 animate-float" />
    </div>
  );
}

// ── Slide 2 illustration: a mini sticker grid ───────────────────────────────
function StickerGridArt() {
  const cards: { id: string; status: 'missing' | 'have' | 'repeated'; n: number }[] = [
    { id: 'BRA', status: 'have', n: 41 },
    { id: 'ARG', status: 'repeated', n: 54 },
    { id: 'FRA', status: 'missing', n: 67 },
    { id: 'POR', status: 'have', n: 93 },
    { id: 'ESP', status: 'missing', n: 75 },
    { id: 'ITA', status: 'repeated', n: 86 },
  ];
  const bg: Record<string, string> = {
    missing: 'bg-white border-gray-200',
    have: 'bg-emerald-50 border-emerald-300',
    repeated: 'bg-amber-50 border-amber-300',
  };
  return (
    <div className="h-44 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-2.5 p-3 bg-gray-100 rounded-2xl shadow-card">
        {cards.map((c) => (
          <div
            key={c.n}
            className={`relative w-16 h-[72px] rounded-xl border-2 ${bg[c.status]} flex flex-col items-center justify-center gap-1 overflow-hidden`}
          >
            <span className="absolute top-1 left-1.5 text-[8px] font-bold text-gray-400 tabular-nums">#{c.n}</span>
            <Flag id={c.id} className="w-8 h-5 rounded shadow-sm" />
            {c.status === 'have' && (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-600">
                <CheckIcon className="w-2 h-2" /> tenho
              </span>
            )}
            {c.status === 'repeated' && (
              <span className="bg-amber-500 text-white text-[8px] font-bold rounded-full px-1.5 leading-tight">2×</span>
            )}
            {c.status === 'missing' && (
              <span className="text-[8px] font-semibold text-gray-300">tocar</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 3 illustration: progress ring + section bars ──────────────────────
function ProgressArt() {
  const pct = 68;
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="h-44 flex items-center justify-center gap-5">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
          <circle
            cx="50" cy="50" r={r} fill="none" stroke="#f4b400" strokeWidth="9"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-extrabold text-2xl text-gray-900 tabular-nums">{pct}%</span>
          <span className="text-[9px] font-semibold text-gray-400">completo</span>
        </div>
      </div>
      <div className="space-y-2.5 w-32">
        {[{ id: 'BRA', p: 92 }, { id: 'ARG', p: 70 }, { id: 'FRA', p: 46 }].map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <Flag id={s.id} className="w-6 h-4 rounded shadow-sm flex-shrink-0" />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-copa-green rounded-full" style={{ width: `${s.p}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 4 illustration: a mini trade card ─────────────────────────────────
function TradeArt() {
  return (
    <div className="h-44 flex items-center justify-center">
      <div className="w-60 bg-white rounded-2xl shadow-card-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
            <GiveIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-800">Você dá</span>
          <span className="ml-auto flex items-center gap-1">
            <Flag id="BRA" className="w-5 h-3.5 rounded-sm shadow-sm" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1">#41</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1">#45</span>
          </span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center">
            <ReceiveIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-gray-800">Você recebe</span>
          <span className="ml-auto flex items-center gap-1">
            <Flag id="ARG" className="w-5 h-3.5 rounded-sm shadow-sm" />
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded px-1">#50</span>
          </span>
        </div>
        <div className="rounded-xl bg-gray-900 text-center py-1.5">
          <span className="text-[10px] font-bold text-emerald-300">✓ Troca equilibrada</span>
        </div>
      </div>
    </div>
  );
}

interface Slide {
  art: () => JSX.Element;
  /** optional real screenshot; shown over the mockup once it loads */
  image?: string;
  badge: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    art: HeroArt,
    image: '/onboarding/hero.png',
    badge: 'FIFA World Cup 2026',
    title: 'Seu álbum da Copa, no bolso',
    text: 'Todas as 48 seleções e seus jogadores num só lugar. Organize, acompanhe e troque — de graça e sem complicação.',
  },
  {
    art: StickerGridArt,
    image: '/onboarding/collect.png',
    badge: 'Colecione',
    title: 'Marque com um toque',
    text: 'Toque numa figurinha para alternar entre faltando, tenho e repetida. As cores e a bandeira de cada seleção deixam tudo fácil de achar.',
  },
  {
    art: ProgressArt,
    image: '/onboarding/progress.png',
    badge: 'Acompanhe',
    title: 'Veja o quanto falta',
    text: 'Acompanhe sua completude geral e por seleção. Saiba na hora quais figurinhas ainda faltam para fechar o álbum.',
  },
  {
    art: TradeArt,
    image: '/onboarding/trade.png',
    badge: 'Troque',
    title: 'Troque com os amigos',
    text: 'Compartilhe seu link. Ao abrir o de um amigo, o app mostra na hora o que vale trocar — agrupado por seleção.',
  },
];

// Shows the real screenshot when it successfully loads, otherwise keeps the
// in-app mockup (no flicker, no broken-image icon if the file is absent).
function SlideArt({ slide }: { slide: Slide }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-44">
      <div className={loaded ? 'invisible' : ''}>
        <slide.art />
      </div>
      {slide.image && (
        <img
          src={slide.image}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-contain ${loaded ? '' : 'hidden'}`}
        />
      )}
    </div>
  );
}

export function LandingPage({ onClose, firstTime }: Props) {
  const [i, setI] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const last = SLIDES.length - 1;

  const go = (n: number) => setI(Math.max(0, Math.min(last, n)));

  function onTouchEnd(endX: number) {
    if (touchX === null) return;
    const dx = endX - touchX;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    setTouchX(null);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4 animate-bounce-in">
      <div className="bg-white w-full max-w-md sm:rounded-[28px] overflow-hidden flex flex-col max-h-full shadow-card-lg">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="font-display font-extrabold text-copa-navy tracking-tight">Copa 2026</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {i === last ? <CloseIcon className="w-4 h-4" /> : 'Pular'}
          </button>
        </div>

        {/* Slides track */}
        <div
          className="flex-1 overflow-hidden"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SLIDES.map((s) => (
              <div key={s.title} className="w-full flex-shrink-0 px-7 pt-3 pb-2 flex flex-col">
                <div
                  className="rounded-3xl mb-5 py-2"
                  style={{ background: 'radial-gradient(120% 100% at 50% 0%, #eef4ff 0%, #ffffff 70%)' }}
                >
                  <SlideArt slide={s} />
                </div>
                <span className="self-start text-[11px] font-bold uppercase tracking-wider text-copa-blue bg-copa-blue/10 px-2.5 py-1 rounded-full mb-2.5">
                  {s.badge}
                </span>
                <h1 className="font-display font-extrabold text-2xl leading-tight text-gray-900 tracking-tight">
                  {s.title}
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mt-2">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dots + CTA */}
        <div className="px-7 pt-3 pb-6">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? 'w-6 bg-copa-blue' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => (i === last ? onClose() : go(i + 1))}
            className="w-full py-3.5 rounded-2xl bg-copa-blue text-white font-bold text-sm shadow-card hover:brightness-110 active:scale-95 transition-all"
          >
            {i === last ? (firstTime ? 'Começar a colecionar' : 'Entendi!') : 'Próximo'}
          </button>
          <p className="text-gray-400 text-[10px] text-center leading-relaxed mt-3">
            App não oficial, feito por fãs. Sem vínculo com a FIFA ou a Panini.
          </p>
        </div>
      </div>
    </div>
  );
}
