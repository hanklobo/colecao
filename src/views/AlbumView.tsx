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

// Filter funnel icon
function IconFilter() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
  );
}

// Collapse icon
function IconChevrons({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
    </svg>
  );
}

export function AlbumView({ state, onCycle, onReset }: Props) {
  const [filter, setFilter]       = useState<Filter>('all');
  const [search, setSearch]       = useState('');
  const [activeGroup, setActiveGroup] = useState('INTRO');
  const [showFilters, setShowFilters] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const allSectionIds = SECTIONS.map((s) => s.id);
  const areAllCollapsed = allSectionIds.every((id) => collapsed[id]);

  const toggleSection = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const collapseAll = () =>
    setCollapsed(Object.fromEntries(allSectionIds.map((id) => [id, true])));
  const expandAll = () => setCollapsed({});

  const counts = useMemo(() => {
    let missing = 0, repeated = 0;
    for (let i = 1; i <= TOTAL_STICKERS; i++) {
      const s = state[i];
      if (!s || s.status === 'missing') missing++;
      else if (s.status === 'repeated') repeated++;
    }
    return { missing, repeated };
  }, [state]);

  const activeFilterCount = filter !== 'all' ? 1 : 0;

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

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200/60">

        {/* Search row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar seleção ou figurinha..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-copa-green focus:bg-white transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
              showFilters
                ? 'bg-copa-green text-white'
                : activeFilterCount > 0
                  ? 'bg-copa-green/10 text-copa-green border border-copa-green/30'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <IconFilter />
            {activeFilterCount > 0 && !showFilters && (
              <span className="bg-copa-gold text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible filters */}
        {showFilters && !search && (
          <>
            {/* Group quick-jump */}
            <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-hide">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGroupClick(g)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                    activeGroup === g
                      ? 'bg-copa-navy text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {GROUP_LABELS[g]}
                </button>
              ))}
            </div>

            {/* Filter pills + collapse-all */}
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
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-[11px] font-semibold text-gray-500 hover:text-gray-800 border-l border-gray-100 h-full transition-colors bg-white"
                title={areAllCollapsed ? 'Expandir tudo' : 'Recolher tudo'}
              >
                <IconChevrons collapsed={areAllCollapsed} />
                <span className="hidden xs:inline">{areAllCollapsed ? 'Expandir' : 'Recolher'}</span>
              </button>
            </div>
          </>
        )}

        {/* Filter pills when search is active */}
        {showFilters && search && (
          <div className="border-t border-gray-100 flex items-center">
            <div className="flex-1">
              <FilterBar
                active={filter}
                onChange={setFilter}
                missingCount={counts.missing}
                repeatedCount={counts.repeated}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sections ── */}
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
            <svg className="w-12 h-12 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <p className="text-sm font-semibold">Nenhuma figurinha encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
