import { useState, useEffect, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useAlbum } from './hooks/useAlbum';
import { useTradePartners } from './hooks/useTradePartners';
import { ProgressBar } from './components/ProgressBar';
import { AlbumView } from './views/AlbumView';
import { TradingView } from './views/TradingView';
import { StatsView } from './views/StatsView';
import { LandingPage } from './components/LandingPage';
import { AlbumIcon, StatsIcon, TradeIcon, BallIcon } from './components/Icons';
import { computeAchievements } from './utils/achievements';

const ONBOARD_KEY = 'copa2026_onboarded';
const BADGES_KEY = 'copa2026_badges';

type Tab = 'album' | 'stats' | 'trading';

const TABS: { id: Tab; label: string; Icon: ComponentType<{ className?: string; filled?: boolean }> }[] = [
  { id: 'album',   label: 'Álbum',     Icon: AlbumIcon },
  { id: 'stats',   label: 'Progresso', Icon: StatsIcon },
  { id: 'trading', label: 'Troca',     Icon: TradeIcon },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('album');
  const { state, cycleSticker, resetSticker, stats } = useAlbum();
  const { partners, myName, updateMyName, addPartner, removePartner } = useTradePartners();
  const [toast, setToast] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [firstTime, setFirstTime] = useState(false);

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

  // Parse incoming trade link on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('troca');
    const fromName = params.get('de');
    if (code && fromName) {
      addPartner(fromName, code);
      setToast(`${fromName} foi adicionado(a) como parceiro de troca!`);
      window.history.replaceState({}, '', '/');
      setTab('trading');
    }
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

  return (
    <div className="flex flex-col bg-gray-50 max-w-lg mx-auto" style={{ height: '100dvh' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 z-30 shadow-card-lg"
        style={{ backgroundImage: 'linear-gradient(120deg, #0b2e6b 0%, #1a73e8 100%)' }}
      >
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="bg-copa-gold rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-card text-copa-navy">
            <BallIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-display font-extrabold text-lg leading-tight tracking-tight">
              Coleção Copa 2026
            </h1>
            <p className="text-white/60 text-[11px] font-medium leading-none mt-0.5">
              Álbum Panini · FIFA World Cup
            </p>
          </div>
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
          <AlbumView state={state} onCycle={cycleSticker} onReset={resetSticker} />
        )}
        {tab === 'stats' && <StatsView state={state} myName={myName} />}
        {tab === 'trading' && (
          <TradingView
            state={state}
            myName={myName}
            onUpdateMyName={updateMyName}
            partners={partners}
            onAddPartner={addPartner}
            onRemovePartner={removePartner}
            onGoToAlbum={() => setTab('album')}
            onShowHelp={() => setShowHelp(true)}
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
    </div>
  );
}
