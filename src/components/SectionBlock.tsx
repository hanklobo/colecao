import type { Section, AlbumState } from '../types';
import { StickerCard } from './StickerCard';

interface Props {
  section: Section;
  state: AlbumState;
  onCycle: (id: number) => void;
  filter: 'all' | 'missing' | 'repeated';
}

export function SectionBlock({ section, state, onCycle, filter }: Props) {
  const stickers = section.stickers.filter((st) => {
    if (filter === 'all') return true;
    const s = state[st.id];
    if (filter === 'missing') return !s || s.status === 'missing';
    if (filter === 'repeated') return s?.status === 'repeated';
    return true;
  });

  if (stickers.length === 0) return null;

  const haveCount = section.stickers.filter((st) => {
    const s = state[st.id];
    return s && s.status !== 'missing';
  }).length;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-[104px] z-10">
        {section.flag && <span className="text-2xl">{section.flag}</span>}
        <div>
          <h2 className="font-bold text-gray-800 leading-tight">{section.name}</h2>
          {section.group && (
            <p className="text-xs text-gray-500">Grupo {section.group}</p>
          )}
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {haveCount}/{section.stickers.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 px-4 pt-3">
        {stickers.map((st) => (
          <StickerCard
            key={st.id}
            id={st.id}
            name={st.name}
            stickerState={state[st.id] ?? { status: 'missing', count: 0 }}
            onPress={() => onCycle(st.id)}
          />
        ))}
      </div>
    </div>
  );
}
