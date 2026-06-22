import { useState, useEffect } from 'react';
import { useAlbum } from './hooks/useAlbum';
import { useTradePartners } from './hooks/useTradePartners';
import { ProgressBar } from './components/ProgressBar';
import { AlbumView } from './views/AlbumView';
import { TradingView } from './views/TradingView';
import { StatsView } from './views/StatsView';

type Tab = 'album' | 'stats' | 'trading';

// ── SVG nav icons (Heroicons 2 outline) ──────────────────────────────────

function IconAlbum({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function IconStats({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconTrade({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'album',   label: 'Álbum',     Icon: IconAlbum },
  { id: 'stats',   label: 'Progresso', Icon: IconStats },
  { id: 'trading', label: 'Troca',     Icon: IconTrade },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('album');
  const { state, cycleSticker, resetSticker, stats } = useAlbum();
  const { partners, myName, updateMyName, addPartner, removePartner } = useTradePartners();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('troca');
    const fromName = params.get('de');
    if (code && fromName) {
      addPartner(fromName, code);
      setToast(`${fromName} adicionado(a) como parceiro de troca!`);
      window.history.replaceState({}, '', '/');
      setTab('trading');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="flex flex-col bg-gray-100 max-w-lg mx-auto" style={{ height: '100dvh' }}>

      {/* ── Header ── */}
      <header className="flex-shrink-0 z-30" style={{ background: 'linear-gradient(180deg, #0D1B2A 0%, #142235 100%)' }}>
        <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
          {/* Badge */}
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c86a)' }}
          >
            <svg className="w-5 h-5 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.15"/>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-11.5l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L6 10l3.5-.5 1.5-3z"/>
            </svg>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-black text-[15px] leading-tight tracking-tight">
              Coleção Copa 2026
            </h1>
            <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase leading-none mt-0.5">
              Panini · FIFA World Cup
            </p>
          </div>

          {/* Completion % */}
          <div className="text-right flex-shrink-0">
            <p className="text-copa-gold font-black text-xl leading-none">
              {Math.round((stats.have / 666) * 100)}
              <span className="text-sm font-semibold text-copa-gold/70">%</span>
            </p>
          </div>
        </div>

        <ProgressBar have={stats.have} duplicates={stats.duplicateCount} />
      </header>

      {/* ── Toast ── */}
      {toast && (
        <div className="absolute top-24 left-4 right-4 z-50">
          <div className="bg-emerald-700 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="flex-1 overflow-hidden">
        {tab === 'album'   && <AlbumView state={state} onCycle={cycleSticker} onReset={resetSticker} />}
        {tab === 'stats'   && <StatsView state={state} />}
        {tab === 'trading' && (
          <TradingView
            state={state}
            myName={myName}
            onUpdateMyName={updateMyName}
            partners={partners}
            onAddPartner={addPartner}
            onRemovePartner={removePartner}
            onGoToAlbum={() => setTab('album')}
          />
        )}
      </main>

      {/* ── Bottom nav ── */}
      <nav className="flex-shrink-0 bg-white border-t border-gray-200/80 flex safe-area-bottom z-30 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center pt-2 pb-2.5 relative transition-colors"
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-copa-green" />
              )}
              <span className={`transition-colors ${active ? 'text-copa-green' : 'text-gray-400'}`}>
                <Icon active={active} />
              </span>
              <span className={`mt-0.5 text-[10px] font-semibold tracking-tight transition-colors ${
                active ? 'text-copa-green' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
