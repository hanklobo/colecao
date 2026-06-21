import type { StickerState } from '../types';

interface Props {
  id: number;
  name: string;
  stickerState: StickerState;
  onPress: () => void;
}

const STATUS_CLASSES: Record<string, string> = {
  missing: 'bg-gray-100 border-gray-200 text-gray-400',
  have: 'bg-green-100 border-green-400 text-green-800',
  repeated: 'bg-amber-100 border-amber-400 text-amber-800',
};

const STATUS_ICON: Record<string, string> = {
  missing: '',
  have: '✓',
  repeated: '',
};

export function StickerCard({ id, name, stickerState, onPress }: Props) {
  const { status, count } = stickerState;
  const cls = STATUS_CLASSES[status];

  return (
    <button
      onClick={onPress}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition-all active:scale-95 select-none ${cls}`}
      style={{ minHeight: '72px' }}
      aria-label={`Figurinha ${id}: ${name} - ${status}`}
    >
      <span className="text-xs font-bold leading-none opacity-70">#{id}</span>
      <span className="mt-1 text-[11px] leading-tight font-medium line-clamp-2">
        {name}
      </span>
      {status === 'have' && (
        <span className="absolute top-1 right-1 text-green-600 text-sm font-bold">
          {STATUS_ICON.have}
        </span>
      )}
      {status === 'repeated' && (
        <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {count}
        </span>
      )}
    </button>
  );
}
