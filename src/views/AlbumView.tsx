import { useState, useCallback, useMemo } from 'react';
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

const GROUPS = ['INTRO', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'EST'];
const GROUP_LABELS: Record<string, string> = {
  INTRO: '★', EST: '🏟',
  A:'A', B:'B', C:'C', D:'D', E:'E', F:'F',
  G:'G', H:'H', I:'I', J:'J', K:'K', L:'L',
};

function scrollToGroup(groupId: string) {
  const targetId =
    groupId === 'INTRO' ? 'INTRO' :
    groupId === 'EST'   ? 'EST'   :
    SECTIONS.find((s) => s.group === groupId)?.id;
  if (!targetId) return;
  document.getElementById(`section-${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function AlbumView({ state, onCycle, onReset }: Props) {
  const [filter, setFilter]   = useState<Filter>('all');
  const [search, setSearch]   = useState('');
  const [activeGroup, setActiveGroup] = useState('INTRO');

  // Collapsed state for all sections, keyed by section id
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const allSectionIds = SECTIONS.map((s) => s.id);
  const areAllCollapsed = allSectionIds.every((id) => collapsed[id]);

  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  function collapseAll() {
    setCollapsed(Object.fromEntries(allSectionIds.map((id) => [id, true])));
  }

  function expandAll() {
    setCollapsed({});
  }

  const counts = useMemo(() => {
    let missing = 0, repeated = 0;
    for (let i = 1; i <= TOTAL_STICKERS; i++) {
      const s = state[i];
      if (!s || s.status === 'missing') missing++;
      else if (s.status === 'repeated') repeated++;
    }
    return { missing, repeated };
  }, [state]);

  const lowerSearch = search.toLowerCase();
  const filteredSections = useMemo(() =>
    SECTIONS.map((sec) => ({
      ...sec,
      stickers: sec.stickers.filter(
        (st) =>
          !lowerSearch ||
          sec.name.toLowerCase().includes(lowerSearch) ||
          st.name.toLowerCase().includes(lowerSearch) ||
          String(st.id).includes(lowerSearch),
      ),
    })).filter((s) => s.stickers.length > 0),
  [lowerSearch]);

  function handleGroupClick(g: string) {
    setActiveGroup(g);
    setSearch('');
    setTimeout(() => scrollToGroup(g), 50);
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar (fixed, does not scroll) ── */}
      <div className="flex-shrink-0 bg-white shadow-sm">

        {/* Search */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar seleção ou figurinha..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* Group quick-jump */}
        {!search && (
          <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-gray-100 scrollbar-hide">
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

        {/* Filter bar + collapse-all toggle */}
        <div className="flex items-center border-b border-gray-100">
          <div className="flex-1 overflow-x-hidden">
            <FilterBar
              active={filter}
              onChange={setFilter}
              missingCount={counts.missing}
              repeatedCount={counts.repeated}
            />
          </div>
          <button
            onClick={areAllCollapsed ? expandAll : collapseAll}
            className="flex-shrink-0 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 border-l border-gray-100 transition-colors bg-white h-full flex items-center gap-1"
            title={areAllCollapsed ? 'Expandir tudo' : 'Recolher tudo'}
          >
            <span className={`text-base leading-none transition-transform ${areAllCollapsed ? 'rotate-0' : 'rotate-180'}`}>
              ⌃
            </span>
            <span className="hidden sm:inline">{areAllCollapsed ? 'Expandir' : 'Recolher'}</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable sections ── */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        {filteredSections.length > 0 ? (
          filteredSections.map((sec) => (
            <SectionBlock
              key={sec.id}
              section={sec}
              state={state}
              onCycle={onCycle}
              onReset={onReset}
              filter={filter}
              isCollapsed={!!collapsed[sec.id]}
              onToggle={() => toggleSection(sec.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm font-medium">Nenhuma figurinha encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
