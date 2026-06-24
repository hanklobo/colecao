import type { StickerState } from '../types';
import { CheckIcon } from './Icons';
import { getTeamColor } from '../utils/teamColors';

interface Props {
  id: number;
  name: string;
  sectionId: string;
  sectionIndex: number;
  special?: boolean;
  stickerState: StickerState;
  onPress: () => void;
  onReset: () => void;
}

export function StickerCard({ id, name, sectionId, sectionIndex, special, stickerState, onPress, onReset }: Props) {
  const { status, count } = stickerState;
  const marked = status !== 'missing';
  const color = getTeamColor(sectionId);

  return (
    <button
      onClick={onPress}
      className={`relative w-full overflow-hidden active:scale-95 transition-transform select-none ${
        status === 'repeated' ? 'ring-2 ring-amber-400' :
        special ? 'ring-2 ring-amber-300/70' : ''
      }`}
      aria-label={`Figurinha ${id}: ${name}${special ? ' (especial)' : ''}`}
      style={{
        aspectRatio: '4 / 5',
        backgroundColor: color.from,
        borderRadius: 6,
        opacity: status === 'missing' ? 0.62 : 1,
      }}
    >
      {/* State overlays */}
      {status === 'have'     && <div className="absolute inset-0 bg-emerald-900/30 pointer-events-none" />}
      {status === 'repeated' && <div className="absolute inset-0 bg-amber-400/20 pointer-events-none" />}

      {/* Large "26" decorative watermark — mimics album placeholder shape */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-8%',
          right: '-8%',
          fontSize: '5.8rem',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.26)',
          lineHeight: 0.80,
          letterSpacing: '-0.04em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        26
      </div>

      {/* Top-left: section code + sticker local index */}
      <div className="absolute top-1.5 left-1.5 leading-none">
        <p style={{
          fontSize: '0.42rem',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.80)',
          letterSpacing: '0.12em',
          lineHeight: 1,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}>
          {sectionId}
        </p>
        <p style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1.05,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}>
          {sectionIndex}
        </p>
      </div>

      {/* Player name — vertical, right side, reading bottom-to-top */}
      <div
        style={{
          position: 'absolute',
          right: 3,
          top: 8,
          bottom: 8,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.40rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.06em',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: '90%',
            textTransform: 'uppercase',
            lineHeight: 1,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          {name}
        </span>
      </div>

      {/* Have: green check badge */}
      {status === 'have' && (
        <div className="absolute bottom-1.5 left-1.5">
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow">
            <CheckIcon className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      )}

      {/* Repeated: prominent amber count badge centred at bottom */}
      {status === 'repeated' && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span
            className="bg-amber-500 text-white font-black rounded-full shadow-md tabular-nums leading-none"
            style={{ fontSize: '0.72rem', paddingTop: 3, paddingBottom: 3, paddingLeft: 7, paddingRight: 7 }}
          >
            {count}×
          </span>
        </div>
      )}

      {/* Reset button — larger touch target (w-7 h-7) with smaller visual circle inside */}
      {marked && (
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="absolute top-0 right-0 w-7 h-7 flex items-center justify-center"
          aria-label="Remover marcação"
        >
          <span className="w-4 h-4 rounded-full bg-white/30 hover:bg-red-500 active:bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none transition-colors pointer-events-none">
            ×
          </span>
        </button>
      )}

      {/* Special: golden corner triangle */}
      {special && (
        <span
          aria-hidden
          className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-l-[16px] border-t-amber-300 border-l-transparent"
        />
      )}
    </button>
  );
}
