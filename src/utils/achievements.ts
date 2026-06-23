import type { AlbumState } from '../types';
import { SECTIONS, TOTAL_STICKERS } from '../data/album2026';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  current: number;
  target: number;
  earned: boolean;
}

function sectionComplete(state: AlbumState, sectionId: string): boolean {
  const sec = SECTIONS.find((s) => s.id === sectionId);
  if (!sec) return false;
  return sec.stickers.every((st) => {
    const s = state[st.id];
    return s && s.status !== 'missing';
  });
}

// Total number of foil/special stickers in the album (escudos + abertura + museu)
export const TOTAL_SPECIAL = SECTIONS.reduce(
  (n, s) => n + s.stickers.filter((st) => st.special).length,
  0,
);

export function specialOwned(state: AlbumState): number {
  let n = 0;
  for (const s of SECTIONS) {
    for (const st of s.stickers) {
      if (st.special) {
        const v = state[st.id];
        if (v && v.status !== 'missing') n++;
      }
    }
  }
  return n;
}

export function computeAchievements(state: AlbumState): Achievement[] {
  let have = 0;
  let repeated = 0;
  for (let i = 1; i <= TOTAL_STICKERS; i++) {
    const s = state[i];
    if (s && s.status !== 'missing') {
      have++;
      if (s.status === 'repeated') repeated++;
    }
  }

  const teams = SECTIONS.filter((s) => s.flagCode);
  const completedTeams = teams.filter((s) => sectionComplete(state, s.id)).length;
  const introDone = sectionComplete(state, 'INTRO');
  const museumDone = sectionComplete(state, 'MUSEU');
  const ownedSpecial = specialOwned(state);

  const pctTarget = (p: number) => Math.ceil(TOTAL_STICKERS * p);

  const defs: Omit<Achievement, 'earned'>[] = [
    { id: 'start',    icon: '🎬', title: 'Primeira colada',  desc: 'Marque sua 1ª figurinha',          current: have,           target: 1 },
    { id: 'fifty',    icon: '🌟', title: '50 coladas',        desc: 'Tenha 50 figurinhas',              current: have,           target: 50 },
    { id: 'hundred',  icon: '💯', title: '100 coladas',       desc: 'Tenha 100 figurinhas',             current: have,           target: 100 },
    { id: 'quarter',  icon: '🌱', title: '25% do álbum',      desc: 'Complete um quarto do álbum',      current: have,           target: pctTarget(0.25) },
    { id: 'half',     icon: '🌗', title: 'Meio caminho',      desc: 'Complete metade do álbum',         current: have,           target: pctTarget(0.5) },
    { id: 'threeq',   icon: '🌖', title: '75% do álbum',      desc: 'Complete três quartos do álbum',   current: have,           target: pctTarget(0.75) },
    { id: 'team1',    icon: '🥇', title: 'Primeira seleção',  desc: 'Complete 1 seleção inteira',       current: completedTeams, target: 1 },
    { id: 'team10',   icon: '🎖️', title: '10 seleções',       desc: 'Complete 10 seleções',             current: completedTeams, target: 10 },
    { id: 'team24',   icon: '🌍', title: 'Metade das seleções', desc: 'Complete 24 seleções',           current: completedTeams, target: 24 },
    { id: 'allteams', icon: '🛡️', title: 'Todas as seleções', desc: 'Complete as 48 seleções',          current: completedTeams, target: teams.length },
    { id: 'intro',    icon: '🎏', title: 'Abertura',          desc: 'Complete a seção de abertura',     current: introDone ? 1 : 0,  target: 1 },
    { id: 'museum',   icon: '🏛️', title: 'FIFA Museum',       desc: 'Complete os campeões históricos',  current: museumDone ? 1 : 0, target: 1 },
    { id: 'foil',     icon: '✨', title: 'Brilho total',      desc: 'Tenha todas as figurinhas especiais', current: ownedSpecial, target: TOTAL_SPECIAL },
    { id: 'trader',   icon: '🔁', title: 'Pronto pra trocar', desc: 'Tenha 20 figurinhas repetidas',    current: repeated,       target: 20 },
    { id: 'champion', icon: '🏆', title: 'Campeão do mundo',  desc: 'Complete o álbum inteiro',         current: have,           target: TOTAL_STICKERS },
  ];

  return defs.map((d) => ({ ...d, earned: d.current >= d.target }));
}
