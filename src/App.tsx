import { useState, useEffect, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useAlbum } from './hooks/useAlbum';
import {
  useTradePartners,
  useRefreshPartnersOnMount,
} from './hooks/useTradePartners';
import { useUserSync } from './hooks/useUserSync';
import { ProgressBar } from './components/ProgressBar';
import { AlbumView } from './views/AlbumView';
import { TradingView } from './views/TradingView';
import { StatsView } from './views/StatsView';
import { LandingPage } from './components/LandingPage';
import { SyncBadge } from './components/SyncBadge';
import { AlbumIcon, StatsIcon, TradeIcon, LogoMark, HelpIcon } from './components/Icons';
import { computeAchievements } from './utils/achievements';
import { encodeTradeCode } from './utils/trading';
import { Analytics } from '@vercel/analytics/react';

const ONBOARD_KEY = 'copa2026_onboarded';
const BADGES_KEY = 'copa2026_badges';
const BACKUP_META_KEY = 'copa2026_backupmeta';   // { firstShareNudgeSeen, lastBackupAt, nudgedMilestones }

type Tab = 'album' | 'stats' | 'trading';

const TABS: { id: Tab; label: string; Icon: ComponentType<{ className?: string; filled?: boolean }> }[] = [
  { id: 'album',   label: 'Álbum',     Icon: AlbumIcon },
  { id: 'stats',   label: 'Progresso', Icon: StatsIcon },
  { id: 'trading', label: 'Troca',     Icon: TradeIcon },
];

export interface BackupMeta {
  firstShareNudgeSeen?: boolean;
  lastBackupAt?: number;
  nudgedMilestones?: number[];
}

function loadBackupMeta(): BackupMeta {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_META_KEY) ?? '{}') as BackupMeta;
  } catch {
    return {};
  }
}

