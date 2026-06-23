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

  // Name (inside the top banner) - X and Y adjusted for visual centering
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 32px ${SANS}`;
  const displayName = (data.name || 'Meu álbum').slice(0, 14);
  ctx.fillText(displayName, W / 2, 110);

  // Stat numbers inside the empty box at the top of each card.
  const chips: [number, string, string][] = [
    [111, `${data.have}`, '#ffffff'],
    [264, `${data.missing}`, '#ffb3b3'],
    [422, `${data.duplicates}`, '#ffd54a'],
    [577, `${data.special}`, '#ffe08a'],
  ];
  ctx.lineJoin = 'round';
  for (const [cx, value, color] of chips) {
    ctx.font = `800 ${value.length > 3 ? 30 : 36}px ${SANS}`;
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#08182f';
    ctx.strokeText(value, cx, 791);
    ctx.fillStyle = color;
    ctx.fillText(value, cx, 791);
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

  // Progress banner - Expanded to fill the container area perfectly
  ctx.fillStyle = '#062029';
  roundRect(ctx, 38, 1250, 614, 168, 22);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(244,198,74,0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 38, 1250, 614, 168, 22);
  ctx.stroke();
  
  ctx.fillStyle = '#f4c64a';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText(`${pct}% DO ÁLBUM COMPLETO`, 344, 1300);
  
  // Background track for the progress bar
  ctx.fillStyle = '#0a1a24';
  roundRect(ctx, 88, 1350, 500, 20, 10);
  ctx.fill();
  
  // Progress fill with gradient
  const barGrad = ctx.createLinearGradient(0, 1350, 0, 1305);
  barGrad.addColorStop(0, '#ffe9a3');
  barGrad.addColorStop(1, '#d98a12');
  ctx.fillStyle = barGrad;
  
  // Render filled progress based on the new total width (488px)
  roundRect(ctx, 88, 1350, Math.max(20, (500 * pct) / 100), 20, 10);
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
