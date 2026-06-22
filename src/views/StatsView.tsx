import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS, STICKER_MAP } from '../data/album2026';
import { getFlagUrl } from '../utils/flags';

interface Props {
  state: AlbumState;
}

export function StatsView({ state }: Props) {
  const totalHave = Object.values(state).filter((s) => s.status !== 'missing').length;
  const totalMissing = TOTAL_STICKERS - totalHave;
  const totalDuplicates = Object.values(state)
    .filter((s) => s.status === 'repeated')
    .reduce((sum, s) => sum + s.count - 1, 0);
  const pct = (totalHave / TOTAL_STICKERS) * 100;

  const sectionStats = SECTIONS.map((sec) => {
    const have = sec.stickers.filter((st) => {
      const s = state[st.id];
      return s && s.status !== 'missing';
    }).length;
    return { section: sec, have, total: sec.stickers.length };
  });

  const missingStickers = Object.keys(STICKER_MAP)
    .map(Number)
    .filter((id) => { const s = state[id]; return !s || s.status === 'missing'; })
    .sort((a, b) => a - b);

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      {/* Hero card */}
      <div className="bg-gray-900 px-5 pt-5 pb-8">
        <p className="text-white/60 text-xs mb-1">Completude do álbum</p>
        <p className="text-6xl font-black text-white">{Math.round(pct)}<span className="text-3xl text-copa-gold">%</span></p>
        <div className="mt-3 h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-copa-gold rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-6 mt-3">
          <div>
            <p className="text-white font-bold">{totalHave}</p>
            <p className="text-white/50 text-xs">tenho</p>
          </div>
          <div>
            <p className="text-white font-bold">{totalMissing}</p>
            <p className="text-white/50 text-xs">faltam</p>
          </div>
          <div>
            <p className="text-copa-gold font-bold">{totalDuplicates}</p>
            <p className="text-white/50 text-xs">repetidas</p>
          </div>
        </div>
      </div>

      {/* Per-section */}
      <div className="px-4 pt-4">
        <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Por seleção</h2>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
          {sectionStats.map(({ section, have, total }) => {
            const spct = Math.round((have / total) * 100);
            const flagUrl = section.flagCode ? getFlagUrl(section.flagCode, 40) : null;
            const isComplete = have === total;
            return (
              <div key={section.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-8 h-5 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                  {flagUrl ? (
                    <img src={flagUrl} alt={section.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-sm">{section.flag ?? '⚽'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="truncate text-gray-700 font-medium">{section.name}</span>
                    <span className={`ml-2 shrink-0 font-semibold ${isComplete ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {have}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-copa-green'}`}
                      style={{ width: `${spct}%` }}
                    />
                  </div>
                </div>
                {isComplete && <span className="text-emerald-500 text-sm flex-shrink-0">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing list */}
      {missingStickers.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">
            Faltam ({missingStickers.length})
          </h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {missingStickers.map((id) => {
                const info = STICKER_MAP[id];
                return (
                  <span
                    key={id}
                    className="bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    title={`${info?.section.name} – ${info?.name}`}
                  >
                    #{id}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
