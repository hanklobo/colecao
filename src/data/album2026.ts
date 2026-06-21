import type { Section, Sticker } from '../types';

function makeStickers(
  startId: number,
  sectionId: string,
  names: string[],
): Sticker[] {
  return names.map((name, i) => ({ id: startId + i, name, sectionId }));
}

function teamStickers(startId: number, sectionId: string): Sticker[] {
  return makeStickers(startId, sectionId, [
    'Escudo',
    'Foto da equipe',
    'Jogador 1',
    'Jogador 2',
    'Jogador 3',
    'Jogador 4',
    'Jogador 5',
    'Jogador 6',
    'Jogador 7',
    'Jogador 8',
    'Jogador 9',
    'Jogador 10',
    'Jogador 11',
  ]);
}

const TEAMS: { id: string; name: string; flag: string; group: string }[] = [
  // Grupo A
  { id: 'USA', name: 'Estados Unidos', flag: '🇺🇸', group: 'A' },
  { id: 'URU', name: 'Uruguai', flag: '🇺🇾', group: 'A' },
  { id: 'PAN', name: 'Panamá', flag: '🇵🇦', group: 'A' },
  { id: 'BOL', name: 'Bolívia', flag: '🇧🇴', group: 'A' },
  // Grupo B
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'B' },
  { id: 'JAM', name: 'Jamaica', flag: '🇯🇲', group: 'B' },
  { id: 'ROM', name: 'Romênia', flag: '🇷🇴', group: 'B' },
  { id: 'DZA', name: 'Argélia', flag: '🇩🇿', group: 'B' },
  // Grupo C
  { id: 'BRA', name: 'Brasil', flag: '🇧🇷', group: 'C' },
  { id: 'MEX', name: 'México', flag: '🇲🇽', group: 'C' },
  { id: 'AUS', name: 'Austrália', flag: '🇦🇺', group: 'C' },
  { id: 'TUN', name: 'Tunísia', flag: '🇹🇳', group: 'C' },
  // Grupo D
  { id: 'FRA', name: 'França', flag: '🇫🇷', group: 'D' },
  { id: 'MAR', name: 'Marrocos', flag: '🇲🇦', group: 'D' },
  { id: 'JPN', name: 'Japão', flag: '🇯🇵', group: 'D' },
  { id: 'ECU', name: 'Equador', flag: '🇪🇨', group: 'D' },
  // Grupo E
  { id: 'ESP', name: 'Espanha', flag: '🇪🇸', group: 'E' },
  { id: 'COL', name: 'Colômbia', flag: '🇨🇴', group: 'E' },
  { id: 'KOR', name: 'Coreia do Sul', flag: '🇰🇷', group: 'E' },
  { id: 'CAN', name: 'Canadá', flag: '🇨🇦', group: 'E' },
  // Grupo F
  { id: 'GER', name: 'Alemanha', flag: '🇩🇪', group: 'F' },
  { id: 'CRO', name: 'Croácia', flag: '🇭🇷', group: 'F' },
  { id: 'SEN', name: 'Senegal', flag: '🇸🇳', group: 'F' },
  { id: 'IRN', name: 'Irã', flag: '🇮🇷', group: 'F' },
  // Grupo G
  { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'G' },
  { id: 'NED', name: 'Holanda', flag: '🇳🇱', group: 'G' },
  { id: 'NGA', name: 'Nigéria', flag: '🇳🇬', group: 'G' },
  { id: 'VEN', name: 'Venezuela', flag: '🇻🇪', group: 'G' },
  // Grupo H
  { id: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'H' },
  { id: 'DEN', name: 'Dinamarca', flag: '🇩🇰', group: 'H' },
  { id: 'GHA', name: 'Gana', flag: '🇬🇭', group: 'H' },
  { id: 'KSA', name: 'Arábia Saudita', flag: '🇸🇦', group: 'H' },
  // Grupo I
  { id: 'BEL', name: 'Bélgica', flag: '🇧🇪', group: 'I' },
  { id: 'SRB', name: 'Sérvia', flag: '🇷🇸', group: 'I' },
  { id: 'HON', name: 'Honduras', flag: '🇭🇳', group: 'I' },
  { id: 'UZB', name: 'Uzbequistão', flag: '🇺🇿', group: 'I' },
  // Grupo J
  { id: 'AUT', name: 'Áustria', flag: '🇦🇹', group: 'J' },
  { id: 'SUI', name: 'Suíça', flag: '🇨🇭', group: 'J' },
  { id: 'IRQ', name: 'Iraque', flag: '🇮🇶', group: 'J' },
  { id: 'COD', name: 'R.D. Congo', flag: '🇨🇩', group: 'J' },
  // Grupo K
  { id: 'TUR', name: 'Turquia', flag: '🇹🇷', group: 'K' },
  { id: 'SVK', name: 'Eslováquia', flag: '🇸🇰', group: 'K' },
  { id: 'CMR', name: 'Camarões', flag: '🇨🇲', group: 'K' },
  { id: 'NZL', name: 'Nova Zelândia', flag: '🇳🇿', group: 'K' },
  // Grupo L
  { id: 'ITA', name: 'Itália', flag: '🇮🇹', group: 'L' },
  { id: 'CIV', name: 'Costa do Marfim', flag: '🇨🇮', group: 'L' },
  { id: 'JOR', name: 'Jordânia', flag: '🇯🇴', group: 'L' },
  { id: 'EGY', name: 'Egito', flag: '🇪🇬', group: 'L' },
];

function buildSections(): Section[] {
  const sections: Section[] = [];
  let id = 1;

  // Special opening section
  const introNames = [
    'Logo Copa 2026',
    'Troféu FIFA',
    'Sede EUA',
    'Sede Canadá',
    'Sede México',
    'Mascote oficial',
    'Bola oficial',
    'Mapa das sedes',
    'Países anfitriões',
    'Copa do Mundo 2026',
  ];
  sections.push({
    id: 'INTRO',
    name: 'Abertura',
    stickers: makeStickers(id, 'INTRO', introNames),
  });
  id += introNames.length;

  // One section per team
  for (const team of TEAMS) {
    sections.push({
      id: team.id,
      name: team.name,
      flag: team.flag,
      group: team.group,
      stickers: teamStickers(id, team.id),
    });
    id += 13;
  }

  // Stadiums section
  const stadiumNames = [
    'MetLife Stadium',
    'MetLife Stadium (interior)',
    'SoFi Stadium',
    'SoFi Stadium (interior)',
    'AT&T Stadium',
    'AT&T Stadium (interior)',
    'Levi\'s Stadium',
    'Levi\'s Stadium (interior)',
    'Rose Bowl',
    'Rose Bowl (interior)',
    'Arrowhead Stadium',
    'Arrowhead Stadium (interior)',
    'Lincoln Financial Field',
    'Lincoln Financial Field (interior)',
    'BC Place',
    'BC Place (interior)',
    'BMO Field',
    'BMO Field (interior)',
    'Estadio Azteca',
    'Estadio Azteca (interior)',
    'Estadio Akron',
    'Estadio Akron (interior)',
    'Estadio BBVA',
    'Estadio BBVA (interior)',
    'Gillette Stadium',
    'Gillette Stadium (interior)',
    'NRG Stadium',
    'NRG Stadium (interior)',
    'State Farm Stadium',
    'State Farm Stadium (interior)',
    'Allegiant Stadium',
    'Allegiant Stadium (interior)',
  ];
  sections.push({
    id: 'EST',
    name: 'Estádios',
    stickers: makeStickers(id, 'EST', stadiumNames),
  });

  return sections;
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
