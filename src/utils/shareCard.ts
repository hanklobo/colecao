// Builds the shareable progress card by compositing the live data on top of a
// pre-rendered premium template (public/share-base.png). The template is
// same-origin so the canvas never taints. Canvas is the browser-native tool
// for this kind of image compositing.

export interface CardData {
  name: string;
  have: number;
  total: number;
  duplicates: number;
  missing: number;
  special: number;
  specialTotal: number;
  badges: number;
  badgesTotal: number;
  badgeIcons: string[];
}

const SANS = 'Inter, "Segoe UI", system-ui, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const TEMPLATE = '/share-base.png';
const W = 1080;
const H = 1500;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function generateProgressCard(data: CardData): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const pct = Math.round((data.have / data.total) * 100);

  // Base template (premium chrome). Fallback to a flat navy bg if it fails.
  const base = await loadImage(TEMPLATE);
  if (base) {
    ctx.drawImage(base, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#0a2350';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 52px ${SERIF}`;
  ctx.fillText(data.name || 'Meu álbum', W / 2, 136);

  // Podium %
  ctx.fillStyle = '#fff7e0';
  ctx.font = `800 60px ${SANS}`;
  ctx.fillText(`${pct}%`, W / 2, 748);

  // Progress fill
  const fill = ctx.createLinearGradient(0, 878, 0, 900);
  fill.addColorStop(0, '#ffe9a3');
  fill.addColorStop(0.5, '#e8a417');
  fill.addColorStop(1, '#b06a06');
  ctx.fillStyle = fill;
  roundRect(ctx, 160, 878, Math.max(22, (760 * pct) / 100), 22, 11);
  ctx.fill();

  // Stat numbers (over the template tiles)
  const stats: [number, string, string][] = [
    [180, `${data.have}`, '#ffffff'],
    [420, `${data.missing}`, '#ff9a9a'],
    [660, `${data.duplicates}`, '#ffd54a'],
    [900, `${data.special}/${data.specialTotal}`, '#ffe08a'],
  ];
  for (const [cx, value, color] of stats) {
    ctx.fillStyle = color;
    ctx.font = `800 ${value.length > 4 ? 44 : 56}px ${SANS}`;
    ctx.fillText(value, cx, 1072);
  }

  // Achievements line + earned badge icons
  ctx.fillStyle = '#f4c64a';
  ctx.font = `700 34px ${SERIF}`;
  ctx.fillText(`CONQUISTAS · ${data.badges} de ${data.badgesTotal}`, W / 2, 1208);
  const icons = data.badgeIcons.slice(0, 8);
  if (icons.length) {
    ctx.font = `44px ${SANS}`;
    const step = 78;
    let ix = W / 2 - ((icons.length - 1) * step) / 2;
    for (const ic of icons) {
      ctx.fillText(ic, ix, 1268);
      ix += step;
    }
  }

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

export async function shareProgressCard(data: CardData): Promise<'shared' | 'downloaded' | 'error'> {
  const blob = await generateProgressCard(data);
  if (!blob) return 'error';
  const file = new File([blob], 'meu-progresso-copa2026.png', { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: 'Meu progresso · Copa 2026',
        text: `Já completei ${Math.round((data.have / data.total) * 100)}% do álbum da Copa 2026! Monte o seu: albumcopa.xyz`,
      });
      return 'shared';
    } catch {
      return 'error';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
