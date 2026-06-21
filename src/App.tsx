import { useState } from 'react';
import { useAlbum } from './hooks/useAlbum';
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="bg-copa-gold rounded-xl w-9 h-9 flex items-center justify-center text-xl flex-shrink-0">
            ⚽
          </div>
          <div>
            <h1 className="text-white font-black text-base leading-tight">Coleção Copa 2026</h1>
            <p className="text-white/40 text-[10px] leading-none">Álbum Panini · FIFA World Cup</p>
          </div>
        </div>
        <ProgressBar have={stats.have} duplicates={stats.duplicateCount} />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'album'   && <AlbumView state={state} onCycle={cycleSticker} onReset={resetSticker} />}
        {tab === 'stats'   && <StatsView state={state} />}
        {tab === 'trading' && <TradingView state={state} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex z-30 safe-area-bottom">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-2.5 text-[11px] font-semibold transition-colors ${
              tab === id
                ? 'text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`text-xl mb-0.5 transition-transform ${tab === id ? 'scale-110' : ''}`}>
              {icon}
            </span>
            {label}
            {tab === id && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-gray-900 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
