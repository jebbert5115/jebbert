import { useEffect, useRef } from 'react';

/* ─── Perlin noise (2D gradient) ─────────────────────────────── */
const perm = (() => {
  const a = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return [...a, ...a];
})();

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function grad(h: number, x: number, y: number) {
  const u = (h & 3) < 2 ? x : y;
  const v = (h & 3) < 2 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}
function noise(x: number, y: number): number {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = fade(xf), v = fade(yf);
  const a = perm[X] + Y, b = perm[X + 1] + Y;
  return lerp(
    lerp(grad(perm[a],     xf,     yf),     grad(perm[b],     xf - 1, yf), u),
    lerp(grad(perm[a + 1], xf,     yf - 1), grad(perm[b + 1], xf - 1, yf - 1), u),
    v,
  );
}

/* Helper: compute the flow angle at a given world position + time */
function flowAngle(px: number, py: number, t: number): number {
  return (
    noise(px * FIELD_SCALE + t,       py * FIELD_SCALE) * TWO_PI * 3 +
    noise(px * FIELD_SCALE * 2 - t * 0.6, py * FIELD_SCALE * 2) * Math.PI
  );
}

/* ─── HSL → RGB ──────────────────────────────────────────────── */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function randomVividColor(): [number, number, number] {
  return hslToRgb(Math.random() * 360, 0.9, 0.55);
}

/* ─── Constants ─────────────────────────────────────────────── */
const TWO_PI      = Math.PI * 2;
const FIELD_SCALE = 0.0025;
const TIME_SCALE  = 0.00022;
const FORCE       = 0.13;
const DAMPING     = 0.91;
const MAX_SPEED   = 2.2;
const VORTEX_R    = 130;
const BURST_R     = 160;
const BURST_MS    = 700;
const TRAIL_ALPHA = 0.11;
const BG          = 'rgba(10,10,15,';

/* Target: 1 particle per ~1800px², clamped to [MIN, MAX] */
const PARTICLE_MIN = 150;
const PARTICLE_MAX = 900;

/* Perf thresholds — reduce count when avg frame time stays above SLOW */
const FT_SLOW     = 22;
const FT_FAST     = 16;
const SLOW_FRAMES = 60;
const TRIM_PCT    = 0.15;
const GROW_PCT    = 0.10;

const PALETTE: [number, number, number][] = [
  [124,  58, 237],
  [  6, 182, 212],
  [245, 158,  11],
  [ 90,  40, 180],
  [  0, 140, 180],
];

/* ─── Particle ───────────────────────────────────────────────── */
interface P {
  x: number; y: number;
  vx: number; vy: number;
  col: [number, number, number];
  life: number; maxLife: number;
}

function spawn(w: number, h: number): P {
  return {
    x: Math.random() * w, y: Math.random() * h,
    vx: 0, vy: 0,
    col: PALETTE[(Math.random() * PALETTE.length) | 0],
    life: 0,
    maxLife: 250 + ((Math.random() * 350) | 0),
  };
}

function targetCount(): number {
  const area = window.innerWidth * window.innerHeight;
  return Math.min(PARTICLE_MAX, Math.max(PARTICLE_MIN, (area / 1800) | 0));
}

