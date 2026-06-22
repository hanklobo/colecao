import type { Section, AlbumState } from '../types';
import { StickerCard } from './StickerCard';
import { getFlagUrl } from '../utils/flags';

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
  const flagUrl = section.flagCode ? getFlagUrl(section.flagCode, 160) : null;
  const flagUrlSmall = section.flagCode ? getFlagUrl(section.flagCode, 80) : null;

  return (
    <div id={`section-${section.id}`} className="mb-0.5">
      {/* Section header — sticky, z-30, with blurred flag background */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-white sticky top-0 z-30 overflow-hidden"
        style={{ background: '#0f1923' }}
      >
        {/* Blurred flag background */}
        {flagUrl && (
          <img
            src={flagUrl}
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              filter: 'blur(10px) brightness(0.32) saturate(2)',
              transform: 'scale(1.15)',
            }}
          />
        )}

        {/* Dark scrim for consistency */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.28)' }} />

        {/* Content (above blur layer) */}
        <div className="relative flex items-center gap-3 w-full">
          {/* Flag thumbnail */}
          <div className="w-12 h-8 rounded overflow-hidden shadow-md flex-shrink-0 bg-gray-700">
            {flagUrlSmall ? (
              <img src={flagUrlSmall} alt={section.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-xl">
                {section.flag ?? '⚽'}
              </span>
            )}
          </div>

          {/* Name + group */}
          <div className="flex-1 text-left min-w-0">
            <p className="font-bold text-sm leading-tight truncate tracking-tight">{section.name}</p>
            {section.group && (
              <p className="text-[10px] text-white/50 leading-none mt-0.5 font-medium">Grupo {section.group}</p>
            )}
          </div>

          {/* Progress */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-semibold text-white/90">
              {haveCount}<span className="text-white/40">/{total}</span>
            </p>
            <div className="w-14 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #e8c86a)' }}
              />
            </div>
          </div>

          {/* Chevron */}
          <span
            className="text-white/50 ml-1 flex-shrink-0 transition-transform duration-200"
            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', fontSize: 16 }}
          >
            ⌄
          </span>
        </div>
      </button>

      {/* Sticker grid */}
      {!isCollapsed && (
        <div className="relative grid grid-cols-3 gap-3 px-4 pt-3 pb-4 bg-white overflow-hidden">
          {/* Flag watermark */}
          {flagUrl && (
            <img
              src={flagUrl}
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ opacity: 0.04 }}
            />
          )}
          {visibleStickers.map((st) => (
            <StickerCard
              key={st.id}
              id={st.id}
              name={st.name}
              flagUrl={flagUrlSmall}
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
