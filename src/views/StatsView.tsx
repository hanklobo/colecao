import { useMemo, useRef, useState } from 'react';
import type { AlbumState } from '../types';
import type { BackupMeta } from '../App';
import type { MyAccount } from '../hooks/useUserSync';
import { SECTIONS, TOTAL_STICKERS, STICKER_MAP } from '../data/album2026';
import { getFlagUrl } from '../utils/flags';
import { computeAchievements, specialOwned, TOTAL_SPECIAL } from '../utils/achievements';
import { shareProgressCard } from '../utils/shareCard';
import { exportAlbum, parseAlbumFile, type ImportResult } from '../utils/backup';
import { AchievementsGrid } from '../components/Achievements';
import { CheckIcon, ShareIcon, DownloadIcon, UploadIcon } from '../components/Icons';

interface Props {
  state: AlbumState;
  myName: string;
  account: MyAccount;
  onImport: (result: ImportResult) => void;
  backupMeta: BackupMeta;
  onBackupDone: () => void;
}

import { formatRelative } from '../utils/time';

const STALE_BACKUP_MS = 14 * 24 * 60 * 60 * 1000;

export function StatsView({ state, myName, account, onImport, backupMeta, onBackupDone }: Props) {
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
      const count = Object.keys(parsed.album).length;
      const hasAccount = !!parsed.account;
      const confirmMsg = hasAccount
        ? `Importar ${count} figurinhas e restaurar sua conta da nuvem? Isso substitui o estado atual deste navegador.`
        : `Importar ${count} figurinhas? Isso substitui sua coleção atual.`;
      if (window.confirm(confirmMsg)) {
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
      special: specials,
      specialTotal: TOTAL_SPECIAL,
      badges: earnedCount,
      badgesTotal: achievements.length,
      badgeIcons: achievements.filter((a) => a.earned).map((a) => a.icon),
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

  const motivational =
    pct === 100 ? '🏆 Álbum completo!' :
    pct >= 90   ? 'Falta pouquíssimo!' :
    pct >= 75   ? 'Quase lá, não para!' :
    pct >= 50   ? 'Você está na metade!' :
    pct >= 25   ? 'Bom começo, continue!' :
                  'Sua jornada começa aqui.';

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      {/* Hero card */}
      <div
        className="relative px-5 pt-6 pb-7 shadow-card-lg overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(135deg, #071e4a 0%, #0b2e6b 45%, #1a56b0 100%)' }}
      >
        {/* Decorative background circles */}
        <div className="absolute -top-14 -right-10 w-52 h-52 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute top-8 -right-4 w-28 h-28 rounded-full bg-white/[0.05] pointer-events-none" />
        <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-copa-gold/[0.07] pointer-events-none" />

        {/* Label + motivational */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Completude do álbum</p>
          <p className="text-white/70 text-[11px] font-semibold">{motivational}</p>
        </div>

        {/* Percentage + fraction */}
        <div className="flex items-end gap-3 mb-4">
          <p className="font-display font-extrabold text-white tabular-nums leading-none" style={{ fontSize: '5rem' }}>
            {Math.round(pct)}
          </p>
          <div className="pb-2 leading-none">
            <span className="text-copa-gold font-black text-3xl leading-none">%</span>
            <p className="text-white/40 text-[11px] font-semibold mt-1 tabular-nums">{totalHave} / {TOTAL_STICKERS}</p>
          </div>
        </div>

        {/* Progress bar — thicker with gold glow */}
        <div className="mb-5">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 60%, #fcd34d 100%)',
                boxShadow: '0 0 10px rgba(245,158,11,0.55)',
              }}
            />
          </div>
        </div>

        {/* Stats — glassmorphism cards */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="bg-white/10 rounded-xl py-2.5 px-1 text-center">
            <p className="text-white font-extrabold text-lg tabular-nums leading-none">{totalHave}</p>
            <p className="text-white/45 text-[9px] font-semibold mt-1.5 leading-none">coladas</p>
          </div>
          <div className="bg-white/10 rounded-xl py-2.5 px-1 text-center">
            <p className="text-white font-extrabold text-lg tabular-nums leading-none">{totalMissing}</p>
            <p className="text-white/45 text-[9px] font-semibold mt-1.5 leading-none">faltam</p>
          </div>
          <div className="rounded-xl py-2.5 px-1 text-center" style={{ background: 'rgba(245,158,11,0.18)' }}>
            <p className="text-copa-gold font-extrabold text-lg tabular-nums leading-none">{totalDuplicates}</p>
            <p className="text-copa-gold/60 text-[9px] font-semibold mt-1.5 leading-none">repetidas</p>
          </div>
          <div className="rounded-xl py-2.5 px-1 text-center" style={{ background: 'rgba(252,211,77,0.12)' }}>
            <p className="text-amber-300 font-extrabold text-lg tabular-nums leading-none">{specials}</p>
            <p className="text-amber-300/60 text-[9px] font-semibold mt-1.5 leading-none">✦ especiais</p>
          </div>
        </div>

        {/* Share progress */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.15)' }}
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

        {/* Persistent stale-backup banner — only when backup is missing or old. */}
        {(() => {
          const last = backupMeta.lastBackupAt ?? 0;
          const isStale = !last || Date.now() - last > STALE_BACKUP_MS;
          if (!isStale) return null;
          return (
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">⚠</span>
              <div className="flex-1 min-w-0">
                <p className="text-amber-900 font-bold text-xs leading-tight">
                  {last ? 'Backup desatualizado' : 'Nenhum backup salvo'}
                </p>
                <p className="text-amber-800/80 text-[11px] leading-snug mt-0.5">
                  Se você limpar o navegador ou trocar de celular, sua coleção pode se perder.
                  Exporte um arquivo para garantir.
                </p>
              </div>
            </div>
          );
        })()}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-500 text-xs leading-snug mb-3">
            O arquivo de backup inclui sua coleção {account.id ? 'e a chave da sua conta na nuvem' : ''}.
            Guarde uma cópia: se trocar de celular ou limpar o navegador, importe pra
            recuperar tudo.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                exportAlbum(
                  state,
                  myName,
                  account.id && account.token
                    ? { id: account.id, token: account.token, name: account.name }
                    : undefined,
                );
                onBackupDone();
              }}
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
          <p className="text-gray-400 text-[11px] font-medium mt-2.5 text-center">
            Último backup: {formatRelative(backupMeta.lastBackupAt)}
          </p>
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
