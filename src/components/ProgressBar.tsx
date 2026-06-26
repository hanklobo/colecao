import { TOTAL_STICKERS } from '../data/album2026';
import { formatRelative } from '../utils/time';
import { displayPct } from '../utils/percent';

interface Props {
  have: number;
  duplicates: number;
  lastSyncedAt?: number | null;
  showSync?: boolean;
}

export function ProgressBar({ have, duplicates, lastSyncedAt, showSync }: Props) {
  const pct = (have / TOTAL_STICKERS) * 100;
  const missing = TOTAL_STICKERS - have;

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex justify-between text-xs text-white/80 mb-1.5">
        <span>
          <span className="font-bold text-white text-sm">{have}</span> / {TOTAL_STICKERS} figurinhas
        </span>
        <span className="font-semibold text-copa-gold">{displayPct(have, TOTAL_STICKERS)}%</span>
      </div>
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-copa-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-white/60">
        <div className="flex gap-4">
          <span>Faltam <span className="text-white/90 font-semibold">{missing}</span></span>
          <span>Repetidas <span className="text-white/90 font-semibold">{duplicates}</span></span>
        </div>
        {showSync && (
          <span className="text-white/45 tabular-nums">
            Sincronizado {formatRelative(lastSyncedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
