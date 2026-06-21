import type { StickerState } from '../types';

interface Props {
  id: number;
  name: string;
  flagUrl: string | null;
  stickerState: StickerState;
  onPress: () => void;
  onReset: () => void;
}

const CARD_BG: Record<string, string> = {
  missing: 'bg-white border-gray-200 text-gray-400',
  have: 'bg-emerald-50 border-emerald-400 text-emerald-900',
  repeated: 'bg-amber-50 border-amber-400 text-amber-900',
};

export function StickerCard({ id, name, flagUrl, stickerState, onPress, onReset }: Props) {
  const { status, count } = stickerState;
  const marked = status !== 'missing';

  return (
    <div className="relative">
      <button
        onClick={onPress}
        className={`relative w-full rounded-xl border-2 overflow-hidden active:scale-95 transition-transform select-none ${CARD_BG[status]}`}
        aria-label={`Figurinha ${id}: ${name}`}
        style={{ minHeight: 88 }}
      >
        {/* Flag wash background on marked cards */}
        {marked && flagUrl && (
          <img
            src={flagUrl}
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] pointer-events-none"
          />
        )}

        <div className="relative flex flex-col items-center gap-1 px-1.5 py-2">
          {/* Sticker number */}
          <span className="self-start text-[9px] font-bold opacity-50 leading-none">
            #{id}
          </span>

          {/* Flag thumbnail or placeholder */}
          <div className="w-10 h-6 rounded overflow-hidden shadow-sm flex items-center justify-center bg-gray-100">
            {flagUrl ? (
              <img
                src={flagUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-base leading-none opacity-40">⚽</span>
            )}
          </div>

          {/* Name */}
          <span className="text-[9px] font-semibold text-center leading-tight line-clamp-2 px-0.5">
            {name}
          </span>

          {/* Status indicator */}
          {status === 'have' && (
            <span className="text-[10px] font-bold text-emerald-600">✓ tenho</span>
          )}
          {status === 'repeated' && (
            <span className="bg-amber-500 text-white text-[9px] font-bold rounded-full px-2 py-0.5 leading-none">
              {count}×
            </span>
          )}
        </div>
      </button>

      {/* Reset button — removes the sticker mark */}
      {marked && (
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-gray-400 hover:bg-red-500 active:bg-red-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md transition-colors leading-none"
          aria-label="Remover marcação"
        >
          ×
        </button>
      )}
    </div>
  );
}
