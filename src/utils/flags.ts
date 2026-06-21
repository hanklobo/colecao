// Maps section IDs to ISO 3166-1 alpha-2 flag codes for flagcdn.com
const FLAG_CODES: Record<string, string> = {
  USA: 'us', URU: 'uy', PAN: 'pa', BOL: 'bo',
  ARG: 'ar', JAM: 'jm', ROM: 'ro', DZA: 'dz',
  BRA: 'br', MEX: 'mx', AUS: 'au', TUN: 'tn',
  FRA: 'fr', MAR: 'ma', JPN: 'jp', ECU: 'ec',
  ESP: 'es', COL: 'co', KOR: 'kr', CAN: 'ca',
  GER: 'de', CRO: 'hr', SEN: 'sn', IRN: 'ir',
  ENG: 'gb-eng', NED: 'nl', NGA: 'ng', VEN: 've',
  POR: 'pt', DEN: 'dk', GHA: 'gh', KSA: 'sa',
  BEL: 'be', SRB: 'rs', HON: 'hn', UZB: 'uz',
  AUT: 'at', SUI: 'ch', IRQ: 'iq', COD: 'cd',
  TUR: 'tr', SVK: 'sk', CMR: 'cm', NZL: 'nz',
  ITA: 'it', CIV: 'ci', JOR: 'jo', EGY: 'eg',
};

export function getFlagUrl(sectionId: string, width: 40 | 80 | 160 = 80): string | null {
  const code = FLAG_CODES[sectionId];
  if (!code) return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}
