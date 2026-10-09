// Each scene: { name, duration (seconds), setup?(ctx, W, H), draw(ctx, t, W, H) }
// where t is seconds elapsed in the scene. Scenes draw on a fixed 1920x1080 canvas.
import { range, lerp, outCubic, outExpo, inExpo, outBack, outElastic, inOutSine, inOutCubic } from './ease.js';

const params = new URLSearchParams(location.search);
const TITLE = params.get('title') || 'MOTION GRAPHICS';
const SUBTITLE = params.get('subtitle') || 'Made with code';
const ACCENT = params.get('accent') ? '#' + params.get('accent') : '#ff7a3d';
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function clear(ctx, W, H, color = '#0b0d12') {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

// Fades a scene in from / out to black at its edges.
function fadeEdges(ctx, t, dur, W, H, len = 0.5) {
  const a = Math.max(1 - t / len, 1 - (dur - t) / len, 0);
  if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); }
}

// 1. Logo reveal: expanding rings, a wipe, and a tracked-out title.
const logoReveal = {
  name: 'Logo reveal',
  duration: 6,
  draw(ctx, t, W, H) {
    clear(ctx, W, H);
    const cx = W / 2, cy = H / 2;

    for (let i = 0; i < 4; i++) {
      const p = outExpo(range(t, 0.2 + i * 0.15, 2.2 + i * 0.15));
      const fade = 1 - range(t, 2.5, 3.5);
      ctx.strokeStyle = i % 2 ? '#ffffff' : ACCENT;
      ctx.globalAlpha = (1 - p * 0.6) * fade;
      ctx.lineWidth = lerp(30, 2, p);
      ctx.beginPath();
      ctx.arc(cx, cy, lerp(0, 380 + i * 90, p), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Accent bar wipes across, then the title is revealed behind it.
    const wipe = inOutCubic(range(t, 1.4, 2.4));
    const barW = 1100;
    ctx.fillStyle = ACCENT;
    ctx.fillRect(cx - barW / 2, cy + 70, barW * wipe, 10);

    const tp = outCubic(range(t, 1.8, 3.2));
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, cy - 140, W, 200);
    ctx.clip();
    ctx.fillStyle = '#fff';
    ctx.font = `800 120px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = `${lerp(60, 8, tp)}px`;
    ctx.globalAlpha = tp;
    ctx.fillText(TITLE, cx, cy + 40 + lerp(140, 0, tp));
    ctx.restore();

    const sp = outCubic(range(t, 2.6, 3.6));
    ctx.globalAlpha = sp;
    ctx.fillStyle = '#b8c0d0';
    ctx.font = `400 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText(SUBTITLE, cx, cy + 160 + lerp(20, 0, sp));
    ctx.globalAlpha = 1;
    ctx.letterSpacing = '0px';

    fadeEdges(ctx, t, this.duration, W, H);
  },
};

// 2. Kinetic typography: words pop in one by one with overshoot.
const kineticType = {
  name: 'Kinetic type',
  duration: 7,
  words: ['IDEAS', 'IN', 'MOTION', 'TELL', 'BETTER', 'STORIES'],
  draw(ctx, t, W, H) {
    clear(ctx, W, H, '#111421');
    const lines = [this.words.slice(0, 3), this.words.slice(3)];
    ctx.textBaseline = 'middle';
    ctx.font = `900 135px ${FONT}`;
    let idx = 0;
    lines.forEach((line, li) => {
      const widths = line.map((w) => ctx.measureText(w).width);
      const gap = 40;
      const total = widths.reduce((a, b) => a + b, 0) + gap * (line.length - 1);
      let x = (W - total) / 2;
      const y = H / 2 + (li - 0.5) * 190;
      line.forEach((word, wi) => {
        const start = 0.3 + idx * 0.45;
        const p = range(t, start, start + 0.7);
        const s = outBack(p);
        const exit = inExpo(range(t, 5.6 + idx * 0.08, 6.4 + idx * 0.08));
        ctx.save();
        ctx.translate(x + widths[wi] / 2, y - exit * 900 * (li ? -1 : 1));
        ctx.scale(s, s);
        ctx.rotate(lerp(-0.3, 0, outElastic(p)));
        ctx.globalAlpha = Math.min(1, p * 3);
        ctx.fillStyle = idx === 2 || idx === 4 ? ACCENT : '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(word, 0, 0);
        ctx.restore();
        x += widths[wi] + gap;
        idx++;
      });
    });
    fadeEdges(ctx, t, this.duration, W, H, 0.4);
  },
};

// 3. Particle network: drifting points joined by proximity lines.
const particles = {
  name: 'Particle network',
  duration: 8,
  setup(ctx, W, H) {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    this.points = Array.from({ length: 120 }, () => ({
      x: rand() * W, y: rand() * H,
      vx: (rand() - 0.5) * 60, vy: (rand() - 0.5) * 60,
      r: 2 + rand() * 3,
    }));
  },
  draw(ctx, t, W, H) {
    const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
    g.addColorStop(0, '#1a2140');
    g.addColorStop(1, '#07080d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const wrap = (v, m) => ((v % m) + m) % m;
    const pts = this.points.map((p) => ({
      x: wrap(p.x + p.vx * t, W), y: wrap(p.y + p.vy * t, H), r: p.r,
    }));
    const maxD = 220;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          ctx.strokeStyle = `rgba(140,170,255,${(1 - d / maxD) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    pts.forEach((p, i) => {
      ctx.fillStyle = i % 9 === 0 ? ACCENT : '#cfe0ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + 0.3 * Math.sin(t * 3 + i)), 0, Math.PI * 2);
      ctx.fill();
    });

    const tp = outCubic(range(t, 1, 2.2)) * (1 - range(t, 6.5, 7.3));
    ctx.globalAlpha = tp;
    ctx.fillStyle = '#fff';
    ctx.font = `700 90px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Everything is connected', W / 2, H / 2 + lerp(30, 0, tp));
    ctx.globalAlpha = 1;
    fadeEdges(ctx, t, this.duration, W, H);
  },
};

// 4. Geometric loop: a rotating grid of squares driven by a phase wave.
const geoLoop = {
  name: 'Geometric loop',
  duration: 8,
  draw(ctx, t, W, H) {
    clear(ctx, W, H, '#f4efe6');
    const cols = 16, rows = 9, size = W / cols;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * size + size / 2, cy = r * size + size / 2;
        const d = Math.hypot(c - cols / 2 + 0.5, r - rows / 2 + 0.5);
        const phase = inOutSine((Math.sin(t * 1.6 - d * 0.55) + 1) / 2);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(phase * Math.PI / 2);
        const s = size * lerp(0.15, 0.78, phase);
        ctx.fillStyle = (r + c) % 2 ? '#1b1f2a' : ACCENT;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      }
    }
    fadeEdges(ctx, t, this.duration, W, H);
  },
};

