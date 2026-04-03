import { useEffect, useRef } from 'react';

/* ─── Perlin noise ──────────────────────────────────────────── */
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
    lerp(grad(perm[a], xf, yf),     grad(perm[b], xf - 1, yf), u),
    lerp(grad(perm[a + 1], xf, yf - 1), grad(perm[b + 1], xf - 1, yf - 1), u),
    v,
  );
}

/* ─── Constants ─────────────────────────────────────────────── */
const TWO_PI       = Math.PI * 2;
const FIELD_SCALE  = 0.0025;
const TIME_SCALE   = 0.00022;
const FORCE        = 0.13;
const DAMPING      = 0.91;
const MAX_SPEED    = 2.2;
const VORTEX_R     = 130;
const BURST_R      = 160;
const BURST_MS     = 700;
const TRAIL_ALPHA  = 0.11;
const BG           = 'rgba(10,10,15,';

const PALETTE: [number, number, number][] = [
  [124,  58, 237],  // accent-1 purple
  [  6, 182, 212],  // accent-2 cyan
  [245, 158,  11],  // accent-3 amber
  [ 90,  40, 180],  // deeper purple
  [  0, 140, 180],  // deep cyan
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
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0, vy: 0,
    col: PALETTE[(Math.random() * PALETTE.length) | 0],
    life: 0,
    maxLife: 250 + (Math.random() * 350) | 0,
  };
}

/* ─── Component ─────────────────────────────────────────────── */
export default function FlowFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;

    const mouse  = { x: -9999, y: -9999, on: false };
    let burst: { x: number; y: number; at: number } | null = null;
    let raf: number;
    let t = 0;
    let particles: P[] = [];
    let last = performance.now();

    /* Resize — keeps canvas pixel-perfect without DPR blur */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* Repopulate — target 1 particle per ~1800px², capped */
      const n = Math.min(900, Math.max(250,
        (window.innerWidth * window.innerHeight / 1800) | 0,
      ));
      particles = Array.from({ length: n }, () =>
        spawn(window.innerWidth, window.innerHeight),
      );
      /* Paint solid bg immediately so dot-grid doesn't flash */
      ctx.fillStyle = BG + '1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    resize();

    /* Event listeners on window (canvas is pointer-events:none) */
    function onMove(e: MouseEvent) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }
    function onLeave()              { mouse.on = false; }
    function onClick(e: MouseEvent) {
      burst = { x: e.clientX, y: e.clientY, at: performance.now() };
    }

    window.addEventListener('resize',      resize);
    window.addEventListener('mousemove',   onMove);
    window.addEventListener('mouseleave',  onLeave);
    window.addEventListener('click',       onClick);

    /* ─── Main loop ─────────────────────────────────────────── */
    function draw(now: number) {
      const dt = Math.min(now - last, 32);
      last = now;
      t += dt * TIME_SCALE;

      const W = window.innerWidth, H = window.innerHeight;

      /* Trail fade — gives motion-blur feel */
      ctx.fillStyle = BG + TRAIL_ALPHA + ')';
      ctx.fillRect(0, 0, W, H);

      const burstAge  = burst ? now - burst.at : Infinity;
      const burstLive = burstAge < BURST_MS;

      for (const p of particles) {
        /* Flow field angle from 2 noise octaves */
        const ang =
          noise(p.x * FIELD_SCALE + t, p.y * FIELD_SCALE) * TWO_PI * 3 +
          noise(p.x * FIELD_SCALE * 2 - t * 0.6, p.y * FIELD_SCALE * 2) * Math.PI;

        p.vx += Math.cos(ang) * FORCE;
        p.vy += Math.sin(ang) * FORCE;

        /* Mouse vortex — tangential rotation around cursor */
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < VORTEX_R * VORTEX_R && d2 > 1) {
            const d = Math.sqrt(d2);
            const s = (1 - d / VORTEX_R) * 2.8;
            p.vx += (-dy / d) * s;
            p.vy +=  (dx / d) * s;
          }
        }

        /* Click burst — outward radial push */
        if (burstLive) {
          const dx = p.x - burst!.x, dy = p.y - burst!.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < BURST_R * BURST_R && d2 > 1) {
            const d = Math.sqrt(d2);
            const s = (1 - d / BURST_R) * (1 - burstAge / BURST_MS) * 5;
            p.vx += (dx / d) * s;
            p.vy += (dy / d) * s;
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

        /* Respawn when dead or out of bounds */
        if (
          p.life >= p.maxLife ||
          p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30
        ) {
          const np = spawn(W, H);
          p.x = np.x; p.y = np.y; p.vx = 0; p.vy = 0;
          p.col = np.col; p.life = 0; p.maxLife = np.maxLife;
          continue;
        }

        /* Alpha envelope — fade in/out at birth and death */
        const age = p.life / p.maxLife;
        const env = age < 0.08
          ? age / 0.08
          : age > 0.9
          ? (1 - age) / 0.1
          : 1;

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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
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
