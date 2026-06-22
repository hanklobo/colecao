import { useState, useEffect } from 'react';
import { useAlbum } from './hooks/useAlbum';
import { useTradePartners } from './hooks/useTradePartners';
import { ProgressBar } from './components/ProgressBar';
import { AlbumView } from './views/AlbumView';
import { TradingView } from './views/TradingView';
import { StatsView } from './views/StatsView';

type Tab = 'album' | 'stats' | 'trading';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'album',   label: 'Álbum',     icon: '📒' },
  { id: 'stats',   label: 'Progresso', icon: '📊' },
  { id: 'trading', label: 'Troca',     icon: '🔄' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('album');
  const { state, cycleSticker, resetSticker, stats } = useAlbum();
  const { partners, myName, updateMyName, addPartner, removePartner } = useTradePartners();
  const [toast, setToast] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900 z-30">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="bg-copa-gold rounded-xl w-9 h-9 flex items-center justify-center text-xl flex-shrink-0 shadow">
            ⚽
          </div>
          <div>
            <h1 className="text-white font-black text-base leading-tight">Coleção Copa 2026</h1>
            <p className="text-white/40 text-[10px] leading-none">Álbum Panini · FIFA World Cup</p>
          </div>
        </div>
        <ProgressBar have={stats.have} duplicates={stats.duplicateCount} />
      </header>

      {/* Toast notification */}
      {toast && (
        <div className="absolute top-[120px] left-4 right-4 z-50 max-w-lg mx-auto">
          <div className="bg-emerald-700 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce-in">
            <span>🎉</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Main content — each view manages its own scroll */}
      <main className="flex-1 overflow-hidden">
        {tab === 'album' && (
          <AlbumView state={state} onCycle={cycleSticker} onReset={resetSticker} />
        )}
        {tab === 'stats' && <StatsView state={state} />}
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

      {/* Bottom nav */}
      <nav className="flex-shrink-0 bg-white border-t border-gray-200 flex safe-area-bottom z-30">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center pt-2 pb-3 text-[11px] font-semibold transition-colors relative ${
              tab === id ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {tab === id && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full" />
            )}
            <span className={`text-xl mb-0.5 transition-transform ${tab === id ? 'scale-110' : ''}`}>
              {icon}
            </span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
