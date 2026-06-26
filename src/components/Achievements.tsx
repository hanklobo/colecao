import { useState } from 'react';
import type { Achievement } from '../utils/achievements';
import { displayPct } from '../utils/percent';
import { CloseIcon, CheckIcon } from './Icons';

const SHIELD_PATH = 'M50 4 L92 18 V54 C92 82 73 99 50 106 C27 99 8 82 8 54 V18 Z';
const SHIELD_INNER = 'M50 14 L84 26 V53 C84 77 68 92 50 99 C32 92 16 77 16 53 V26 Z';

function Shield({ a, size }: { a: Achievement; size: number }) {
  const earned = a.earned;
  const uid = `sh-${a.id}`;

  return (
    <div
      style={{
        width: size,
        height: Math.round(size * 1.12),
        position: 'relative',
        flexShrink: 0,
        filter: earned
          ? 'drop-shadow(0 0 9px rgba(245,158,11,0.70)) drop-shadow(0 3px 6px rgba(120,53,15,0.35))'
          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.13))',
      }}
    >
      <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
        <defs>
          {/* Main fill gradient */}
          <linearGradient id={`fill-${uid}`} x1="0.25" y1="0" x2="0.75" y2="1">
            {earned ? (
              <>
                <stop offset="0%"   stopColor="#fff8c4" />
                <stop offset="42%"  stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </>
            ) : (
              <>
                <stop offset="0%"   stopColor="#e8edf2" />
                <stop offset="100%" stopColor="#8fa0b4" />
              </>
            )}
          </linearGradient>

          {/* Stroke / rim gradient */}
          <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
            {earned ? (
              <>
                <stop offset="0%"   stopColor="#fde68a" />
                <stop offset="100%" stopColor="#92400e" />
              </>
            ) : (
              <>
                <stop offset="0%"   stopColor="#c8d3df" />
                <stop offset="100%" stopColor="#64748b" />
              </>
            )}
          </linearGradient>

          {/* Diagonal shine (earned only) */}
          <linearGradient id={`shine-${uid}`} x1="0.05" y1="0" x2="0.55" y2="0.75">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.62)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Shield body */}
        <path
          d={SHIELD_PATH}
          fill={`url(#fill-${uid})`}
          stroke={`url(#rim-${uid})`}
          strokeWidth="3.5"
        />

        {/* Shine overlay (earned) */}
        {earned && (
          <path d={SHIELD_PATH} fill={`url(#shine-${uid})`} />
        )}

        {/* Inner border detail */}
        <path
          d={SHIELD_INNER}
          fill="none"
          stroke={earned ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.55)'}
          strokeWidth="1.4"
        />

        {/* Sparkle dots (earned) */}
        {earned && (
          <>
            <circle cx="88" cy="12" r="2.6" fill="#fef08a" opacity="0.95" />
            <circle cx="81" cy="6"  r="1.5" fill="#fffde7" opacity="0.85" />
            <circle cx="94" cy="21" r="1.8" fill="#fef08a" opacity="0.80" />
          </>
        )}
      </svg>

      {/* Emoji */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '9%',
          filter: earned ? 'none' : 'grayscale(1)',
          opacity: earned ? 1 : 0.30,
        }}
      >
        <span style={{ fontSize: size * 0.38 }} aria-hidden>{a.icon}</span>
      </div>

      {/* Lock badge (unearned) */}
      {!earned && (
        <div
          style={{
            position: 'absolute',
            bottom: size * 0.04,
            right: size * 0.06,
            width: size * 0.30,
            height: size * 0.30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #475569, #1e293b)',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.13,
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
}

function AchievementModal({
  a,
  albumPct,
  onClose,
}: {
  a: Achievement;
  albumPct: number;
  onClose: () => void;
}) {
  const pct = displayPct(a.current, a.target);
  const remaining = Math.max(0, a.target - a.current);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 animate-bounce-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative px-6 pt-7 pb-6 text-center"
          style={{
            background: a.earned
              ? 'radial-gradient(130% 100% at 50% 0%, #fef3c7 0%, #fffbeb 55%, #ffffff 100%)'
              : 'radial-gradient(130% 100% at 50% 0%, #f1f5f9 0%, #ffffff 70%)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/70 hover:bg-gray-100 text-gray-500 flex items-center justify-center shadow-sm"
          >
            <CloseIcon className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-4">
            <Shield a={a} size={108} />
          </div>

          <h3 className="font-display font-extrabold text-gray-900 text-xl leading-tight">{a.title}</h3>
          <p className="text-gray-500 text-sm mt-1.5 leading-snug">{a.desc}</p>

          {a.earned ? (
            <div className="mt-4 inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold text-xs px-3 py-1.5 rounded-full">
              <CheckIcon className="w-3.5 h-3.5" /> Conquista desbloqueada!
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 font-bold text-xs px-3 py-1.5 rounded-full">
              Faltam {remaining}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-2">
            <span>Seu progresso</span>
            <span className="tabular-nums font-bold">{Math.min(a.current, a.target)} / {a.target}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: a.earned
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #d97706, #fbbf24)',
                boxShadow: a.earned ? '0 0 6px rgba(16,185,129,0.45)' : '0 0 6px rgba(245,158,11,0.45)',
              }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Álbum completo</span>
            <span className="text-sm font-display font-extrabold text-copa-blue tabular-nums">{albumPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementsGrid({
  achievements,
  albumPct,
}: {
  achievements: Achievement[];
  albumPct: number;
}) {
  const [selected, setSelected] = useState<Achievement | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        {achievements.map((a) => {
          const pct = displayPct(a.current, a.target);
          return (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl pt-3 pb-2 px-1 active:scale-95 transition-transform overflow-hidden relative ${
                a.earned
                  ? 'bg-gradient-to-b from-amber-50 to-yellow-50/60 border border-amber-200/70 shadow-sm'
                  : 'bg-white border border-gray-100 shadow-sm'
              }`}
            >
              <Shield a={a} size={62} />

              <span
                className={`text-[10px] font-bold text-center leading-tight px-0.5 ${
                  a.earned ? 'text-amber-900' : 'text-gray-400'
                }`}
              >
                {a.title}
              </span>

              {a.earned ? (
                <span className="text-[9px] font-extrabold text-emerald-600 leading-none flex items-center gap-0.5">
                  <CheckIcon className="w-2.5 h-2.5" /> desbloqueada
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-gray-400 leading-none tabular-nums">
                  {pct}%
                </span>
              )}

              {/* Progress strip at bottom of card */}
              {!a.earned && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                  <div
                    className="h-full bg-amber-400 rounded-r-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <AchievementModal a={selected} albumPct={albumPct} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
