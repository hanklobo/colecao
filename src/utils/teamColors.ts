// Primary identity colors per section, used to theme each section header
// (gradient) and tint accents. Colors are deep/saturated so white text
// stays legible on top of the gradient.

export interface TeamColor {
  from: string; // darker / dominant — sits under the flag + title
  to: string;   // accent — fades toward the progress side
}

const TEAM_COLORS: Record<string, TeamColor> = {
  // Specials
  INTRO: { from: '#003087', to: '#d97706' },
  EST:   { from: '#1e293b', to: '#475569' },

  // Extras / specials
  LEND:  { from: '#92600c', to: '#f4b400' },
  CRAQ:  { from: '#5b21b6', to: '#2563eb' },
  BRIL:  { from: '#6d28d9', to: '#a78bfa' },
  FIFA:  { from: '#0f766e', to: '#14b8a6' },

  // Grupo A
  USA: { from: '#0a3161', to: '#b31942' },
  URU: { from: '#2a5fa0', to: '#75aadb' },
  PAN: { from: '#005293', to: '#d21034' },
  BOL: { from: '#00603a', to: '#d52b1e' },
  // Grupo B
  ARG: { from: '#2a5fa0', to: '#75aadb' },
  JAM: { from: '#007a2f', to: '#111111' },
  ROM: { from: '#002b7f', to: '#ce1126' },
  DZA: { from: '#00603a', to: '#0a7d49' },
  // Grupo C
  BRA: { from: '#009739', to: '#002776' },
  MEX: { from: '#006847', to: '#ce1126' },
  AUS: { from: '#0b6e4f', to: '#00843d' },
  TUN: { from: '#b31427', to: '#e70013' },
  // Grupo D
  FRA: { from: '#002395', to: '#ed2939' },
  MAR: { from: '#c1272d', to: '#006233' },
  JPN: { from: '#0a1a5c', to: '#bc002d' },
  ECU: { from: '#034ea2', to: '#ed1c24' },
  // Grupo E
  ESP: { from: '#aa151b', to: '#c8102e' },
  COL: { from: '#003893', to: '#ce1126' },
  KOR: { from: '#003478', to: '#cd2e3a' },
  CAN: { from: '#d52b1e', to: '#a4000f' },
  // Grupo F
  GER: { from: '#1a1a1a', to: '#dd0000' },
  CRO: { from: '#c8102e', to: '#0f1a6b' },
  SEN: { from: '#00853f', to: '#e31b23' },
  IRN: { from: '#239f40', to: '#da0000' },
  // Grupo G
  ENG: { from: '#0a2472', to: '#cf142b' },
  NED: { from: '#c8410b', to: '#f36c21' },
  NGA: { from: '#006b3f', to: '#008751' },
  VEN: { from: '#6e1423', to: '#a31621' },
  // Grupo H
  POR: { from: '#006600', to: '#d50000' },
  DEN: { from: '#c8102e', to: '#9b0e23' },
  GHA: { from: '#006b3f', to: '#ce1126' },
  KSA: { from: '#006c35', to: '#00854a' },
  // Grupo I
  BEL: { from: '#1a1a1a', to: '#c8102e' },
  SRB: { from: '#aa2127', to: '#0c4076' },
  HON: { from: '#0052a5', to: '#1a86d8' },
  UZB: { from: '#0072a8', to: '#1ba33a' },
  // Grupo J
  AUT: { from: '#c8102e', to: '#ed2939' },
  SUI: { from: '#d52b1e', to: '#a8160c' },
  IRQ: { from: '#a0142a', to: '#007a3d' },
  COD: { from: '#0066cc', to: '#ce1021' },
  // Grupo K
  TUR: { from: '#e30a17', to: '#b00610' },
  SVK: { from: '#0b4ea2', to: '#c8102e' },
  CMR: { from: '#007a3d', to: '#ce1126' },
  NZL: { from: '#151515', to: '#00247d' },
  // Grupo L
  ITA: { from: '#0066b2', to: '#003f7d' },
  CIV: { from: '#e07b0c', to: '#009e60' },
  JOR: { from: '#1a1a1a', to: '#ce1126' },
  EGY: { from: '#ce1126', to: '#1a1a1a' },
};

const DEFAULT: TeamColor = { from: '#1e293b', to: '#334155' };

export function getTeamColor(sectionId: string): TeamColor {
  return TEAM_COLORS[sectionId] ?? DEFAULT;
}
