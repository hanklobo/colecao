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

  const teams = SECTIONS.filter((s) => s.group);
  const completedTeams = teams.filter((s) => sectionComplete(state, s.id)).length;

  const groups = Array.from(new Set(teams.map((s) => s.group)));
  const completedGroups = groups.filter((g) =>
    teams.filter((s) => s.group === g).every((s) => sectionComplete(state, s.id)),
  ).length;

  const introDone = sectionComplete(state, 'INTRO');
  const stadiumsDone = sectionComplete(state, 'EST');

  // Special sections
  const lendDone = sectionComplete(state, 'LEND');
  const craqDone = sectionComplete(state, 'CRAQ');
  const brilDone = sectionComplete(state, 'BRIL');
  const fifaDone = sectionComplete(state, 'FIFA');
  const specialsDone = [lendDone, craqDone, brilDone, fifaDone].filter(Boolean).length;

  const half = Math.ceil(TOTAL_STICKERS / 2);

  const defs: Omit<Achievement, 'earned'>[] = [
    { id: 'start',    icon: '🎬', title: 'Começou!',         desc: 'Marque sua 1ª figurinha',     current: have,            target: 1 },
    { id: 'fifty',    icon: '🌟', title: '50 coladas',        desc: 'Tenha 50 figurinhas',         current: have,            target: 50 },
    { id: 'hundred',  icon: '💯', title: '100 coladas',       desc: 'Tenha 100 figurinhas',        current: have,            target: 100 },
    { id: 'team1',    icon: '🥇', title: 'Primeira seleção',  desc: 'Complete 1 seleção',          current: completedTeams,  target: 1 },
    { id: 'team5',    icon: '🏅', title: '5 seleções',        desc: 'Complete 5 seleções',         current: completedTeams,  target: 5 },
    { id: 'group1',   icon: '🔰', title: 'Primeiro grupo',    desc: 'Complete 1 grupo inteiro',    current: completedGroups, target: 1 },
    { id: 'half',     icon: '🌗', title: 'Meio caminho',      desc: 'Complete metade do álbum',    current: have,            target: half },
    { id: 'intro',    icon: '🎏', title: 'Abertura',          desc: 'Complete a seção de abertura', current: introDone ? 1 : 0, target: 1 },
    { id: 'stadiums', icon: '🏟️', title: 'Anfitriões',        desc: 'Complete todos os estádios',  current: stadiumsDone ? 1 : 0, target: 1 },
    // Special sections
    { id: 'lendas',   icon: '👑', title: 'Lendas',            desc: 'Complete as Lendas da Copa',          current: lendDone ? 1 : 0, target: 1 },
    { id: 'craques',  icon: '⭐', title: 'Craques',           desc: 'Complete os Craques da Copa',         current: craqDone ? 1 : 0, target: 1 },
    { id: 'brilho',   icon: '✨', title: 'Brilhantes',        desc: 'Complete as Especiais Brilhantes',    current: brilDone ? 1 : 0, target: 1 },
    { id: 'fanfest',  icon: '🎪', title: 'Fã da Copa',        desc: 'Complete o FIFA Fan Festival',        current: fifaDone ? 1 : 0, target: 1 },
    { id: 'special',  icon: '🔮', title: 'Colecionador especial', desc: 'Complete todas as seções especiais', current: specialsDone, target: 4 },
    { id: 'trader',   icon: '🔁', title: 'Pronto pra trocar', desc: 'Tenha 20 repetidas',          current: repeated,        target: 20 },
    { id: 'allgroups',icon: '🌍', title: 'Todos os grupos',   desc: 'Complete os 12 grupos',       current: completedGroups, target: groups.length },
    { id: 'champion', icon: '🏆', title: 'Campeão!',          desc: 'Complete o álbum inteiro',    current: have,            target: TOTAL_STICKERS },
  ];

  return defs.map((d) => ({ ...d, earned: d.current >= d.target }));
}
