type Filter = 'all' | 'missing' | 'repeated';

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  missingCount: number;
  repeatedCount: number;
}

const FILTERS: { value: Filter; label: string; activeColor: string }[] = [
  { value: 'all',      label: 'Todas',      activeColor: 'bg-copa-ink text-white shadow-card' },
  { value: 'missing',  label: 'Faltam',     activeColor: 'bg-red-500 text-white shadow-card' },
  { value: 'repeated', label: 'Repetidas',  activeColor: 'bg-amber-500 text-white shadow-card' },
];

export function FilterBar({ active, onChange, missingCount, repeatedCount }: Props) {
  return (
    <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
      {FILTERS.map(({ value, label, activeColor }) => {
        const badge =
          value === 'missing' ? missingCount :
          value === 'repeated' ? repeatedCount : null;
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              isActive ? activeColor : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {badge !== null && badge > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-none tabular-nums ${
                  isActive ? 'bg-white/25 text-white' : 'bg-white text-gray-500'
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
