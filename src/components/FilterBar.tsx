type Filter = 'all' | 'missing' | 'repeated';

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
  missingCount: number;
  repeatedCount: number;
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'missing', label: 'Faltam' },
  { value: 'repeated', label: 'Repetidas' },
];

export function FilterBar({ active, onChange, missingCount, repeatedCount }: Props) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-white border-b border-gray-200">
      {FILTERS.map(({ value, label }) => {
        const badge =
          value === 'missing'
            ? missingCount
            : value === 'repeated'
              ? repeatedCount
              : null;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              active === value
                ? 'bg-copa-green text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
            {badge !== null && badge > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  active === value
                    ? 'bg-white text-copa-green'
                    : 'bg-gray-300 text-gray-700'
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
