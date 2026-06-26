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

// Shield paths — kept identical to src/components/Achievements.tsx so the
// shareable card matches the in-app crest pixel-for-pixel (within scale).
const SHIELD_PATH  = 'M50 4 L92 18 V54 C92 82 73 99 50 106 C27 99 8 82 8 54 V18 Z';
const SHIELD_INNER = 'M50 14 L84 26 V53 C84 77 68 92 50 99 C32 92 16 77 16 53 V26 Z';

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Render an "earned" achievement shield onto the canvas, matching the on-screen
// Shield component (Achievements.tsx) — same gothic shape, fill / rim / shine
// gradients, inner border, sparkle dots, and gold drop-shadow halo. The
// share card only ships earned badges so we don't bother with the locked
// variant; if that ever changes, mirror the grayscale branch from the SVG.
function drawShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  emoji: string,
) {
  const height = width * 1.12;

  ctx.save();
  // Position the 100x110 viewBox so its center lands on (cx, cy).
  ctx.translate(cx - width / 2, cy - height / 2);
  ctx.scale(width / 100, height / 110);

  const shield = new Path2D(SHIELD_PATH);
  const inner  = new Path2D(SHIELD_INNER);

  // 1) Body fill + warm gold halo. The shadow ride-alongs the fill so the
  //    glow leaks out around the silhouette only.
  ctx.shadowColor   = 'rgba(245,158,11,0.70)';
  ctx.shadowBlur    = 14;
  ctx.shadowOffsetY = 3;
  const fillGrad = ctx.createLinearGradient(25, 0, 75, 110);
  fillGrad.addColorStop(0.00, '#fff8c4');
  fillGrad.addColorStop(0.42, '#f59e0b');
  fillGrad.addColorStop(1.00, '#78350f');
  ctx.fillStyle = fillGrad;
  ctx.fill(shield);

  // Drop the shadow for everything stacked on top.
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetY = 0;

  // 2) Rim — gradient stroke from light gold to dark bronze.
  const rimGrad = ctx.createLinearGradient(0, 0, 100, 110);
  rimGrad.addColorStop(0, '#fde68a');
  rimGrad.addColorStop(1, '#92400e');
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth   = 3.5;
  ctx.lineJoin    = 'round';
  ctx.stroke(shield);

  // 3) Diagonal sheen overlay across the shield body.
  const shineGrad = ctx.createLinearGradient(5, 0, 55, 82);
  shineGrad.addColorStop(0.00, 'rgba(255,255,255,0.62)');
  shineGrad.addColorStop(0.55, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = shineGrad;
  ctx.fill(shield);

  // 4) Inner border — quiet white outline a few pixels inside the rim.
  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
  ctx.lineWidth   = 1.4;
  ctx.stroke(inner);

  // 5) Sparkle dots in the top-right quadrant.
  ctx.globalAlpha = 0.95;
  ctx.fillStyle   = '#fef08a';
  circle(ctx, 88, 12, 2.6);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle   = '#fffde7';
  circle(ctx, 81,  6, 1.5);
  ctx.globalAlpha = 0.80;
  ctx.fillStyle   = '#fef08a';
  circle(ctx, 94, 21, 1.8);
  ctx.globalAlpha = 1;

  ctx.restore();

  // 6) Emoji in user space — sized to ~38% of width, shifted up to match the
  //    in-app component's paddingBottom: 9% trick.
  ctx.save();
  ctx.font         = `${Math.round(width * 0.42)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#0b0b0b';
  ctx.fillText(emoji, cx, cy - height * 0.045);
  ctx.restore();
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

  // Percentage overlay on the spiral focal point
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Outer glow ring
  const pctY = 542;
  ctx.shadowColor = 'rgba(244,198,74,0.9)';
  ctx.shadowBlur = 18;
  ctx.font = `900 30px ${SANS}`;
  ctx.strokeStyle = '#08182f';
  ctx.lineWidth = 7;
  ctx.strokeText(`${pct}%`, W / 2, pctY);
  ctx.fillStyle = '#f4c64a';
  ctx.fillText(`${pct}%`, W / 2, pctY);
  ctx.restore();

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
  const badgesX = 38;
  const badgesY = 1060;
  const badgesW = 614;
  const badgesH = 190;
  ctx.fillStyle = '#0a262e';
  roundRect(ctx, badgesX, badgesY, badgesW, badgesH, 23);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  roundRect(ctx, badgesX, badgesY, badgesW, badgesH, 23);
  ctx.stroke();
  ctx.fillStyle = '#f4c64a';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText(`CONQUISTAS · ${data.badges} / ${data.badgesTotal}`, 344, badgesY + 32);

  // Badge shield grid — same gothic crest as the in-app Achievements grid.
  // Up to 2 rows of 8, sized to fit the banner with breathing room for the
  // halo glow (which extends past the silhouette).
  const icons = data.badgeIcons;
  if (icons.length > 0) {
    const PADDING_X = 32;
    const availableW = badgesW - PADDING_X * 2;
    const GAP = 10;
    const ROW_GAP = 10;

    const COLS = Math.min(icons.length, 8);
    const ROWS = Math.ceil(icons.length / COLS);

    // Shield aspect is height = width * 1.12 (matches the SVG component).
    const cwByWidth  = Math.floor((availableW - GAP * (COLS - 1)) / COLS);
    const availableH = badgesH - 40 - (ROWS - 1) * ROW_GAP - 12;
    const cwByHeight = Math.floor(availableH / ROWS / 1.12);
    const CW = Math.min(cwByWidth, cwByHeight, 72);
    const CH = Math.round(CW * 1.12);

    const totalW = COLS * CW + (COLS - 1) * GAP;
    const startX = (W - totalW) / 2 + CW / 2;
    const gridH  = ROWS * CH + (ROWS - 1) * ROW_GAP;
    const gridAreaTop = badgesY + 40;
    const gridAreaH   = badgesH - 40 - 6;
    const startY = gridAreaTop + (gridAreaH - gridH) / 2 + CH / 2;

    for (let i = 0; i < icons.length; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const cx  = startX + col * (CW + GAP);
      const cy  = startY + row * (CH + ROW_GAP);
      drawShield(ctx, cx, cy, CW, icons[i]);
    }
  }

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