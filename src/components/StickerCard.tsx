import type { StickerState } from '../types';
import { CheckIcon } from './Icons';

interface Props {
  id: number;
  name: string;
  flagUrl: string | null;
  stickerState: StickerState;
  onPress: () => void;
  onReset: () => void;
}

const CARD_BG: Record<string, string> = {
  missing:  'bg-white/80 border-gray-200 backdrop-blur-sm',
  have:     'bg-emerald-50/90 border-emerald-400 backdrop-blur-sm',
  repeated: 'bg-amber-50/90 border-amber-400 backdrop-blur-sm',
};

export function StickerCard({ id, name, flagUrl, stickerState, onPress, onReset }: Props) {
  const { status, count } = stickerState;
  const marked = status !== 'missing';

  return (
    <button
      onClick={onPress}
      className={`relative w-full rounded-xl border-2 overflow-hidden active:scale-95 transition-transform select-none text-left ${CARD_BG[status]}`}
      aria-label={`Figurinha ${id}: ${name}`}
      style={{ minHeight: 88 }}
    >
      {/* Flag wash background */}
      {marked && flagUrl && (
        <img
          src={flagUrl}
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
      )}

      <div className="relative flex flex-col h-full p-2 gap-1">
        {/* Top row: number + reset button (INSIDE card, no overflow) */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-gray-400 leading-none tabular-nums">#{id}</span>
          {marked && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="w-4 h-4 rounded-full bg-gray-400 hover:bg-red-500 active:bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none transition-colors flex-shrink-0"
              aria-label="Remover marcação"
            >
              ×
            </button>
          )}
        </div>

        {/* Flag thumbnail */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-6 rounded overflow-hidden shadow-sm flex items-center justify-center bg-gray-100 flex-shrink-0">
            {flagUrl ? (
              <img src={flagUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-sm leading-none text-gray-300">⚽</span>
            )}
          </div>
        </div>

        {/* Name */}
        <p className={`text-[9px] font-semibold text-center leading-tight line-clamp-2 ${
          marked ? 'text-gray-800' : 'text-gray-400'
        }`}>
          {name}
        </p>

        {/* Status badge */}
        <div className="flex justify-center min-h-[14px] items-center">
          {status === 'have' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
              <CheckIcon className="w-2.5 h-2.5" /> tenho
            </span>
          )}
          {status === 'repeated' && (
            <span className="bg-amber-500 text-white text-[9px] font-bold rounded-full px-2 py-0.5 leading-none tabular-nums">
              {count}×
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
