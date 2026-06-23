import { useState } from 'react';
import type { Achievement } from '../utils/achievements';
import { CloseIcon, CheckIcon } from './Icons';

const SHIELD_PATH =
  'M50 4 L92 18 V54 C92 82 73 99 50 106 C27 99 8 82 8 54 V18 Z';

function Shield({ a, size }: { a: Achievement; size: number }) {
  const earned = a.earned;
  const gid = `shield-${a.id}`;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size * 1.1 }}>
      <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-sm">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            {earned ? (
              <>
                <stop offset="0" stopColor="#f8d34d" />
                <stop offset="1" stopColor="#d97706" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#eef0f3" />
                <stop offset="1" stopColor="#d7dbe0" />
              </>
            )}
          </linearGradient>
        </defs>
        <path
          d={SHIELD_PATH}
          fill={`url(#${gid})`}
          stroke={earned ? '#b45309' : '#c4c9d0'}
          strokeWidth="3"
        />
        {earned && (
          <path d="M50 8 L88 21 V53" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
        )}
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center ${earned ? '' : 'grayscale opacity-50'}`}
        style={{ fontSize: size * 0.4, paddingBottom: size * 0.08 }}
      >
        {a.icon}
      </span>
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
  const pct = Math.min(100, Math.round((a.current / a.target) * 100));
  const remaining = Math.max(0, a.target - a.current);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 animate-bounce-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-6 pb-5 text-center" style={{ background: 'radial-gradient(120% 90% at 50% 0%, #fff7e6 0%, #ffffff 70%)' }}>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
          <div className="flex justify-center mb-3">
            <Shield a={a} size={96} />
          </div>
          <h3 className="font-display font-extrabold text-gray-900 text-lg leading-tight">{a.title}</h3>
          <p className="text-gray-500 text-sm mt-1 leading-snug">{a.desc}</p>

          {a.earned ? (
            <div className="mt-3 inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 font-bold text-xs px-3 py-1.5 rounded-full">
              <CheckIcon className="w-3.5 h-3.5" /> Conquista desbloqueada!
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 font-bold text-xs px-3 py-1.5 rounded-full">
              Faltam {remaining}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Progress toward this achievement */}
          <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
            <span>Seu progresso</span>
            <span className="tabular-nums">{Math.min(a.current, a.target)} / {a.target}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${a.earned ? 'bg-emerald-500' : 'bg-copa-gold'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Overall album evolution */}
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
      <div className="grid grid-cols-3 gap-x-3 gap-y-4">
        {achievements.map((a) => {
          const pct = Math.min(100, Math.round((a.current / a.target) * 100));
          return (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Shield a={a} size={66} />
              <span className={`text-[10px] font-bold text-center leading-tight ${a.earned ? 'text-gray-800' : 'text-gray-400'}`}>
                {a.title}
              </span>
              {a.earned ? (
                <span className="text-[9px] font-bold text-emerald-600 leading-none">✓</span>
              ) : (
                <span className="text-[9px] font-semibold text-gray-400 leading-none tabular-nums">{pct}%</span>
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
