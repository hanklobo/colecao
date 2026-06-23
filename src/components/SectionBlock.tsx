import type { Section, AlbumState } from '../types';
import { StickerCard } from './StickerCard';
import { getFlagUrl } from '../utils/flags';
import { getTeamColor } from '../utils/teamColors';
import { ChevronDown } from './Icons';

interface Props {
  section: Section;
  state: AlbumState;
  onCycle: (id: number) => void;
  onReset: (id: number) => void;
  filter: 'all' | 'missing' | 'repeated';
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SectionBlock({ section, state, onCycle, onReset, filter, isCollapsed, onToggle }: Props) {
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
  const flagBgUrl = section.flagCode ? getFlagUrl(section.flagCode, 160) : null;
  const color = getTeamColor(section.id);

  return (
    <div id={`section-${section.id}`} className="mb-1.5">
      {/* Section header — themed with the selection's identity colors */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-white sticky top-0 z-30 shadow-card"
        style={{
          backgroundImage: `linear-gradient(100deg, ${color.from} 0%, ${color.to} 100%)`,
        }}
      >
        {/* Flag */}
        <div className="w-12 h-8 rounded-md overflow-hidden shadow-md ring-1 ring-white/30 flex-shrink-0 bg-white/10">
          {flagUrl ? (
            <img src={flagUrl} alt={section.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xl">
              {section.flag ?? '⚽'}
            </span>
          )}
        </div>

        {/* Name + group */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-display font-extrabold text-[15px] leading-tight truncate drop-shadow-sm">
            {section.name}
          </p>
          {section.group && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 leading-none mt-1">
              Grupo {section.group}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold text-white tabular-nums">{haveCount}/{total}</p>
          <div className="w-14 h-1.5 bg-black/25 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-white/80 ml-0.5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
        />
      </button>

      {/* Sticker grid — the flag washes the body at high transparency */}
      {!isCollapsed && (
        <div className="relative bg-white">
          {flagBgUrl && (
            <div
              aria-hidden
              className="absolute inset-0 bg-center bg-cover opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: `url(${flagBgUrl})` }}
            />
          )}
          <div className="relative grid grid-cols-3 gap-3 px-4 pt-3 pb-4">
            {visibleStickers.map((st) => (
              <StickerCard
                key={st.id}
                id={st.id}
                name={st.name}
                flagUrl={flagUrl}
                special={st.special}
                stickerState={state[st.id] ?? { status: 'missing', count: 0 }}
                onPress={() => onCycle(st.id)}
                onReset={() => onReset(st.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
