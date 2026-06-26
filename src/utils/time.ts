// Render a "há X min / h / d" label from a timestamp (ms). Returns "nunca"
// when null. Clamps future timestamps to 0 so clock skew between device
// and server can't produce "há -3 min".
export function formatRelative(ts: number | null | undefined): string {
  if (!ts) return 'nunca';
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return 'agora há pouco';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}
