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

function drawCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = w * 0.22;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h * 0.55);
  ctx.bezierCurveTo(x + w, y + h * 0.82, cx + w * 0.18, y + h * 0.92, cx, y + h);
  ctx.bezierCurveTo(cx - w * 0.18, y + h * 0.92, x, y + h * 0.82, x, y + h * 0.55);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
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

  // Badge crest grid — all earned badges, up to 2 rows of 8, sized to fit
  const icons = data.badgeIcons;
  if (icons.length > 0) {
    const PADDING_X = 28;
    const availableW = badgesW - PADDING_X * 2;
    const GAP = 7;
    const ROW_GAP = 8;

    // Distribute into up to 2 rows of max 8
    const COLS = Math.min(icons.length, 8);
    const ROWS = Math.ceil(icons.length / COLS);

    // Size crests to fit the available width and height
    const cwByWidth = Math.floor((availableW - GAP * (COLS - 1)) / COLS);
    // Available height for crests: banner height minus title area minus padding
    const availableH = badgesH - 40 - (ROWS - 1) * ROW_GAP - 8;
    const cwByHeight = Math.floor((availableH / ROWS) / 1.14); // CH = CW * 1.14
    const CW = Math.min(cwByWidth, cwByHeight, 72);
    const CH = Math.round(CW * 1.14);

    const totalW = COLS * CW + (COLS - 1) * GAP;
    const startX = (W - totalW) / 2 + CW / 2;
    // Vertically center the grid in the remaining space below the title
    const gridH = ROWS * CH + (ROWS - 1) * ROW_GAP;
    const gridAreaTop = badgesY + 40;
    const gridAreaH = badgesH - 40 - 6;
    const startY = gridAreaTop + (gridAreaH - gridH) / 2 + CH / 2;

    for (let i = 0; i < icons.length; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const cx = startX + col * (CW + GAP);
      const cy = startY + row * (CH + ROW_GAP);

      // Glow + background
      ctx.save();
      ctx.shadowColor = 'rgba(244,198,74,0.55)';
      ctx.shadowBlur = 10;
      const bgGrad = ctx.createLinearGradient(cx - CW / 2, cy - CH / 2, cx + CW / 2, cy + CH / 2);
      bgGrad.addColorStop(0, '#0d2235');
      bgGrad.addColorStop(1, '#061520');
      drawCrest(ctx, cx, cy, CW, CH);
      ctx.fillStyle = bgGrad;
      ctx.fill();
      ctx.restore();

      // Gold border
      drawCrest(ctx, cx, cy, CW, CH);
      ctx.strokeStyle = '#f4c64a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner highlight ring
      drawCrest(ctx, cx, cy, CW - 5, CH - 5);
      ctx.strokeStyle = 'rgba(255,233,163,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Emoji — scale font proportionally to crest size
      ctx.save();
      ctx.font = `${Math.round(CW * 0.47)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icons[i], cx, cy - CH * 0.04);
      ctx.restore();
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