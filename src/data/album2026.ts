import type { Section, Sticker } from '../types';
import checklist from './checklist2026.json';

// Official Panini FIFA World Cup 2026 checklist (980 stickers): a 9-sticker
// opening, the 11 FIFA Museum legends, and 48 teams × 20 (badge #1, team
// photo #13, 18 players). Source data lives in checklist2026.json.

interface RawSticker {
  name: string;
  special?: boolean;
}
interface RawSection {
  id: string;
  name: string;
  flagCode?: string;
  group?: string;
  stickers: RawSticker[];
}

const SECTION_EMOJI: Record<string, string> = { INTRO: '🎬', MUSEU: '🏆' };

function buildSections(): Section[] {
  const out: Section[] = [];
  let id = 1;
  for (const raw of (checklist.sections as RawSection[])) {
    const stickers: Sticker[] = raw.stickers.map((st, i) => ({
      id: id + i,
      name: st.name,
      sectionId: raw.id,
      special: st.special,
    }));
    out.push({
      id: raw.id,
      name: raw.name,
      flagCode: raw.flagCode,
      group: raw.group,
      flag: SECTION_EMOJI[raw.id],
      stickers,
    });
    id += raw.stickers.length;
  }
  return out;
}

export const SECTIONS: Section[] = buildSections();

export const ALL_STICKERS = SECTIONS.flatMap((s) => s.stickers);

export const TOTAL_STICKERS = ALL_STICKERS.length;

export const STICKER_MAP: Record<number, Sticker & { section: Section }> =
  Object.fromEntries(
    SECTIONS.flatMap((s) =>
      s.stickers.map((st) => [st.id, { ...st, section: s }]),
    ),
  );
