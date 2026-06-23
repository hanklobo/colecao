// Section flag codes are already ISO 3166-1 alpha-2 (plus gb-eng / gb-sct),
// matching flagcdn.com, so we build the URL directly.
export function getFlagUrl(
  code: string | undefined,
  width: 40 | 80 | 160 = 80,
): string | null {
  if (!code) return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}
