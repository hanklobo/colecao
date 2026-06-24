// Identity gradient per section, used to theme each section header. Keyed by
// the section id (INTRO, MUSEU, or the team's 3-letter code).

export interface TeamColor {
  from: string;
  to: string;
}

const TEAM_COLORS: Record<string, TeamColor> = {
  INTRO: { from: '#0b2e6b', to: '#1a73e8' },
  MUSEU: { from: '#92600c', to: '#f4b400' },

  MEX: { from: '#006847', to: '#ce1126' },
  RSA: { from: '#007a4d', to: '#001489' },
  KOR: { from: '#003478', to: '#cd2e3a' },
  CZE: { from: '#11457e', to: '#d7141a' },
  CAN: { from: '#d52b1e', to: '#a4000f' },
  BIH: { from: '#002f6c', to: '#1a73e8' },
  QAT: { from: '#8a1538', to: '#5c0d26' },
  SUI: { from: '#d52b1e', to: '#a8160c' },
  BRA: { from: '#009739', to: '#002776' },
  MAR: { from: '#c1272d', to: '#006233' },
  HAI: { from: '#00209f', to: '#d21034' },
  SCO: { from: '#0b3d91', to: '#005eb8' },
  USA: { from: '#0a3161', to: '#b31942' },
  PAR: { from: '#0038a8', to: '#d52b1e' },
  AUS: { from: '#0b6e4f', to: '#00843d' },
  TUR: { from: '#e30a17', to: '#b00610' },
  GER: { from: '#1a1a1a', to: '#dd0000' },
  CUW: { from: '#002b7f', to: '#2a6fd6' },
  CIV: { from: '#e07b0c', to: '#009e60' },
  ECU: { from: '#034ea2', to: '#ed1c24' },
  NED: { from: '#c8410b', to: '#f36c21' },
  JPN: { from: '#0a1a5c', to: '#bc002d' },
  SWE: { from: '#005293', to: '#1f7fd6' },
  TUN: { from: '#b31427', to: '#e70013' },
  BEL: { from: '#1a1a1a', to: '#c8102e' },
  EGY: { from: '#ce1126', to: '#1a1a1a' },
  IRN: { from: '#239f40', to: '#da0000' },
  NZL: { from: '#151515', to: '#00247d' },
  ESP: { from: '#aa151b', to: '#c8102e' },
  CPV: { from: '#003893', to: '#1a73e8' },
  KSA: { from: '#006c35', to: '#00854a' },
  URU: { from: '#2a5fa0', to: '#75aadb' },
  FRA: { from: '#002395', to: '#ed2939' },
  SEN: { from: '#00853f', to: '#e31b23' },
  IRQ: { from: '#a0142a', to: '#007a3d' },
  NOR: { from: '#002868', to: '#ba0c2f' },
  ARG: { from: '#2a5fa0', to: '#75aadb' },
  ALG: { from: '#00603a', to: '#0a7d49' },
  AUT: { from: '#c8102e', to: '#ed2939' },
  JOR: { from: '#1a1a1a', to: '#ce1126' },
  POR: { from: '#006600', to: '#d50000' },
  COD: { from: '#0066cc', to: '#ce1021' },
  UZB: { from: '#0072a8', to: '#1ba33a' },
  COL: { from: '#003893', to: '#ce1126' },
  ENG: { from: '#0a2472', to: '#cf142b' },
  CRO: { from: '#c8102e', to: '#0f1a6b' },
  GHA: { from: '#006b3f', to: '#ce1126' },
  PAN:  { from: '#005293', to: '#d21034' },
  COCA: { from: '#e8001a', to: '#b50012' },
};

const DEFAULT: TeamColor = { from: '#1e293b', to: '#334155' };

export function getTeamColor(sectionId: string): TeamColor {
  return TEAM_COLORS[sectionId] ?? DEFAULT;
}
