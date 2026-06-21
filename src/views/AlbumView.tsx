import { useState, useRef } from 'react';
import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS } from '../data/album2026';
import { SectionBlock } from '../components/SectionBlock';
import { FilterBar } from '../components/FilterBar';

type Filter = 'all' | 'missing' | 'repeated';

interface Props {
  state: AlbumState;
  onCycle: (id: number) => void;
  onReset: (id: number) => void;
}

// Group quick-jump anchors
const GROUPS = ['INTRO', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'EST'];
const GROUP_LABELS: Record<string, string> = {
  INTRO: '★', EST: '🏟',
  A:'A', B:'B', C:'C', D:'D', E:'E', F:'F',
  G:'G', H:'H', I:'I', J:'J', K:'K', L:'L',
};

function scrollToGroup(groupId: string) {
  const firstSectionInGroup =
    groupId === 'INTRO' ? 'INTRO' :
    groupId === 'EST' ? 'EST' :
    SECTIONS.find((s) => s.group === groupId)?.id;
  if (!firstSectionInGroup) return;
  const el = document.getElementById(`section-${firstSectionInGroup}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function AlbumView({ state, onCycle, onReset }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('INTRO');
  const groupBarRef = useRef<HTMLDivElement>(null);

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

  function handleGroupClick(g: string) {
    setActiveGroup(g);
    setSearch('');
    scrollToGroup(g);
  }

  return (
    <div>
      {/* Sticky toolbar */}
      <div className="sticky top-[104px] z-20 bg-white shadow-sm">
        {/* Search */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar seleção ou figurinha..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* Group quick-jump */}
        {!search && (
          <div
            ref={groupBarRef}
            className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-gray-100 bg-white scrollbar-hide"
          >
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => handleGroupClick(g)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-colors ${
                  activeGroup === g
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {GROUP_LABELS[g]}
              </button>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <FilterBar
          active={filter}
          onChange={setFilter}
          missingCount={missingCount}
          repeatedCount={repeatedCount}
        />
      </div>

      {/* Sticker sections */}
      <div className="pb-20 bg-gray-50">
        {filteredSections.map((sec) => (
          <SectionBlock
            key={sec.id}
            section={sec}
            state={state}
            onCycle={onCycle}
            onReset={onReset}
            filter={filter}
          />
        ))}
        {filteredSections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm font-medium">Nenhuma figurinha encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
