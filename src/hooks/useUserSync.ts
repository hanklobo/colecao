import { useCallback, useEffect, useRef, useState } from 'react';
import { createUser, updateUser } from '../utils/api';
import { randomToken } from '../utils/ids';

// localStorage keys
const ACCOUNT_KEY        = 'copa2026_account';      // { id, token, name }
const ACCOUNT_BACKUP_KEY = 'copa2026_account_bad';  // quarantined corrupt blob
const SYNCMETA_KEY       = 'copa2026_syncmeta';     // { lastSyncedAt, lastSyncedCode }
const LEGACY_NAME        = 'copa2026_myname';       // pre-server name storage

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'error';
export type AccountStatus = 'anon' | 'creating' | 'ready' | 'error';

export interface MyAccount {
  id: string | null;
  token: string | null;
  name: string;
}

interface SyncMeta {
  lastSyncedAt: number | null;
  lastSyncedCode: string | null;
}

const DEBOUNCE_MS = 10_000;

function loadAccount(): MyAccount {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<MyAccount>;
      // Only treat the blob as a real account when it has both id+token; a
      // partial record from an interrupted write should not orphan us into a
      // brand-new server identity. Quarantine it and fall through so a
      // future fix can recover.
      if (parsed.id && parsed.token) {
        return {
          id: parsed.id,
          token: parsed.token,
          name: parsed.name ?? '',
        };
      }
      localStorage.setItem(ACCOUNT_BACKUP_KEY, raw);
    } catch {
      localStorage.setItem(ACCOUNT_BACKUP_KEY, raw);
    }
  }
  // Migration from the pre-server name-only storage.
  const legacyName = localStorage.getItem(LEGACY_NAME) ?? '';
  return { id: null, token: null, name: legacyName };
}

function loadMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNCMETA_KEY);
    if (raw) return JSON.parse(raw) as SyncMeta;
  } catch { /* ignore */ }
  return { lastSyncedAt: null, lastSyncedCode: null };
}

function persistAccount(a: MyAccount) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a));
  if (a.name) localStorage.setItem(LEGACY_NAME, a.name);
}

function persistMeta(m: SyncMeta) {
  localStorage.setItem(SYNCMETA_KEY, JSON.stringify(m));
}

export interface UseUserSyncReturn {
  account: MyAccount;
  accountStatus: AccountStatus;
  updateName: (name: string) => Promise<MyAccount>;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  lastSyncedCode: string | null;
  scheduleSync: (code: string) => void;
  forceSync: (code: string) => Promise<boolean>;
  // Restore an exported account blob (from a backup file). Replaces the
  // current local identity so the user can resume controlling the same
  // server-side record across devices.
  restoreAccount: (a: { id: string; token: string; name?: string }) => void;
}

export function useUserSync(): UseUserSyncReturn {
  const [account, setAccount] = useState<MyAccount>(loadAccount);
  const [meta, setMeta] = useState<SyncMeta>(loadMeta);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(() =>
    account.id ? 'ready' : 'anon',
  );

  const timer = useRef<number | null>(null);
  // Keep a ref to the latest account so async callbacks see fresh creds.
  const accountRef = useRef(account);
  useEffect(() => { accountRef.current = account; }, [account]);

  // Queued name change waiting to be flushed to the server. When the rename
  // PUT fails (offline, 5xx, etc.) we keep the requested name here and
  // attach it to the next album sync, so the server eventually catches up
  // without needing the user to retry by hand.
  const pendingNameRef = useRef<string | null>(null);

  const doSync = useCallback(async (code: string): Promise<boolean> => {
    const a = accountRef.current;
    if (!a.id || !a.token) {
      // No credentials → nothing to do. Clear any 'pending' set by the
      // scheduler so the badge doesn't sit spinning forever.
      setSyncStatus('idle');
      return false;
    }
    setSyncStatus('syncing');
    const patch: { code: string; name?: string } = { code };
    if (pendingNameRef.current) patch.name = pendingNameRef.current;
    try {
      const r = await updateUser(a.id, a.token, patch);
      const next: SyncMeta = { lastSyncedAt: r.updatedAt, lastSyncedCode: code };
      persistMeta(next);
      setMeta(next);
      pendingNameRef.current = null;
      setSyncStatus('idle');
      return true;
    } catch (err) {
      console.warn('sync failed', err);
      setSyncStatus('error');
      return false;
    }
  }, []);

  const scheduleSync = useCallback((code: string) => {
    if (timer.current) window.clearTimeout(timer.current);
    // Preserve 'error' between attempts so the badge keeps signalling the
    // last known failure instead of flicking back to 'pending' on every
    // sticker tap. A successful doSync clears it.
    setSyncStatus((prev) => (prev === 'error' ? 'error' : 'pending'));
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void doSync(code);
    }, DEBOUNCE_MS);
  }, [doSync]);

  const forceSync = useCallback(async (code: string): Promise<boolean> => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    return await doSync(code);
  }, [doSync]);

  // Cleanup any pending timer on unmount.
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const updateName = useCallback(async (rawName: string): Promise<MyAccount> => {
    const name = rawName.trim();
    if (!name) return accountRef.current;

    const current = accountRef.current;
    // Optimistic local update.
    const optimistic: MyAccount = { ...current, name };
    persistAccount(optimistic);
    setAccount(optimistic);
    accountRef.current = optimistic;

    if (current.id && current.token) {
      // Best-effort server rename; on failure the name rides along with the
      // next album sync so friends eventually see the new value.
      try {
        await updateUser(current.id, current.token, { name });
        pendingNameRef.current = null;
      } catch (err) {
        console.warn('rename queued for retry', err);
        pendingNameRef.current = name;
      }
      return optimistic;
    }

    // No account yet — try to create one. If it fails, keep the name locally
    // and surface 'error' so the UI can retry on the next user action.
    setAccountStatus('creating');
    try {
      const { id, token } = await createUser(name);
      const safeToken = token || randomToken();
      const next: MyAccount = { id, token: safeToken, name };
      persistAccount(next);
      setAccount(next);
      accountRef.current = next;
      setAccountStatus('ready');
      return next;
    } catch (err) {
      console.warn('createUser failed', err);
      setAccountStatus('error');
      return optimistic;
    }
  }, []);

  const restoreAccount = useCallback((a: { id: string; token: string; name?: string }) => {
    const next: MyAccount = {
      id: a.id,
      token: a.token,
      name: a.name?.trim() || accountRef.current.name || '',
    };
    persistAccount(next);
    setAccount(next);
    accountRef.current = next;
    setAccountStatus('ready');
    // The local code is about to change too (album was just imported), so
    // force a re-sync window — but the parent owns `code`, so we just clear
    // the synced marker and rely on the parent's effect to schedule.
    persistMeta({ lastSyncedAt: null, lastSyncedCode: null });
    setMeta({ lastSyncedAt: null, lastSyncedCode: null });
    setSyncStatus('idle');
  }, []);

  return {
    account,
    accountStatus,
    updateName,
    syncStatus,
    lastSyncedAt: meta.lastSyncedAt,
    lastSyncedCode: meta.lastSyncedCode,
    scheduleSync,
    forceSync,
    restoreAccount,
  };
}