// 5. Lower third: broadcast-style name strap that animates in and out.
const lowerThird = {
  name: 'Lower third',
  duration: 6,
  draw(ctx, t, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#2b3a55');
    g.addColorStop(1, '#0d1220');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const inP = outExpo(range(t, 0.4, 1.4));
    const outP = inExpo(range(t, 4.6, 5.4));
    const x = 120, y = H - 300;
    const barW = lerp(0, 820, inP) * (1 - outP);

    ctx.fillStyle = ACCENT;
    ctx.fillRect(x, y, 14, lerp(0, 150, outCubic(range(t, 0.2, 0.8))) * (1 - outP));
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(x + 24, y, barW, 90);
    ctx.fillStyle = 'rgba(15,18,28,0.9)';
    ctx.fillRect(x + 24, y + 96, barW * 0.7, 54);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 24, y, barW, 160);
    ctx.clip();
    const txt = outCubic(range(t, 0.9, 1.7));
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#10131c';
    ctx.font = `800 54px ${FONT}`;
    ctx.fillText(params.get('name') || 'Your Name Here', x + 54 - lerp(40, 0, txt), y + 47);
    ctx.fillStyle = '#e8ecf3';
    ctx.font = `500 30px ${FONT}`;
    ctx.fillText(params.get('role') || 'Title · Organisation', x + 54 - lerp(60, 0, txt), y + 124);
    ctx.restore();
    fadeEdges(ctx, t, this.duration, W, H, 0.3);
  },
};

export const scenes = [logoReveal, kineticType, particles, geoLoop, lowerThird];