function saveBackupMeta(m: BackupMeta) {
  localStorage.setItem(BACKUP_META_KEY, JSON.stringify(m));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('album');
  const { state, cycleSticker, resetSticker, replaceState, stats } = useAlbum();
  const { partners, addPartnerById, refreshPartner, removePartner } = useTradePartners();
  const {
    account,
    accountStatus,
    updateName,
    syncStatus,
    lastSyncedAt,
    lastSyncedCode,
    scheduleSync,
    forceSync,
    restoreAccount,
  } = useUserSync();
  // Queue rather than single slot, so a milestone nudge and an achievement
  // unlock firing in the same tick don't clobber each other.
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const toast = toastQueue[0] ?? null;
  const pushToast = (msg: string) => setToastQueue((q) => [...q, msg]);
  const [showHelp, setShowHelp] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [backupMeta, setBackupMeta] = useState<BackupMeta>(loadBackupMeta);

  // Show landing page on first ever visit
  useEffect(() => {
    if (!localStorage.getItem(ONBOARD_KEY)) {
      setFirstTime(true);
      setShowHelp(true);
    }
  }, []);

  function closeHelp() {
    setShowHelp(false);
    setFirstTime(false);
    localStorage.setItem(ONBOARD_KEY, '1');
  }

  // Parse incoming trade link on first load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partnerId = params.get('u');
    const fallbackName = params.get('de') ?? undefined;
    if (!partnerId) return;
    window.history.replaceState({}, '', '/');
    (async () => {
      const added = await addPartnerById(partnerId, fallbackName);
      if (added) {
        pushToast(`${added.name} foi adicionado(a) como parceiro de troca!`);
        setTab('trading');
      } else {
        pushToast('Não foi possível carregar esse parceiro.');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss the head of the toast queue.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToastQueue((q) => q.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Celebrate newly unlocked achievements
  const achievements = useMemo(() => computeAchievements(state), [state]);
  const earnedKey = achievements.filter((a) => a.earned).map((a) => a.id).join('|');
  useEffect(() => {
    const earned = achievements.filter((a) => a.earned);
    const raw = localStorage.getItem(BADGES_KEY);
    if (raw === null) {
      // First run with this feature — set baseline silently
      localStorage.setItem(BADGES_KEY, JSON.stringify(earned.map((a) => a.id)));
      return;
    }
    const seen: string[] = JSON.parse(raw);
    const fresh = earned.filter((a) => !seen.includes(a.id));
    if (fresh.length > 0) {
      const a = fresh[fresh.length - 1];
      pushToast(`${a.icon} Conquista desbloqueada: ${a.title}!`);
      localStorage.setItem(BADGES_KEY, JSON.stringify(earned.map((x) => x.id)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedKey]);

  // ── Sync orchestration ────────────────────────────────────────────────────
  const code = useMemo(() => encodeTradeCode(state), [state]);
  const dirty = !!account.id && code !== lastSyncedCode;

  // Debounced sync on every album change.
  useEffect(() => {
    if (!dirty) return;
    scheduleSync(code);
  }, [code, dirty, scheduleSync]);

  // Force sync when the tab/window is hidden — captures end-of-session edits.
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === 'hidden' && dirty) {
        void forceSync(code);
      }
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [code, dirty, forceSync]);

  // Force sync when entering the Trading tab so partners see fresh data.
  useEffect(() => {
    if (tab === 'trading' && dirty) {
      void forceSync(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // SWR: when entering the Trading tab, refresh partners in the background.
  useRefreshPartnersOnMount(partners, refreshPartner, tab === 'trading');

  // ── Backup nudges ─────────────────────────────────────────────────────────
  // Milestones: first time the album crosses 50%, 75% or 100%, surface a nudge.
  useEffect(() => {
    const totalHave = Object.values(state).filter((s) => s.status !== 'missing').length;
    const pct = (totalHave / 980) * 100;
    const milestones = [50, 75, 100];
    const triggered = milestones.find(
      (m) => pct >= m && !(backupMeta.nudgedMilestones ?? []).includes(m),
    );
    if (!triggered) return;
    const label = triggered === 100 ? 'Álbum completo!' : `${triggered}% do álbum`;
    pushToast(`🎉 ${label} — exporte um backup pra não perder!`);
    const next: BackupMeta = {
      ...backupMeta,
      nudgedMilestones: [...(backupMeta.nudgedMilestones ?? []), triggered],
    };
    saveBackupMeta(next);
    setBackupMeta(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function markBackupDone() {
    const next: BackupMeta = { ...backupMeta, lastBackupAt: Date.now() };
    saveBackupMeta(next);
    setBackupMeta(next);
  }

  function markFirstShareSeen() {
    if (backupMeta.firstShareNudgeSeen) return;
    const next: BackupMeta = { ...backupMeta, firstShareNudgeSeen: true };
    saveBackupMeta(next);
    setBackupMeta(next);
    pushToast('✨ Salvo na nuvem! Que tal exportar um backup também?');
  }

  // Backup import: restore album state + (optionally) the original account
  // credentials so the user keeps writing to the same server record.
  function handleImport(result: { album: import('./types').AlbumState; account?: { id: string; token: string; name?: string } }) {
    replaceState(result.album);
    if (result.account) {
      restoreAccount(result.account);
      pushToast('Backup restaurado — sua conta na nuvem foi recuperada.');
    } else {
      pushToast('Backup restaurado. (Esse arquivo não trazia sua conta da nuvem.)');
    }
  }

  return (
    <div className="flex flex-col bg-gray-50 max-w-lg mx-auto" style={{ height: '100dvh' }}>
      {/* Header */}
      <header
        className="relative flex-shrink-0 z-30 shadow-card-lg overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(120% 80% at 0% 0%, #1f5cc4 0%, transparent 55%),' +
            'radial-gradient(110% 80% at 100% 0%, #0b2e6b 0%, transparent 60%),' +
            'linear-gradient(140deg, #06184a 0%, #0b2e6b 45%, #133b8a 100%)',
        }}
      >
        {/* Cromos pattern — scattered sticker silhouettes in the background.
            Same vibe as the "26" watermark on each StickerCard, tying the
            header to the rest of the app's visual language. */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="hdr-cromos" x="0" y="0" width="118" height="96" patternUnits="userSpaceOnUse">
              <g fill="white" opacity="0.05">
                <rect x="6"  y="8"  width="28" height="36" rx="3" transform="rotate(-9 20 26)" />
                <rect x="48" y="44" width="30" height="38" rx="3" transform="rotate(11 63 63)" />
                <rect x="86" y="2"  width="26" height="33" rx="3" transform="rotate(-5 99 18)" />
                <rect x="94" y="58" width="22" height="28" rx="3" transform="rotate(14 105 72)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hdr-cromos)" />
        </svg>
        {/* Gold hairline along the top */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #fcd34d 50%, transparent 100%)',
            opacity: 0.7,
          }}
        />
        {/* Gold hairline along the bottom — chrome separator between
            header and content, mirroring the top one. */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px z-10"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #fcd34d 50%, transparent 100%)',
            opacity: 0.7,
          }}
        />
        <div className="relative flex items-center gap-3 px-4 pt-4 pb-2">
          {/* Logo with gold halo + soft shadow */}
          <div className="relative flex-shrink-0">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-2xl blur-md opacity-50"
              style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.55) 0%, transparent 70%)' }}
            />
            <LogoMark className="relative w-14 h-14 rounded-2xl shadow-card-lg ring-1 ring-white/25" />
          </div>

          {/* Title block */}
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-extrabold leading-none tracking-tight">
              <span className="text-white text-[15px]">Coleção</span>
              <span className="text-copa-gold text-lg ml-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                Copa 2026
              </span>
            </h1>
            <p className="text-white/55 text-[9.5px] font-bold leading-none mt-1.5 uppercase tracking-[0.2em]">
              Álbum Panini · FIFA World Cup
            </p>
          </div>

          {/* Right cluster */}
          <div className="flex-shrink-0 flex items-center gap-1.5 self-start">
            <SyncBadge
              status={syncStatus}
              dirty={dirty}
              enabled={!!account.id}
              onForceSync={() => { void forceSync(code); }}
            />
            <button
              onClick={() => setShowHelp(true)}
              aria-label="Como funciona"
              className="flex items-center gap-1.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/15 rounded-full pl-2.5 pr-3 py-1.5 text-[11px] font-semibold transition-colors ring-1 ring-white/10"
            >
              <HelpIcon className="w-3.5 h-3.5" />
              Ajuda
            </button>
          </div>
        </div>
        <div className="relative">
          <ProgressBar
            have={stats.have}
            duplicates={stats.duplicateCount}
            lastSyncedAt={lastSyncedAt}
            showSync={!!account.id}
          />
        </div>
      </header>

      {/* Toast notification */}
      {toast && (
        <div className="absolute top-[124px] left-4 right-4 z-50 max-w-lg mx-auto pointer-events-none">
          <div className="bg-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-card-lg flex items-center gap-2.5 animate-bounce-in">
            <span className="text-lg leading-none">🎉</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Main content — each view manages its own scroll */}
      <main className="flex-1 overflow-hidden">
        {tab === 'album' && (
          <AlbumView
            state={state}
            onCycle={cycleSticker}
            onReset={resetSticker}
          />
        )}
        {tab === 'stats' && (
          <StatsView
            state={state}
            myName={account.name}
            account={account}
            onImport={handleImport}
            backupMeta={backupMeta}
            onBackupDone={markBackupDone}
          />
        )}
        {tab === 'trading' && (
          <TradingView
            state={state}
            myName={account.name}
            account={account}
            accountStatus={accountStatus}
            onUpdateMyName={updateName}
            partners={partners}
            onAddPartnerById={addPartnerById}
            onRemovePartner={removePartner}
            onRefreshPartner={refreshPartner}
            onGoToAlbum={() => setTab('album')}
            syncStatus={syncStatus}
            isDirty={dirty}
            onForceSync={() => forceSync(code)}
            onShareSucceeded={markFirstShareSeen}
          />
        )}
      </main>

      {/* Landing / help overlay */}
      {showHelp && <LandingPage onClose={closeHelp} firstTime={firstTime} />}

      {/* Bottom nav */}
      <nav className="flex-shrink-0 bg-white/95 backdrop-blur border-t border-gray-200 flex safe-area-bottom z-30">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center pt-2.5 pb-3 text-[11px] font-bold transition-colors relative ${
                active ? 'text-copa-blue' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-copa-blue rounded-b-full" />
              )}
              <Icon
                className={`w-6 h-6 mb-0.5 transition-transform ${active ? 'scale-110' : ''}`}
                filled={active}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <Analytics />
    </div>
  );
}
