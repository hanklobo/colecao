import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS, STICKER_MAP } from '../data/album2026';

interface Props {
  state: AlbumState;
}

export function StatsView({ state }: Props) {
  const totalHave = Object.values(state).filter(
    (s) => s.status !== 'missing',
  ).length;
  const totalMissing = TOTAL_STICKERS - totalHave;
  const totalDuplicates = Object.values(state)
    .filter((s) => s.status === 'repeated')
    .reduce((sum, s) => sum + s.count - 1, 0);
  const pct = Math.round((totalHave / TOTAL_STICKERS) * 100);

  const sectionStats = SECTIONS.map((sec) => {
    const have = sec.stickers.filter((st) => {
      const s = state[st.id];
      return s && s.status !== 'missing';
    }).length;
    const total = sec.stickers.length;
    return { section: sec, have, total };
  });

  const missingStickers = Object.keys(STICKER_MAP)
    .map(Number)
    .filter((id) => {
      const s = state[id];
      return !s || s.status === 'missing';
    })
    .sort((a, b) => a - b);

  return (
    <div className="pb-20">
      {/* Overview */}
      <div className="px-4 py-4 space-y-4">
        <div className="bg-copa-green rounded-2xl p-5 text-white">
          <p className="text-sm opacity-80 mb-1">Completude do álbum</p>
          <p className="text-5xl font-bold">{pct}%</p>
          <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-copa-gold rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm opacity-80 mt-2">
            {totalHave} de {TOTAL_STICKERS} figurinhas
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-700">{totalHave}</p>
            <p className="text-[11px] text-green-600">tenho</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-700">{totalMissing}</p>
            <p className="text-[11px] text-red-600">faltam</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-700">{totalDuplicates}</p>
            <p className="text-[11px] text-amber-600">repetidas</p>
          </div>
        </div>
      </div>

      {/* Per-section progress */}
      <div className="px-4">
        <h2 className="font-bold text-gray-800 mb-3">Por seleção</h2>
        <div className="space-y-2">
          {sectionStats.map(({ section, have, total }) => {
            const spct = Math.round((have / total) * 100);
            return (
              <div key={section.id} className="flex items-center gap-3">
                <span className="w-8 text-xl text-center">
                  {section.flag ?? '⚽'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="truncate text-gray-700">{section.name}</span>
                    <span className="text-gray-500 ml-2 shrink-0">
                      {have}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-copa-green rounded-full"
                      style={{ width: `${spct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing list */}
      {missingStickers.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-bold text-gray-800 mb-2">
            Figurinhas que faltam ({missingStickers.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {missingStickers.map((id) => {
              const info = STICKER_MAP[id];
              return (
                <span
                  key={id}
                  className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded"
                  title={`${info?.section.name} - ${info?.name}`}
                >
                  #{id} {info?.section.flag}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
