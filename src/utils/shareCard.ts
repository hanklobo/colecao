// Generates a shareable progress card as a PNG using the Canvas API.
// Fully self-contained — no external images, so the canvas never taints.

export interface CardData {
  name: string;
  have: number;
  total: number;
  duplicates: number;
  missing: number;
  badges: number;
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

export function generateProgressCard(data: CardData): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  const pct = Math.round((data.have / data.total) * 100);

  // Background gradient (navy → blue)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b2e6b');
  bg.addColorStop(1, '#1a73e8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Header
  ctx.font = '800 46px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('⚽  COLEÇÃO COPA 2026', W / 2, 130);

  ctx.font = '700 40px Inter, sans-serif';
  ctx.fillStyle = '#f4b400';
  ctx.fillText(data.name || 'Meu álbum', W / 2, 195);

  // Progress ring
  const cx = W / 2;
  const cy = 555;
  const radius = 230;
  const lineW = 46;
  ctx.lineCap = 'round';

  // track
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = lineW;
  ctx.stroke();

  // progress
  const start = -Math.PI / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, start + (Math.PI * 2 * pct) / 100);
  ctx.strokeStyle = '#f4b400';
  ctx.lineWidth = lineW;
  ctx.stroke();

  // center %
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 200px Inter, sans-serif';
  ctx.fillText(`${pct}`, cx, cy + 50);
  ctx.font = '800 70px Inter, sans-serif';
  ctx.fillStyle = '#f4b400';
  ctx.fillText('%', cx, cy + 130);
  ctx.font = '600 36px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('do álbum completo', cx, cy + 185);

  // Stats row (three pills)
  const stats: [string, string, string][] = [
    [`${data.have}`, 'tenho', '#ffffff'],
    [`${data.duplicates}`, 'repetidas', '#f4b400'],
    [`${data.missing}`, 'faltam', '#ff8a8a'],
  ];
  const pillW = 300;
  const pillH = 180;
  const gap = 30;
  const totalW = pillW * 3 + gap * 2;
  let px = (W - totalW) / 2;
  const py = 900;
  for (const [value, label, color] of stats) {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, px, py, pillW, pillH, 28);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = '800 80px Inter, sans-serif';
    ctx.fillText(value, px + pillW / 2, py + 95);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 34px Inter, sans-serif';
    ctx.fillText(label, px + pillW / 2, py + 145);
    px += pillW + gap;
  }

  // Badges line
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '700 40px Inter, sans-serif';
  ctx.fillText(`🏅 ${data.badges} conquistas desbloqueadas`, W / 2, 1170);

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 32px Inter, sans-serif';
  ctx.fillText('Monte o seu também · Álbum Panini FIFA World Cup', W / 2, 1270);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

export async function shareProgressCard(data: CardData): Promise<'shared' | 'downloaded' | 'error'> {
  const blob = await generateProgressCard(data);
  if (!blob) return 'error';
  const file = new File([blob], 'meu-progresso-copa2026.png', { type: 'image/png' });

  // Try native share with the image file
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: 'Meu progresso · Copa 2026',
        text: `Já completei ${Math.round((data.have / data.total) * 100)}% do álbum da Copa 2026!`,
      });
      return 'shared';
    } catch {
      return 'error';
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
