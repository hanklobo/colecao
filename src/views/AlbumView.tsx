import { useState } from 'react';
import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS } from '../data/album2026';
import { SectionBlock } from '../components/SectionBlock';
import { FilterBar } from '../components/FilterBar';

type Filter = 'all' | 'missing' | 'repeated';

interface Props {
  state: AlbumState;
  onCycle: (id: number) => void;
}

export function AlbumView({ state, onCycle }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  let missingCount = 0;
  let repeatedCount = 0;
  for (let i = 1; i <= TOTAL_STICKERS; i++) {
    const s = state[i];
    if (!s || s.status === 'missing') missingCount++;
    else if (s.status === 'repeated') repeatedCount++;
  }

  const lowerSearch = search.toLowerCase();
  const filteredSections = SECTIONS.map((sec) => ({
    ...sec,
    stickers: sec.stickers.filter(
      (st) =>
        !lowerSearch ||
        sec.name.toLowerCase().includes(lowerSearch) ||
        st.name.toLowerCase().includes(lowerSearch) ||
        String(st.id).includes(lowerSearch),
    ),
  })).filter((s) => s.stickers.length > 0);

  return (
    <div>
      <div className="sticky top-14 z-20 bg-white shadow-sm">
        <div className="px-4 py-2 border-b border-gray-200">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar seleção ou figurinha..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-copa-green"
          />
        </div>
        <FilterBar
          active={filter}
          onChange={setFilter}
          missingCount={missingCount}
          repeatedCount={repeatedCount}
        />
      </div>

      <div className="pb-20">
        {filteredSections.map((sec) => (
          <SectionBlock
            key={sec.id}
            section={sec}
            state={state}
            onCycle={onCycle}
            filter={filter}
          />
        ))}
        {filteredSections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm">Nenhuma figurinha encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
