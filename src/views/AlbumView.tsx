import { useState, useCallback, useMemo } from 'react';
import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS } from '../data/album2026';
import { SectionBlock } from '../components/SectionBlock';
import { FilterBar } from '../components/FilterBar';
import { SearchIcon, FilterIcon, ChevronDown } from '../components/Icons';

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
  const [showFilters, setShowFilters] = useState(true);

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
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-card">

        {/* Search + filters toggle */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar seleção ou figurinha..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-white font-medium placeholder:text-gray-400 focus:outline-none focus:border-copa-blue focus:ring-2 focus:ring-copa-blue/15 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-pressed={showFilters}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex-shrink-0 ${
              showFilters
                ? 'bg-copa-ink text-white shadow-card'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
            title={showFilters ? 'Ocultar filtros' : 'Exibir filtros'}
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Filtros</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

        {/* Collapsible filter region: group jump + status filters */}
        {showFilters && (
          <div className="animate-slide-down">
            {/* Group quick-jump */}
            {!search && (
              <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-t border-gray-100 scrollbar-hide">
                {GROUPS.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGroupClick(g)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-colors ${
                      activeGroup === g
                        ? 'bg-copa-blue text-white shadow-card'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {GROUP_LABELS[g]}
                  </button>
                ))}
              </div>
            )}

            {/* Filter bar + collapse-all toggle */}
            <div className="flex items-center border-t border-gray-100">
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
                className="flex-shrink-0 px-3 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-l border-gray-100 transition-colors bg-white h-full flex items-center gap-1"
                title={areAllCollapsed ? 'Expandir tudo' : 'Recolher tudo'}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${areAllCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                <span className="hidden sm:inline">{areAllCollapsed ? 'Expandir' : 'Recolher'}</span>
              </button>
            </div>
          </div>
        )}
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
            <SearchIcon className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-semibold">Nenhuma figurinha encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
