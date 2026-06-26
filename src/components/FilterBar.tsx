type Filter = 'all' | 'missing' | 'repeated';

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  missingCount: number;
  repeatedCount: number;
}

// Active palette per filter. Soft tinted background + saturated text, so the
// segmented control reads as a refined chip rather than a heavy solid block.
const FILTERS: { value: Filter; label: string; activeBg: string; activeText: string; badgeBg: string }[] = [
  { value: 'all',      label: 'Todas',     activeBg: 'bg-copa-blue',  activeText: 'text-white', badgeBg: 'bg-white/25 text-white' },
  { value: 'missing',  label: 'Faltam',    activeBg: 'bg-rose-500',   activeText: 'text-white', badgeBg: 'bg-white/25 text-white' },
  { value: 'repeated', label: 'Repetidas', activeBg: 'bg-amber-500',  activeText: 'text-white', badgeBg: 'bg-white/25 text-white' },
];

export function FilterBar({ active, onChange, missingCount, repeatedCount }: Props) {
  return (
    <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-hide">
      {FILTERS.map(({ value, label, activeBg, activeText, badgeBg }) => {
        const badge =
          value === 'missing' ? missingCount :
          value === 'repeated' ? repeatedCount : null;
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ring-1 ${
              isActive
                ? `${activeBg} ${activeText} shadow-card ring-transparent`
                : 'bg-white text-gray-600 hover:bg-gray-50 ring-gray-200'
            }`}
          >
            {label}
            {badge !== null && badge > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none tabular-nums ${
                  isActive ? badgeBg : 'bg-gray-100 text-gray-500'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
