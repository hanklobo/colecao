import { TOTAL_STICKERS } from '../data/album2026';

interface Props {
  have: number;
  duplicates: number;
}

export function ProgressBar({ have, duplicates }: Props) {
  const pct = (have / TOTAL_STICKERS) * 100;
  const missing = TOTAL_STICKERS - have;

  return (
    <div className="px-4 pb-3 pt-0.5">
      {/* Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #C9A84C, #e8c86a)',
          }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[10px]">
        <span className="text-white/50 font-medium">
          <span className="text-white font-bold text-xs">{have}</span>
          <span className="text-white/30"> / {TOTAL_STICKERS}</span>
        </span>
        <span className="text-white/20">·</span>
        <span className="text-white/50">
          Faltam <span className="text-white/80 font-semibold">{missing}</span>
        </span>
        <span className="text-white/20">·</span>
        <span className="text-white/50">
          Repetidas <span className="text-copa-gold font-semibold">{duplicates}</span>
        </span>
      </div>
    </div>
  );
}
