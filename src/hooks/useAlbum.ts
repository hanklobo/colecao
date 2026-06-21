import { useState, useCallback } from 'react';
import type { AlbumState, StickerState, StickerStatus } from '../types';

const STORAGE_KEY = 'copa2026_album';

function loadState(): AlbumState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AlbumState) : {};
  } catch {
    return {};
  }
}

function saveState(state: AlbumState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const STATUS_CYCLE: StickerStatus[] = ['missing', 'have', 'repeated'];

export function useAlbum() {
  const [state, setState] = useState<AlbumState>(loadState);

  const getStickerState = useCallback(
    (id: number): StickerState =>
      state[id] ?? { status: 'missing', count: 0 },
    [state],
  );

  const cycleSticker = useCallback((id: number) => {
    setState((prev) => {
      const current = prev[id] ?? { status: 'missing', count: 0 };
      let next: StickerState;

      if (current.status === 'missing') {
        next = { status: 'have', count: 1 };
      } else if (current.status === 'have') {
        next = { status: 'repeated', count: 2 };
      } else {
        // repeated → add one more, then cycle back after count reaches 9
        const newCount = current.count + 1;
        if (newCount > 9) {
          next = { status: 'missing', count: 0 };
        } else {
          next = { status: 'repeated', count: newCount };
        }
      }

      const next_state = { ...prev, [id]: next };
      if (next.status === 'missing') {
        delete next_state[id];
      }
      saveState(next_state);
      return next_state;
    });
  }, []);

  const setSticker = useCallback((id: number, stickerState: StickerState) => {
    setState((prev) => {
      const next =
        stickerState.status === 'missing'
          ? (() => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            })()
          : { ...prev, [id]: stickerState };
      saveState(next);
      return next;
    });
  }, []);

  const stats = {
    total: 0,
    have: 0,
    repeated: 0,
    missing: 0,
    duplicateCount: 0,
  };

  // computed inline to avoid extra useState
  const stateEntries = Object.entries(state) as [string, StickerState][];
  for (const [, s] of stateEntries) {
    if (s.status === 'have') stats.have++;
    else if (s.status === 'repeated') {
      stats.have++;
      stats.repeated++;
      stats.duplicateCount += s.count - 1;
    }
  }

  const getMissingIds = useCallback(
    (totalStickers: number): number[] => {
      const missing: number[] = [];
      for (let i = 1; i <= totalStickers; i++) {
        const s = state[i];
        if (!s || s.status === 'missing') missing.push(i);
      }
      return missing;
    },
    [state],
  );

  const getRepeatedIds = useCallback((): { id: number; count: number }[] => {
    return Object.entries(state)
      .filter(([, s]) => s.status === 'repeated')
      .map(([id, s]) => ({ id: Number(id), count: s.count - 1 }));
  }, [state]);

  return {
    state,
    getStickerState,
    cycleSticker,
    setSticker,
    stats,
    getMissingIds,
    getRepeatedIds,
  };
}

// cycle status used by StatusCycle component reference
export { STATUS_CYCLE };
