import { useState } from 'react';
import { useAlbum } from './hooks/useAlbum';
import { ProgressBar } from './components/ProgressBar';
import { AlbumView } from './views/AlbumView';
import { TradingView } from './views/TradingView';
import { StatsView } from './views/StatsView';

type Tab = 'album' | 'stats' | 'trading';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'album', label: 'Álbum', icon: '📒' },
  { id: 'stats', label: 'Progresso', icon: '📊' },
  { id: 'trading', label: 'Troca', icon: '🔄' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('album');
  const { state, getStickerState: _, cycleSticker, stats } = useAlbum();

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-copa-green text-white">
        <div className="flex items-center px-4 py-3">
          <span className="text-xl mr-2">⚽</span>
          <h1 className="font-bold text-base leading-tight">
            Álbum Copa 2026
          </h1>
        </div>
        <ProgressBar have={stats.have} />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'album' && (
          <AlbumView state={state} onCycle={cycleSticker} />
        )}
        {tab === 'stats' && <StatsView state={state} />}
        {tab === 'trading' && <TradingView state={state} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex max-w-lg mx-auto z-30">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              tab === id ? 'text-copa-green' : 'text-gray-400'
            }`}
          >
            <span className="text-xl mb-0.5">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
