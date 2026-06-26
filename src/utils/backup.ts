import type { AlbumState, StickerState } from '../types';

export interface AccountBackup {
  id: string;
  token: string;
  name?: string;
}

interface BackupFile {
  app: 'colecao-copa-2026';
  version: 1 | 2;
  exportedAt: string;
  name: string;
  account?: AccountBackup;
  album: AlbumState;
}

export interface ImportResult {
  album: AlbumState;
  account?: AccountBackup;
}

export function exportAlbum(state: AlbumState, name = '', account?: AccountBackup): void {
  const payload: BackupFile = {
    app: 'colecao-copa-2026',
    version: 2,
    exportedAt: new Date().toISOString(),
    name,
    album: state,
  };
  // Include the account id/token so a restore on another device keeps
  // write access to the existing server record. Without this the user
  // loses their cloud identity on every restore.
  if (account?.id && account?.token) {
    payload.account = { id: account.id, token: account.token, name: account.name };
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `colecao-copa2026-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Accepts either a full backup file or a raw album object; returns a clean
// AlbumState plus optional account creds when the file contained them.
export function parseAlbumFile(text: string): ImportResult | null {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') return null;

    // Two shapes: wrapped backup file (with `album`) or a bare album object.
    const wrapped = 'album' in data && typeof (data as { album: unknown }).album === 'object';
    const albumRaw = wrapped ? (data as { album: unknown }).album : data;
    if (!albumRaw || typeof albumRaw !== 'object') return null;

    const out: AlbumState = {};
    for (const [k, v] of Object.entries(albumRaw as Record<string, unknown>)) {
      const id = Number(k);
      if (!Number.isInteger(id)) continue;
      const s = v as Partial<StickerState>;
      if (s && (s.status === 'have' || s.status === 'repeated') && typeof s.count === 'number') {
        out[id] = { status: s.status, count: s.count };
      }
    }

    const result: ImportResult = { album: out };
    if (wrapped) {
      const acct = (data as { account?: unknown }).account;
      if (
        acct &&
        typeof acct === 'object' &&
        typeof (acct as AccountBackup).id === 'string' &&
        typeof (acct as AccountBackup).token === 'string'
      ) {
        const a = acct as AccountBackup;
        if (/^[A-Za-z0-9_-]{6,40}$/.test(a.id) && a.token.length > 0) {
          result.account = { id: a.id, token: a.token, name: a.name };
        }
      }
    }
    return result;
  } catch {
    return null;
  }
}
