import { useCallback, useEffect, useState } from 'react';
import { decodeTradeCode } from '../utils/trading';
import { fetchUser } from '../utils/api';

export interface TradePartner {
  id: string;            // server user id (for legacy entries: a local uuid)
  name: string;
  code: string;
  addedAt: number;
  fetchedAt?: number;    // when this partner was last refreshed from server
  legacy?: boolean;      // pre-server-sync snapshots — never refresh
}

const PARTNERS_KEY = 'copa2026_partners';

function load(): TradePartner[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PARTNERS_KEY) ?? '[]') as TradePartner[];
    // Legacy migration: older entries had a random uuid as id, no fetchedAt,
    // and the code came from the share URL (?t=...). Mark them as legacy so
    // the UI can flag them and skip refresh attempts.
    return raw.map((p) => {
      if (p.fetchedAt === undefined && p.legacy === undefined) {
        return { ...p, legacy: true };
      }
      return p;
    });
  } catch {
    return [];
  }
}

function persist(list: TradePartner[]) {
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(list));
}

export function useTradePartners() {
  const [partners, setPartners] = useState<TradePartner[]>(load);

  // Returns the partner record after adding, or null on failure.
  const addPartnerById = useCallback(
    async (id: string, fallbackName?: string): Promise<TradePartner | null> => {
      const fetched = await fetchUser(id);
      if (!fetched) return null;
      if (!fetched.code || !decodeTradeCode(fetched.code)) {
        // Account exists but hasn't synced any code yet — store a placeholder
        // so they show up in the partners list with a "waiting" state.
        const placeholder: TradePartner = {
          id: fetched.id,
          name: fetched.name || fallbackName?.trim() || 'Amigo',
          code: '',
          addedAt: Date.now(),
          fetchedAt: Date.now(),
        };
        upsertPartner(placeholder);
        return placeholder;
      }
      const next: TradePartner = {
        id: fetched.id,
        name: fetched.name || fallbackName?.trim() || 'Amigo',
        code: fetched.code,
        addedAt: Date.now(),
        fetchedAt: Date.now(),
      };
      upsertPartner(next);
      return next;
    },
    [],
  );

  const refreshPartner = useCallback(async (id: string): Promise<void> => {
    const target = partners.find((p) => p.id === id);
    if (!target || target.legacy) return;
    const fetched = await fetchUser(id);
    if (!fetched) return;
    setPartners((prev) => {
      const next = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name: fetched.name || p.name,
              code: fetched.code ?? p.code,
              fetchedAt: Date.now(),
            }
          : p,
      );
      persist(next);
      return next;
    });
  }, [partners]);

  function upsertPartner(partner: TradePartner) {
    setPartners((prev) => {
      const idx = prev.findIndex((p) => p.id === partner.id);
      let next: TradePartner[];
      if (idx >= 0) {
        next = [...prev];
        // Preserve original addedAt on update.
        next[idx] = { ...partner, addedAt: prev[idx].addedAt };
      } else {
        next = [...prev, partner];
      }
      persist(next);
      return next;
    });
  }

  const removePartner = useCallback((id: string) => {
    setPartners((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { partners, addPartnerById, refreshPartner, removePartner };
}

// Extract a user id from a pasted share link or raw id. Accepts:
//   - bare id like "abc12XYZ_-"
//   - full URL "https://.../?u=abc12XYZ_-"
//   - just the query "?u=abc12XYZ_-"
export function parsePartnerInput(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Try query param first.
  const qIdx = s.indexOf('u=');
  if (qIdx >= 0) {
    const after = s.slice(qIdx + 2);
    const end = after.search(/[&#]/);
    const id = end >= 0 ? after.slice(0, end) : after;
    if (/^[A-Za-z0-9_-]{6,40}$/.test(id)) return id;
  }
  // Treat the whole thing as a bare id.
  if (/^[A-Za-z0-9_-]{6,40}$/.test(s)) return s;
  return null;
}

// Background SWR: when partners exist and we mount, refresh them quietly.
export function useRefreshPartnersOnMount(
  partners: TradePartner[],
  refreshPartner: (id: string) => Promise<void>,
  trigger: unknown,
) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const p of partners) {
        if (cancelled) return;
        if (p.legacy) continue;
        await refreshPartner(p.id);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
}
