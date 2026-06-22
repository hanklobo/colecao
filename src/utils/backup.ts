import type { AlbumState, StickerState } from '../types';

interface BackupFile {
  app: 'colecao-copa-2026';
  version: 1;
  exportedAt: string;
  name: string;
  album: AlbumState;
}

export function exportAlbum(state: AlbumState, name = ''): void {
  const payload: BackupFile = {
    app: 'colecao-copa-2026',
    version: 1,
    exportedAt: new Date().toISOString(),
    name,
    album: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `colecao-copa2026-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Accepts either a full backup file or a raw album object; returns a clean
// AlbumState or null when the content is not recognizable.
export function parseAlbumFile(text: string): AlbumState | null {
  try {
    const data = JSON.parse(text);
    const album = (data && typeof data === 'object' && 'album' in data) ? data.album : data;
    if (!album || typeof album !== 'object') return null;
    const out: AlbumState = {};
    for (const [k, v] of Object.entries(album as Record<string, unknown>)) {
      const id = Number(k);
      if (!Number.isInteger(id)) continue;
      const s = v as Partial<StickerState>;
      if (s && (s.status === 'have' || s.status === 'repeated') && typeof s.count === 'number') {
        out[id] = { status: s.status, count: s.count };
      }
    }
    return out;
  } catch {
    return null;
  }
}
