import { useMemo, useRef, useState } from 'react';
import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS, STICKER_MAP } from '../data/album2026';
import { getFlagUrl } from '../utils/flags';
import { computeAchievements, specialOwned, TOTAL_SPECIAL } from '../utils/achievements';
import { shareProgressCard } from '../utils/shareCard';
import { exportAlbum, parseAlbumFile } from '../utils/backup';
import { AchievementsGrid } from '../components/Achievements';
import { CheckIcon, ShareIcon, DownloadIcon, UploadIcon } from '../components/Icons';

interface Props {
  state: AlbumState;
  myName: string;
  onImport: (state: AlbumState) => void;
}

export function StatsView({ state, myName, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      const parsed = parseAlbumFile(text);
      if (!parsed) {
        window.alert('Arquivo inválido. Selecione um backup exportado pelo app.');
        return;
      }
      const count = Object.keys(parsed).length;
      if (window.confirm(`Importar ${count} figurinhas? Isso substitui sua coleção atual.`)) {
        onImport(parsed);
      }
    });
  }
  const totalHave = Object.values(state).filter((s) => s.status !== 'missing').length;
  const totalMissing = TOTAL_STICKERS - totalHave;
  const totalDuplicates = Object.values(state)
    .filter((s) => s.status === 'repeated')
    .reduce((sum, s) => sum + s.count - 1, 0);
  const pct = (totalHave / TOTAL_STICKERS) * 100;

  const achievements = useMemo(() => computeAchievements(state), [state]);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const specials = specialOwned(state);

  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  async function handleShare() {
    setSharing(true);
    const result = await shareProgressCard({
      name: myName,
      have: totalHave,
      total: TOTAL_STICKERS,
      duplicates: totalDuplicates,
      missing: totalMissing,
      badges: earnedCount,
    });
    setSharing(false);
    if (result === 'downloaded') {
      setShareMsg('Imagem salva!');
      setTimeout(() => setShareMsg(null), 2500);
    } else if (result === 'error') {
      setShareMsg('Não foi possível compartilhar.');
      setTimeout(() => setShareMsg(null), 2500);
    }
  }

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
      <div
        className="px-5 pt-5 pb-8 shadow-card-lg"
        style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
      >
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Completude do álbum</p>
        <p className="text-6xl font-display font-extrabold text-white tabular-nums">{Math.round(pct)}<span className="text-3xl text-copa-gold">%</span></p>
        <div className="mt-3 h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-copa-gold rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-5 mt-3">
          <div>
            <p className="text-white font-bold text-lg tabular-nums">{totalHave}</p>
            <p className="text-white/60 text-xs font-medium">tenho</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg tabular-nums">{totalMissing}</p>
            <p className="text-white/60 text-xs font-medium">faltam</p>
          </div>
          <div>
            <p className="text-copa-gold font-bold text-lg tabular-nums">{totalDuplicates}</p>
            <p className="text-white/60 text-xs font-medium">repetidas</p>
          </div>
          <div>
            <p className="text-amber-300 font-bold text-lg tabular-nums">{specials}/{TOTAL_SPECIAL}</p>
            <p className="text-white/60 text-xs font-medium">✨ especiais</p>
          </div>
        </div>

        {/* Share progress */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className="mt-5 w-full py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
        >
          <ShareIcon className="w-4 h-4" />
          {sharing ? 'Gerando imagem...' : shareMsg ?? 'Compartilhar meu progresso'}
        </button>
      </div>

      {/* Achievements */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-extrabold text-gray-800 text-sm uppercase tracking-wide">Conquistas</h2>
          <span className="text-xs font-bold text-copa-blue bg-copa-blue/10 px-2.5 py-1 rounded-full tabular-nums">
            {earnedCount}/{achievements.length}
          </span>
        </div>
        <p className="text-gray-400 text-xs mb-3 -mt-1">Toque num brasão para ver os detalhes e sua evolução.</p>
        <AchievementsGrid achievements={achievements} albumPct={Math.round(pct)} />
      </div>

      {/* Per-section */}
      <div className="px-4 pt-4">
        <h2 className="font-display font-extrabold text-gray-800 text-sm mb-3 uppercase tracking-wide">Por seleção</h2>
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
                {isComplete && <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing list */}
      {missingStickers.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-display font-extrabold text-gray-800 text-sm mb-3 uppercase tracking-wide">
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

      {/* Backup */}
      <div className="px-4 mt-6">
        <h2 className="font-display font-extrabold text-gray-800 text-sm mb-3 uppercase tracking-wide">Backup</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-500 text-xs leading-snug mb-3">
            Sua coleção fica salva só neste navegador. Exporte um arquivo para não perder
            o progresso ao trocar de celular ou limpar o navegador.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => exportAlbum(state, myName)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-copa-ink text-white font-bold text-sm active:scale-95 transition"
            >
              <DownloadIcon className="w-4 h-4" /> Exportar
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition"
            >
              <UploadIcon className="w-4 h-4" /> Importar
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 mt-6">
        <p className="text-gray-400 text-[10px] text-center leading-relaxed">
          App não oficial, feito por fãs. Não é afiliado, patrocinado ou endossado pela FIFA
          ou pela Panini. Marcas, nomes e imagens pertencem aos seus respectivos donos.
        </p>
      </div>
    </div>
  );
}
