type Filter = 'all' | 'missing' | 'repeated';

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  missingCount: number;
  repeatedCount: number;
}

const FILTERS: { value: Filter; label: string; activeBg: string; activeBadge: string }[] = [
  { value: 'all',      label: 'Todas',     activeBg: '#1B5E35', activeBadge: 'rgba(255,255,255,0.25)' },
  { value: 'missing',  label: 'Faltam',    activeBg: '#dc2626', activeBadge: 'rgba(255,255,255,0.25)' },
  { value: 'repeated', label: 'Repetidas', activeBg: '#d97706', activeBadge: 'rgba(255,255,255,0.25)' },
];

export function FilterBar({ active, onChange, missingCount, repeatedCount }: Props) {
  return (
    <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
      {FILTERS.map(({ value, label, activeBg, activeBadge }) => {
        const badge =
          value === 'missing'  ? missingCount  :
          value === 'repeated' ? repeatedCount : null;
        const isActive = active === value;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all"
            style={isActive
              ? { background: activeBg, color: '#fff' }
              : { background: '#f3f4f6', color: '#6b7280' }
            }
          >
            {label}
            {badge !== null && badge > 0 && (
              <span
                className="text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none"
                style={isActive
                  ? { background: activeBadge, color: '#fff' }
                  : { background: '#e5e7eb', color: '#6b7280' }
                }
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
