import { TOTAL_STICKERS } from '../data/album2026';

interface Props {
  have: number;
}

export function ProgressBar({ have }: Props) {
  const pct = Math.round((have / TOTAL_STICKERS) * 100);
  return (
    <div className="px-4 py-3 bg-copa-green text-white">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">Progresso do álbum</span>
        <span>
          {have}/{TOTAL_STICKERS} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-copa-gold rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
