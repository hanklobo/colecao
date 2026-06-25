import { useCallback, useEffect, useRef, useState } from 'react';
import { createUser, updateUser } from '../utils/api';
import { randomToken } from '../utils/ids';

// localStorage keys
const ACCOUNT_KEY  = 'copa2026_account';      // { id, token, name }
const SYNCMETA_KEY = 'copa2026_syncmeta';     // { lastSyncedAt, lastSyncedCode }
const LEGACY_NAME  = 'copa2026_myname';       // pre-server-sync name storage

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
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MyAccount>;
      return {
        id: parsed.id ?? null,
        token: parsed.token ?? null,
        name: parsed.name ?? '',
      };
    }
  } catch { /* fall through */ }
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
  // Keep the legacy key in sync so other places reading it stay accurate
  // until they migrate.
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
}

export function useUserSync(): UseUserSyncReturn {
  const [account, setAccount] = useState<MyAccount>(loadAccount);
  const [meta, setMeta] = useState<SyncMeta>(loadMeta);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(() =>
    loadAccount().id ? 'ready' : 'anon',
  );

  const timer = useRef<number | null>(null);
  // Keep a ref to the latest account so async callbacks see fresh creds.
  const accountRef = useRef(account);
  useEffect(() => { accountRef.current = account; }, [account]);

  const doSync = useCallback(async (code: string): Promise<boolean> => {
    const a = accountRef.current;
    if (!a.id || !a.token) return false;
    setSyncStatus('syncing');
    try {
      const r = await updateUser(a.id, a.token, { code });
      const next: SyncMeta = { lastSyncedAt: r.updatedAt, lastSyncedCode: code };
      persistMeta(next);
      setMeta(next);
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
    setSyncStatus('pending');
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
      // Best-effort server rename; failure is non-blocking.
      try {
        await updateUser(current.id, current.token, { name });
      } catch (err) {
        console.warn('rename failed', err);
      }
      return optimistic;
    }

    // No account yet — try to create one. If it fails, keep the name locally
    // and let the next attempt (e.g. opening Trading) retry implicitly via
    // the share-link flow.
    setAccountStatus('creating');
    try {
      const { id, token } = await createUser(name);
      // The token from the API is what we use forever; we don't keep the local
      // randomToken() fallback, but generating it ensures we always have a
      // non-empty placeholder when offline scenarios arise.
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

  return {
    account,
    accountStatus,
    updateName,
    syncStatus,
    lastSyncedAt: meta.lastSyncedAt,
    lastSyncedCode: meta.lastSyncedCode,
    scheduleSync,
    forceSync,
  };
}
