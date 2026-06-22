import { useState, useCallback } from 'react';
import { decodeTradeCode } from '../utils/trading';

export interface TradePartner {
  id: string;
  name: string;
  code: string;
  addedAt: number;
}

const PARTNERS_KEY = 'copa2026_partners';
const MY_NAME_KEY = 'copa2026_myname';

function load(): TradePartner[] {
  try {
    return JSON.parse(localStorage.getItem(PARTNERS_KEY) ?? '[]') as TradePartner[];
  } catch {
    return [];
  }
}

export function useTradePartners() {
  const [partners, setPartners] = useState<TradePartner[]>(load);
  const [myName, setMyNameState] = useState<string>(
    () => localStorage.getItem(MY_NAME_KEY) ?? '',
  );

  const updateMyName = useCallback((name: string) => {
    localStorage.setItem(MY_NAME_KEY, name);
    setMyNameState(name);
  }, []);

  // Returns true if partner was newly added, false if duplicate/invalid
  const addPartner = useCallback((name: string, code: string): boolean => {
    if (!decodeTradeCode(code)) return false;
    let added = false;
    setPartners((prev) => {
      const idx = prev.findIndex((p) => p.code === code);
      let next: TradePartner[];
      if (idx >= 0) {
        // Update name if different
        next = [...prev];
        next[idx] = { ...next[idx], name, addedAt: Date.now() };
      } else {
        added = true;
        next = [
          ...prev,
          { id: crypto.randomUUID(), name, code, addedAt: Date.now() },
        ];
      }
      localStorage.setItem(PARTNERS_KEY, JSON.stringify(next));
      return next;
    });
    return added;
  }, []);

  const removePartner = useCallback((id: string) => {
    setPartners((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(PARTNERS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { partners, myName, updateMyName, addPartner, removePartner };
}
