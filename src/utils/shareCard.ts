// Builds the shareable progress card by compositing the live data on top of the
// premium template (public/share-base.png, 688x1543). The template is
// same-origin so the canvas never taints. Canvas is the browser-native tool for
// this kind of image compositing.

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

const SANS = 'Inter, "Segoe UI", Arial, system-ui, sans-serif';
const TEMPLATE = '/share-base.png';
const W = 688;
const H = 1543;
const GOLD = 'rgba(244,198,74,0.65)';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
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

  const base = await loadImage(TEMPLATE);
  if (base) {
    ctx.drawImage(base, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#0a2350';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Name (top pill)
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 30px ${SANS}`;
  ctx.fillText(data.name || 'Meu álbum', 360, 60);

  // Stat number chips over the four cards (centers measured on the template)
  const chips: [number, string, string][] = [
    [111, `${data.have}`, '#ffffff'],
    [264, `${data.missing}`, '#ff9a9a'],
    [422, `${data.duplicates}`, '#ffd54a'],
    [577, `${data.special}`, '#ffe08a'],
  ];
  for (const [cx, value, color] of chips) {
    ctx.fillStyle = 'rgba(6,18,42,0.85)';
    roundRect(ctx, cx - 46, 832, 92, 48, 13);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx - 46, 832, 92, 48, 13);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `800 ${value.length > 4 ? 28 : 38}px ${SANS}`;
    ctx.fillText(value, cx, 866);
  }

  // Achievements banner
  ctx.fillStyle = '#0a262e';
  roundRect(ctx, 138, 1049, 412, 46, 23);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 138, 1049, 412, 46, 23);
  ctx.stroke();
  ctx.fillStyle = '#f4c64a';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText(`CONQUISTAS · ${data.badges} / ${data.badgesTotal}`, 344, 1080);

  // Progress banner (covers the template placeholder) with bar
  ctx.fillStyle = '#062029';
  roundRect(ctx, 120, 1238, 448, 80, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,198,74,0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 120, 1238, 448, 80, 22);
  ctx.stroke();
  ctx.fillStyle = '#f4c64a';
  ctx.font = `800 22px ${SANS}`;
  ctx.fillText(`${pct}% DO ÁLBUM COMPLETO`, 344, 1272);
  ctx.fillStyle = '#0a1a24';
  roundRect(ctx, 160, 1288, 368, 16, 8);
  ctx.fill();
  const barGrad = ctx.createLinearGradient(0, 1288, 0, 1304);
  barGrad.addColorStop(0, '#ffe9a3');
  barGrad.addColorStop(1, '#d98a12');
  ctx.fillStyle = barGrad;
  roundRect(ctx, 160, 1288, Math.max(16, (368 * pct) / 100), 16, 8);
  ctx.fill();

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
