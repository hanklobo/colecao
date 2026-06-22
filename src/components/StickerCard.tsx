import type { StickerState } from '../types';

interface Props {
  id: number;
  name: string;
  flagUrl: string | null;
  stickerState: StickerState;
  onPress: () => void;
  onReset: () => void;
}

const CARD_STYLES: Record<string, { border: string; bg: string }> = {
  missing:  { border: '#e5e7eb', bg: '#ffffff' },
  have:     { border: '#34d399', bg: '#f0fdf4' },
  repeated: { border: '#fbbf24', bg: '#fffbeb' },
};

export function StickerCard({ id, name, flagUrl, stickerState, onPress, onReset }: Props) {
  const { status, count } = stickerState;
  const marked = status !== 'missing';
  const style = CARD_STYLES[status];

  return (
    <button
      onClick={onPress}
      className="relative w-full rounded-2xl overflow-hidden active:scale-95 transition-transform select-none text-left"
      style={{
        minHeight: 92,
        border: `2px solid ${style.border}`,
        background: style.bg,
      }}
      aria-label={`Figurinha ${id}: ${name}`}
    >
      {/* Flag wash — only when marked */}
      {marked && flagUrl && (
        <img
          src={flagUrl}
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0.06 }}
        />
      )}

      <div className="relative flex flex-col h-full p-2 gap-1">
        {/* Top row: sticker number + reset × */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] font-black text-gray-400 tracking-wide leading-none">
            #{id}
          </span>
          {marked && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors leading-none"
              style={{ background: 'rgba(0,0,0,0.12)', color: '#6b7280', fontSize: 11, fontWeight: 800 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#ef4444', e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.12)', e.currentTarget.style.color = '#6b7280')}
              aria-label="Remover marcação"
            >
              ×
            </button>
          )}
        </div>

        {/* Flag thumbnail */}
        <div className="flex-1 flex items-center justify-center py-0.5">
          <div className="w-10 h-6 rounded-md overflow-hidden shadow-sm flex items-center justify-center bg-gray-100 flex-shrink-0">
            {flagUrl ? (
              <img src={flagUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-xs leading-none text-gray-300">⚽</span>
            )}
          </div>
        </div>

        {/* Sticker name */}
        <p className={`text-[9px] font-semibold text-center leading-tight line-clamp-2 ${
          marked ? 'text-gray-700' : 'text-gray-400'
        }`}>
          {name}
        </p>

        {/* Status badge */}
        <div className="flex justify-center min-h-[14px]">
          {status === 'have' && (
            <span className="text-[9px] font-black text-emerald-600 leading-none">✓ tenho</span>
          )}
          {status === 'repeated' && (
            <span className="text-[9px] font-black text-white leading-none rounded-full px-1.5 py-0.5"
              style={{ background: '#f59e0b' }}>
              {count}×
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
