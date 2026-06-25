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
  } = useUserSync();
  const [toast, setToast] = useState<string | null>(null);
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
        setToast(`${added.name} foi adicionado(a) como parceiro de troca!`);
        setTab('trading');
      } else {
        setToast('Não foi possível carregar esse parceiro.');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
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
      setToast(`${a.icon} Conquista desbloqueada: ${a.title}!`);
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
    setToast(`🎉 ${label} — exporte um backup pra não perder!`);
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
    setToast('✨ Salvo na nuvem! Que tal exportar um backup também?');
  }

  return (
    <div className="flex flex-col bg-gray-50 max-w-lg mx-auto" style={{ height: '100dvh' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 z-30 shadow-card-lg"
        style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
      >
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <LogoMark className="w-11 h-11 flex-shrink-0 rounded-xl shadow-card" />
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-display font-extrabold text-lg leading-tight tracking-tight">
              Coleção Copa 2026
            </h1>
            <p className="text-white/60 text-[11px] font-medium leading-none mt-0.5">
              Álbum Panini · FIFA World Cup
            </p>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            aria-label="Como funciona"
            className="flex-shrink-0 flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full pl-2.5 pr-3 py-1.5 text-xs font-semibold transition-colors self-start"
          >
            <HelpIcon className="w-4 h-4" />
            Ajuda
          </button>
        </div>
        <ProgressBar have={stats.have} duplicates={stats.duplicateCount} />
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
            syncStatus={syncStatus}
            isDirty={dirty}
          />
        )}
        {tab === 'stats' && (
          <StatsView
            state={state}
            myName={account.name}
            onImport={replaceState}
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
            lastSyncedAt={lastSyncedAt}
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
