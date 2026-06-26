// Formats a fraction as a whole-number percent for *display*.
// The album hits 100% only when every sticker is collected — never round
// 99.5%–99.9% up, since that misleads users into thinking the album is done.
export function displayPct(have: number, total: number): number {
  if (total <= 0) return 0;
  if (have >= total) return 100;
  if (have <= 0) return 0;
  return Math.min(99, Math.floor((have / total) * 100));
}
