import { useEffect, useRef, useState } from 'react';

/* ─── Palette ────────────────────────────────────────────────── */
const PARTICLE_PALETTE: [number, number, number][] = [
  [124,  58, 237],
  [  6, 182, 212],
  [245, 158,  11],
  [ 34, 197,  94],
  [239,  68,  68],
];

const ATTRACTOR_PALETTE: [number, number, number][] = [
  [139,  92, 246],
  [  6, 182, 212],
  [245, 158,  11],
  [ 34, 197,  94],
  [239,  68,  68],
  [236,  72, 153],
];

/* ─── Types ──────────────────────────────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  col: [number, number, number];
}

interface Attractor {
  x: number; y: number;
  col: [number, number, number];
  born: number;
}

/* ─── Constants ──────────────────────────────────────────────── */
const PARTICLE_N    = 520;
const CURSOR_G      = 700;
const ATTRACTOR_G   = 3000;
const MIN_DIST      = 48;
const MAX_SPEED     = 6.5;
const DAMPING       = 0.93;
const TRAIL_ALPHA   = 0.065;
const MAX_ATTRACT   = 6;
const BG            = 'rgba(10,10,15,';

/* ─── Helpers ────────────────────────────────────────────────── */
function spawnParticle(w: number, h: number): Particle {
  return {
    x:   Math.random() * w,
    y:   Math.random() * h,
    vx:  (Math.random() - 0.5) * 0.8,
    vy:  (Math.random() - 0.5) * 0.8,
    col: PARTICLE_PALETTE[(Math.random() * PARTICLE_PALETTE.length) | 0],
  };
}

function pullParticle(
  p: Particle, ax: number, ay: number, G: number,
): void {
  const dx = ax - p.x, dy = ay - p.y;
  const d  = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST);
  const f  = G / (d * d);
  p.vx += (dx / d) * f;
  p.vy += (dy / d) * f;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function FlowFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 5500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;

    const mouse = { x: -9999, y: -9999, on: false };
    const attractors: Attractor[] = [];
    let particles: Particle[]     = [];
    let raf: number;
    let colorIdx = 0;

    /* ── Resize ─────────────────────────────────────────────── */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG + '1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const w = window.innerWidth, h = window.innerHeight;
      particles = Array.from({ length: PARTICLE_N }, () => spawnParticle(w, h));
    }

    /* ── Attractor management ───────────────────────────────── */
    function placeAttractor(x: number, y: number) {
      if (attractors.length >= MAX_ATTRACT) attractors.shift();
      attractors.push({
        x, y,
        col:  ATTRACTOR_PALETTE[colorIdx % ATTRACTOR_PALETTE.length],
        born: performance.now(),
      });
      colorIdx++;
    }

    function removeNearest(x: number, y: number) {
      if (!attractors.length) return;
      let best = 0, bestD = Infinity;
      for (let i = 0; i < attractors.length; i++) {
        const dx = attractors[i].x - x, dy = attractors[i].y - y;
        const d  = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      attractors.splice(best, 1);
    }

    /* ── Events ─────────────────────────────────────────────── */
    const onMove   = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; };
    const onLeave  = ()               => { mouse.on = false; };
    const onClick  = (e: MouseEvent) => { placeAttractor(e.clientX, e.clientY); };
    const onDbl    = (e: MouseEvent) => { e.preventDefault(); removeNearest(e.clientX, e.clientY); };

    resize();
    window.addEventListener('resize',    resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('click',     onClick);
    window.addEventListener('dblclick',  onDbl);

    /* ── Attractor draw ─────────────────────────────────────── */
    function drawAttractor(a: Attractor, now: number) {
      const [r, g, b] = a.col;
      const age   = (now - a.born) / 1800; // ring cycle
      const W     = window.innerWidth;

      // 3 rings expanding outward in a repeating cycle, offset by 1/3 each
      for (let i = 0; i < 3; i++) {
        const phase = (age + i / 3) % 1;
        const rad   = 14 + phase * 50;
        const alpha = (1 - phase) * 0.45;
        ctx.beginPath();
        ctx.arc(a.x, a.y, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      // Glow halo (cheap radial gradient, no shadowBlur)
      const halo = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 28);
      halo.addColorStop(0,   `rgba(${r},${g},${b},0.35)`);
      halo.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 28, 0, Math.PI * 2);
      ctx.fill();

      // Core orb
      const core = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 11);
      core.addColorStop(0,   `rgba(255,255,255,0.9)`);
      core.addColorStop(0.3, `rgba(${r},${g},${b},1)`);
      core.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 11, 0, Math.PI * 2);
      ctx.fill();

      void W; // suppress unused
    }

    /* ── Draw loop ──────────────────────────────────────────── */
    function draw(now: number) {
      const W = window.innerWidth, H = window.innerHeight;

      // Trailing fade
      ctx.fillStyle = BG + TRAIL_ALPHA + ')';
      ctx.fillRect(0, 0, W, H);

      // Attractor orbs (behind particles)
      for (const a of attractors) drawAttractor(a, now);

      // Subtle cursor glow
      if (mouse.on) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 30);
        g.addColorStop(0, 'rgba(255,255,255,0.12)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Particles
      for (const p of particles) {
        // Cursor pull
        if (mouse.on) pullParticle(p, mouse.x, mouse.y, CURSOR_G);

        // Attractor pulls
        for (const a of attractors) pullParticle(p, a.x, a.y, ATTRACTOR_G);

        // Integrate with damping + speed cap
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) { p.vx = p.vx / spd * MAX_SPEED; p.vy = p.vy / spd * MAX_SPEED; }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -12) p.x = W + 12;
        else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12;
        else if (p.y > H + 12) p.y = -12;

        // Draw — size + brightness scale with speed
        const ratio = Math.min(spd / MAX_SPEED, 1);
        const size  = 1.2 + ratio * 2.2;
        const alpha = 0.35 + ratio * 0.6;
        const [r, g, b] = p.col;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
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
      window.removeEventListener('dblclick',   onDbl);
    };
  }, []);

  return (
    <>
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
      <div
        style={{
          position:    'fixed',
          bottom:      '20px',
          left:        '50%',
          transform:   'translateX(-50%)',
          zIndex:      2,
          fontSize:    '8px',
          fontFamily:  'var(--font-accent)',
          color:       'rgba(255,255,255,0.28)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign:   'center',
          pointerEvents: 'none',
          whiteSpace:  'nowrap',
          opacity:     hint ? 1 : 0,
          transition:  'opacity 2s ease',
        }}
      >
        click to place attractor &nbsp;·&nbsp; double-click to remove
      </div>
    </>
  );
}