/* ─── Component ─────────────────────────────────────────────── */
export default function FlowFieldCanvas() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const clickColorRef = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;

    const mouse = { x: -9999, y: -9999, on: false };
    let burst: { x: number; y: number; at: number } | null = null;
    let raf: number;
    let t = 0;
    let particles: P[] = [];
    let last = performance.now();

    /* ── Performance tracking ─────────────────────────────── */
    let avgFt    = 16.67;
    let slowCnt  = 0;
    let fastCnt  = 0;
    let target   = targetCount();

    /* ── Resize ───────────────────────────────────────────── */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      target = targetCount();
      const w = window.innerWidth, h = window.innerHeight;

      if (particles.length < target) {
        const extra = Array.from(
          { length: target - particles.length },
          () => spawn(w, h),
        );
        particles.push(...extra);
      } else if (particles.length > target) {
        particles.splice(target);
      }

      ctx.fillStyle = BG + '1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    /* ── Window events ────────────────────────────────────── */
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; };
    const onLeave = ()               => { mouse.on = false; };
    const onClick = (e: MouseEvent) => {
      /* Pick a fresh vivid color for this click */
      clickColorRef.current = randomVividColor();
      burst = { x: e.clientX, y: e.clientY, at: performance.now() };
    };

    resize();
    window.addEventListener('resize',     resize);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('click',      onClick);

    /* ── Draw loop ────────────────────────────────────────── */
    function draw(now: number) {
      const dt = Math.min(now - last, 50);
      last = now;

      avgFt = avgFt * 0.92 + dt * 0.08;

      if (avgFt > FT_SLOW) {
        slowCnt++;
        fastCnt = 0;
        if (slowCnt >= SLOW_FRAMES && particles.length > PARTICLE_MIN) {
          const remove = Math.max(1, Math.ceil(particles.length * TRIM_PCT));
          particles.splice(particles.length - remove, remove);
          slowCnt = 0;
        }
      } else if (avgFt < FT_FAST) {
        fastCnt++;
        slowCnt = 0;
        if (fastCnt >= SLOW_FRAMES && particles.length < target) {
          const add = Math.min(
            Math.ceil(target * GROW_PCT),
            target - particles.length,
          );
          for (let i = 0; i < add; i++) {
            particles.push(spawn(window.innerWidth, window.innerHeight));
          }
          fastCnt = 0;
        }
      } else {
        slowCnt = 0;
        fastCnt = 0;
      }

      t += dt * TIME_SCALE;

      const W = window.innerWidth, H = window.innerHeight;

      ctx.fillStyle = BG + TRAIL_ALPHA + ')';
      ctx.fillRect(0, 0, W, H);

      const burstAge  = burst ? now - burst.at : Infinity;
      const burstLive = burstAge < BURST_MS;

      for (const p of particles) {
        /* Flow field */
        const ang = flowAngle(p.x, p.y, t);
        p.vx += Math.cos(ang) * FORCE;
        p.vy += Math.sin(ang) * FORCE;

        /* Mouse vortex */
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < VORTEX_R * VORTEX_R && d2 > 0.1) {
            const d = Math.sqrt(d2);
            const s = (1 - d / VORTEX_R) * 2.8;
            p.vx += (-dy / d) * s;
            p.vy +=  (dx / d) * s;
          }
        }

        /* Click burst: reverse direction + recolor nearby particles */
        if (burstLive) {
          const dx = p.x - burst!.x, dy = p.y - burst!.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < BURST_R * BURST_R) {
            const d         = Math.sqrt(Math.max(d2, 0.1));
            const proximity = 1 - d / BURST_R;
            const decay     = Math.max(0, 1 - burstAge / BURST_MS);
            const s         = proximity * decay;

            /* Oppose current velocity */
            p.vx -= p.vx * s * 0.45;
            p.vy -= p.vy * s * 0.45;

            /* Anti-flow force */
            const fa = flowAngle(p.x, p.y, t);
            p.vx -= Math.cos(fa) * s * FORCE * 6;
            p.vy -= Math.sin(fa) * s * FORCE * 6;

            /* Recolor particle to the click color */
            if (clickColorRef.current) {
              p.col = clickColorRef.current;
            }
          }
        }

        /* Integrate */
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) { p.vx = p.vx / spd * MAX_SPEED; p.vy = p.vy / spd * MAX_SPEED; }
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        /* Respawn when out of bounds or lifetime exhausted */
        if (
          p.life >= p.maxLife ||
          p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30
        ) {
          const np = spawn(W, H);
          p.x = np.x; p.y = np.y; p.vx = 0; p.vy = 0;
          p.col = np.col; p.life = 0; p.maxLife = np.maxLife;
          continue;
        }

        /* Alpha envelope */
        const age = p.life / p.maxLife;
        const env = age < 0.08 ? age / 0.08 : age > 0.9 ? (1 - age) / 0.1 : 1;

        const [r, g, b] = p.col;
        ctx.fillStyle = `rgba(${r},${g},${b},${(env * 0.55).toFixed(2)})`;
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('click',      onClick);
      /* clickColorRef.current resets to null on next mount automatically */
      clickColorRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="flow-field-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
