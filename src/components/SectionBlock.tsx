import { useState } from 'react';
import type { Section, AlbumState } from '../types';
import { StickerCard } from './StickerCard';
import { getFlagUrl } from '../utils/flags';

interface Props {
  section: Section;
  state: AlbumState;
  onCycle: (id: number) => void;
  onReset: (id: number) => void;
  filter: 'all' | 'missing' | 'repeated';
}

export function SectionBlock({ section, state, onCycle, onReset, filter }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const visibleStickers = section.stickers.filter((st) => {
    if (filter === 'all') return true;
    const s = state[st.id];
    if (filter === 'missing') return !s || s.status === 'missing';
    if (filter === 'repeated') return s?.status === 'repeated';
    return true;
  });

  if (visibleStickers.length === 0) return null;

  const haveCount = section.stickers.filter((st) => {
    const s = state[st.id];
    return s && s.status !== 'missing';
  }).length;
  const total = section.stickers.length;
  const pct = Math.round((haveCount / total) * 100);

  const flagUrl = section.flagCode ? getFlagUrl(section.flagCode, 80) : null;

  return (
    <div id={`section-${section.id}`} className="mb-2">
      {/* Section header — tap to collapse */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 text-white sticky top-[148px] z-10"
      >
        {/* Flag image */}
        <div className="w-12 h-8 rounded overflow-hidden shadow flex-shrink-0 bg-gray-700">
          {flagUrl ? (
            <img src={flagUrl} alt={section.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xl">
              {section.flag ?? '⚽'}
            </span>
          )}
        </div>

        {/* Name + group */}
        <div className="flex-1 text-left">
          <p className="font-bold text-sm leading-tight">{section.name}</p>
          {section.group && (
            <p className="text-[10px] text-white/60 leading-none mt-0.5">
              Grupo {section.group}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-white/90">
            {haveCount}/{total}
          </p>
          <div className="w-14 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-copa-gold rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Collapse chevron */}
        <span
          className={`text-white/50 text-lg ml-1 transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`}
        >
          ⌄
        </span>
      </button>

      {/* Sticker grid */}
      {!collapsed && (
        <div className="grid grid-cols-3 gap-3 px-4 pt-3 pb-4 bg-white">
          {visibleStickers.map((st) => (
            <StickerCard
              key={st.id}
              id={st.id}
              name={st.name}
              flagUrl={flagUrl}
              stickerState={state[st.id] ?? { status: 'missing', count: 0 }}
              onPress={() => onCycle(st.id)}
              onReset={() => onReset(st.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
