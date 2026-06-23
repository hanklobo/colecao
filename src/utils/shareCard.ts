// Generates a shareable progress card as a PNG using the Canvas API.
// Self-contained (no external images), so the canvas never taints.

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
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function headline(pct: number): string {
  if (pct >= 100) return 'Álbum completo! Campeão! 🏆';
  if (pct >= 75) return 'Quase lá! 🤩';
  if (pct >= 50) return 'Mais da metade! Bora trocar 🔥';
  if (pct >= 25) return 'Tá voando! 🚀';
  if (pct > 0) return 'A coleção começou! ⚽';
  return 'Bora começar a coleção! ⚽';
}

const FONT = 'Inter, "Segoe UI", system-ui, sans-serif';

export function generateProgressCard(data: CardData): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  const pct = Math.round((data.have / data.total) * 100);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a2a63');
  bg.addColorStop(0.55, '#11459e');
  bg.addColorStop(1, '#1a73e8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Gold glow behind the ring
  const glow = ctx.createRadialGradient(W / 2, 520, 60, W / 2, 520, 460);
  glow.addColorStop(0, 'rgba(244,180,0,0.30)');
  glow.addColorStop(1, 'rgba(244,180,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Confetti
  const confetti: [number, number, number, string][] = [
    [120, 120, 7, '#ffd54a'], [980, 90, 6, '#54c1ff'], [900, 210, 5, '#7CFFB2'],
    [170, 250, 5, '#ff7a7a'], [1010, 330, 6, '#ffd54a'], [70, 360, 6, '#54c1ff'],
    [1000, 470, 5, '#7CFFB2'], [60, 520, 5, '#ff7a7a'],
  ];
  ctx.globalAlpha = 0.5;
  for (const [x, y, r, c] of confetti) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';

  // Header
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('⚽  COLEÇÃO COPA 2026', W / 2, 132);

  // Name
  ctx.font = `800 72px ${FONT}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(data.name || 'Meu álbum', W / 2, 232);

  // Progress ring
  const cx = W / 2;
  const cy = 580;
  const radius = 218;
  const lineW = 54;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = lineW;
  ctx.stroke();

  const ringGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  ringGrad.addColorStop(0, '#ffd54a');
  ringGrad.addColorStop(1, '#e0890a');
  const start = -Math.PI / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, start + (Math.PI * 2 * pct) / 100);
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = lineW;
  ctx.shadowColor = 'rgba(244,180,0,0.55)';
  ctx.shadowBlur = 30;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center %
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 190px ${FONT}`;
  ctx.fillText(`${pct}`, cx - 18, cy + 52);
  ctx.fillStyle = '#ffd54a';
  ctx.font = `800 80px ${FONT}`;
  ctx.fillText('%', cx + Math.max(70, `${pct}`.length * 55), cy + 52);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText('do álbum completo', cx, cy + 116);

  // Headline
  ctx.fillStyle = '#ffd54a';
  ctx.font = `800 46px ${FONT}`;
  ctx.fillText(headline(pct), W / 2, 930);

  // Stat pills
  const pills: [string, string, string][] = [
    [`${data.have}`, 'tenho', '#ffffff'],
    [`${data.missing}`, 'faltam', '#ff9a9a'],
    [`${data.duplicates}`, 'repetidas', '#ffd54a'],
    [`${data.special}/${data.specialTotal}`, '✨ especiais', '#ffe08a'],
  ];
  const pillW = 220;
  const gap = 20;
  const totalW = pillW * 4 + gap * 3;
  let px = (W - totalW) / 2;
  const py = 985;
  for (const [value, label, color] of pills) {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, px, py, pillW, 150, 26);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = `800 ${value.length > 4 ? 50 : 64}px ${FONT}`;
    ctx.fillText(value, px + pillW / 2, py + 82);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `600 30px ${FONT}`;
    ctx.fillText(label, px + pillW / 2, py + 122);
    px += pillW + gap;
  }

  // Badges
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `800 40px ${FONT}`;
  ctx.fillText(`🏅 ${data.badges} de ${data.badgesTotal} conquistas`, W / 2, 1218);

  // Flag stripes
  const stripes = ['#009739', '#75aadb', '#002395', '#aa151b', '#111111', '#c8102e'];
  const sw = 50, sg = 10;
  let sx = (W - (stripes.length * sw + (stripes.length - 1) * sg)) / 2;
  for (const c of stripes) {
    ctx.fillStyle = c;
    roundRect(ctx, sx, 1262, sw, 34, 7);
    ctx.fill();
    sx += sw + sg;
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `700 32px ${FONT}`;
  ctx.fillText('albumcopa.xyz · monte o seu grátis', W / 2, 1332);

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
