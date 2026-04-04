import { useRef, useEffect, useState } from 'react';

interface Settings {
  starCount:   number;
  connectDist: number;
  speed:       number;
  hue:         number;
  mouseRadius: number;
  attract:     boolean;
}

function getDefaults(): Settings {
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
  return {
    starCount:   isMobile ? 30 : 90,
    connectDist: 155,
    speed:       1.0,
    hue:         215,
    mouseRadius: 150,
    attract:     true,
  };
}

interface Star {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  phase: number;
}

const PAINT_LIFE = 9000; // fixed lifetime for all paint stars (ms)

interface PaintStar {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  born:       number; // individual birth time (for physics/cleanup)
  strokeBorn: number; // when this stroke started (all stars in stroke share this)
  strokeId:   number;
}

let _strokeId = 0;

function makeStars(w: number, h: number, count: number, speed: number): Star[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const spd   = (0.12 + Math.random() * 0.32) * speed;
    return {
      x: Math.random() * w, y: Math.random() * h,
      vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
      r: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

export default function ConstellationCanvas() {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const starsRef        = useRef<Star[]>([]);
  const paintStarsRef   = useRef<PaintStar[]>([]);
  const mouseRef        = useRef({ x: -9999, y: -9999, active: false });
  const isPaintingRef   = useRef(false);
  const lastPaintRef    = useRef({ x: -9999, y: -9999 });
  const curStrokeRef    = useRef<number>(-1);
  const strokeBornRef   = useRef<number>(-1);
  const pairOpRef       = useRef<Map<number, number>>(new Map());
  const settingsRef     = useRef<Settings>(getDefaults());

  const [settings, setSettings] = useState<Settings>(() => getDefaults());
  const [showSettings, setShowSettings] = useState(false);

  const update = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const s = settingsRef.current;
      starsRef.current = makeStars(canvas.width, canvas.height, s.starCount, s.speed);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (ts: number) => {
      const s = settingsRef.current;
      const { width: W, height: H } = canvas;
      const stars = starsRef.current;
      const { x: mx, y: my, active: mActive } = mouseRef.current;
      const now = performance.now();

      ctx.clearRect(0, 0, W, H);

      // ── Physics: regular stars ──────────────────────────────
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];

        if (mActive) {
          const dx = st.x - mx, dy = st.y - my;
          const d  = Math.hypot(dx, dy);
          if (d < s.mouseRadius && d > 0) {
            // Taper force to zero inside dead zone (35px) so stars don't pile on cursor
            const deadZone = Math.min(d / 35, 1);
            const strength = (1 - d / s.mouseRadius) * 1.4 * deadZone;
            const dir = s.attract ? -1 : 1;
            st.vx += (dx / d) * strength * dir * 0.065;
            st.vy += (dy / d) * strength * dir * 0.065;
          }
        }

        // Gentle pull toward nearby paint stars (background reacts to drawing)
        if (isPaintingRef.current) {
          for (const ps of paintStarsRef.current) {
            const age = now - ps.born;
            if (age > 800) continue; // only fresh paint attracts
            const dx = ps.x - st.x, dy = ps.y - st.y;
            const d  = Math.hypot(dx, dy);
            if (d < 180 && d > 0) {
              const pull = (1 - d / 180) * 0.08;
              st.vx += (dx / d) * pull;
              st.vy += (dy / d) * pull;
            }
          }
        }

        st.vx += (Math.random() - 0.5) * 0.012 * s.speed;
        st.vy += (Math.random() - 0.5) * 0.012 * s.speed;

        const spd     = Math.hypot(st.vx, st.vy);
        const baseSpd = 0.28 * s.speed;
        const maxSpd  = 3.5  * s.speed;

        if (spd > maxSpd) {
          st.vx = (st.vx / spd) * maxSpd;
          st.vy = (st.vy / spd) * maxSpd;
        } else if (spd > baseSpd) {
          st.vx *= 0.991; st.vy *= 0.991;
        } else if (spd > 0.001) {
          const b = Math.min(baseSpd / spd, 1.04);
          st.vx *= b; st.vy *= b;
        } else {
          const a = Math.random() * Math.PI * 2;
          st.vx = Math.cos(a) * baseSpd; st.vy = Math.sin(a) * baseSpd;
        }

        st.x += st.vx; st.y += st.vy;
        if (st.x < 0) { st.x = 0; st.vx =  Math.abs(st.vx); }
        if (st.x > W) { st.x = W; st.vx = -Math.abs(st.vx); }
        if (st.y < 0) { st.y = 0; st.vy =  Math.abs(st.vy); }
        if (st.y > H) { st.y = H; st.vy = -Math.abs(st.vy); }
      }

      // ── Physics: paint stars ────────────────────────────────
      // Each star has its own born timestamp — tail fades first, head stays longest
      paintStarsRef.current = paintStarsRef.current.filter(ps => now - ps.born < PAINT_LIFE);
      for (const ps of paintStarsRef.current) {
        ps.vx += (Math.random() - 0.5) * 0.006;
        ps.vy += (Math.random() - 0.5) * 0.006;
        ps.vx *= 0.985; ps.vy *= 0.985;
        ps.x += ps.vx; ps.y += ps.vy;
        if (ps.x < 0) { ps.x = 0; ps.vx = Math.abs(ps.vx); }
        if (ps.x > W) { ps.x = W; ps.vx = -Math.abs(ps.vx); }
        if (ps.y < 0) { ps.y = 0; ps.vy = Math.abs(ps.vy); }
        if (ps.y > H) { ps.y = H; ps.vy = -Math.abs(ps.vy); }
      }

      const hue = s.hue;
      const cd  = s.connectDist;

      // ── Per-pair lerped opacity → smooth fade in/out ───────────────
      // Each pair's displayed opacity lerps toward its distance-based target each frame.
      // We render each segment at its EXACT lerped opacity so the neon fades continuously.
      const FADE_RATE = 0.10;   // ~0.4s transition at 60fps
      const EXT_CD    = cd * 1.4; // extra buffer so pairs finish fading after leaving range

      // [x1, y1, x2, y2, renderOp]
      type SegOp = [number, number, number, number, number];
      const segs: SegOp[] = [];

      const pairOp  = pairOpRef.current;
      const visited = new Set<number>();

      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        for (let j = i + 1; j < stars.length; j++) {
          const b   = stars[j];
          const d   = Math.hypot(a.x - b.x, a.y - b.y);
          const key = (i << 9) | j;

          const hasPrev = pairOp.has(key);
          if (d >= EXT_CD && !hasPrev) continue;

          visited.add(key);

          const target = d < cd ? (1 - d / cd) * 0.65 : 0;
          const cur    = hasPrev ? pairOp.get(key)! : 0;
          const next   = cur + (target - cur) * FADE_RATE;

          if (next < 0.003) { pairOp.delete(key); continue; }
          pairOp.set(key, next);

          // Mouse proximity boosts rendered opacity only (not the stored value)
          const aNear    = mActive && Math.hypot(a.x - mx, a.y - my) < s.mouseRadius;
          const bNear    = mActive && Math.hypot(b.x - mx, b.y - my) < s.mouseRadius;
          const renderOp = (aNear || bNear) ? Math.min(0.92, next * 2.6) : next;

          segs.push([a.x, a.y, b.x, b.y, renderOp]);
        }
      }

      // Fade out stored pairs that drifted past EXT_CD this frame
      pairOp.forEach((val, key) => {
        if (visited.has(key)) return;
        const next = val * (1 - FADE_RATE * 2);
        if (next < 0.003) pairOp.delete(key);
        else pairOp.set(key, next);
      });

      // Base lines — per-line opacity, no shadow (strokeStyle changes are cheap)
      ctx.lineWidth = 0.9;
      for (const [x1, y1, x2, y2, op] of segs) {
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(${hue},96%,84%,${op * 0.9})`;
        ctx.lineWidth   = op > 0.45 ? 1.5 : 0.9;
        ctx.stroke();
      }

      // Neon glow pass — shadowBlur set ONCE, only strokeStyle varies per line
      // (changing shadowBlur causes GPU flush; changing strokeStyle does not)
      if (segs.length) {
        ctx.save();
        ctx.shadowBlur  = 14;
        ctx.shadowColor = `hsl(${hue},100%,72%)`;
        ctx.lineWidth   = 1.0;
        for (const [x1, y1, x2, y2, op] of segs) {
          if (op < 0.08) continue; // skip nearly invisible lines
          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(${hue},100%,92%,${op * 0.82})`;
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Draw: cursor connector lines ────────────────────────
      if (mActive) {
        const cursorR = s.mouseRadius * 0.72;
        const curSegs: Seg[] = [];
        for (const st of stars) {
          const d = Math.hypot(st.x - mx, st.y - my);
          if (d < cursorR) curSegs.push([mx, my, st.x, st.y]);
        }
        if (curSegs.length) {
          ctx.save();
          ctx.shadowBlur  = 10;
          ctx.shadowColor = `hsl(${hue},100%,80%)`;
          ctx.beginPath();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `hsla(${hue},100%,92%,0.72)`;
          for (const [x1,y1,x2,y2] of curSegs) { ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); }
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Draw: paint star connections ────────────────────────
      const paint = paintStarsRef.current;
      if (paint.length > 0) {
        // Sequential constellation lines (i → i+1, same stroke) — the "drawing"
        // Collect segments with per-star born → tail fades first, head stays longest
        const allSegs: Array<[number,number,number,number,number]> = [];
        for (let i = 0; i < paint.length - 1; i++) {
          const ps  = paint[i];
          const ps2 = paint[i + 1];
          if (ps.strokeId !== ps2.strokeId) continue;
          // Use the older star's age so the segment dims as its start-point fades
          const op = Math.max(0, 1 - (now - ps.born) / PAINT_LIFE);
          if (op > 0.01) allSegs.push([ps.x, ps.y, ps2.x, ps2.y, op]);
        }

        if (allSegs.length) {
          ctx.save();
          ctx.lineWidth   = 2.2;
          ctx.shadowBlur  = 16;
          ctx.shadowColor = `hsl(${hue},100%,82%)`;
          // Glow pass — each segment gets its own globalAlpha
          for (const [x1,y1,x2,y2,op] of allSegs) {
            ctx.globalAlpha = op;
            ctx.strokeStyle = `hsla(${hue},100%,88%,0.55)`;
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
          }
          // Core line pass
          ctx.lineWidth  = 1.1;
          ctx.shadowBlur = 0;
          for (const [x1,y1,x2,y2,op] of allSegs) {
            ctx.globalAlpha = op;
            ctx.strokeStyle = `hsla(${hue},80%,100%,0.85)`;
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
          }
          ctx.restore();
        }

        // Paint-to-background-star connections (batched)
        const pBgSegs: Seg[] = [];
        for (const ps of paint) {
          const pOp = Math.max(0, 1 - (now - ps.born) / PAINT_LIFE);
          if (pOp < 0.05) continue;
          for (const st of stars) {
            const d = Math.hypot(ps.x - st.x, ps.y - st.y);
            if (d < cd * 0.6) pBgSegs.push([ps.x, ps.y, st.x, st.y]);
          }
        }
        if (pBgSegs.length) {
          ctx.save();
          ctx.shadowBlur  = 10;
          ctx.shadowColor = `hsl(${hue},100%,78%)`;
          ctx.beginPath();
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = `hsla(${hue},95%,85%,0.45)`;
          for (const [x1,y1,x2,y2] of pBgSegs) { ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); }
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Draw: regular star dots ────────────────────────────
      ctx.save();
      ctx.shadowBlur  = 18;
      ctx.shadowColor = `hsl(${hue},100%,75%)`;
      for (let i = 0; i < stars.length; i++) {
        const st     = stars[i];
        const pulse  = 0.5 + 0.5 * Math.sin(ts * 0.0014 + st.phase);
        const dMouse = mActive ? Math.hypot(st.x - mx, st.y - my) : 9999;
        const isNear = dMouse < s.mouseRadius;

        const glowA = isNear ? 0.9 + 0.1 * pulse : 0.45 + 0.3 * pulse;
        const starR  = isNear ? st.r * 1.8 : st.r;
        const glowR  = starR * 7;

        const g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, glowR);
        g.addColorStop(0,    `hsla(${hue},95%,98%,${glowA * 0.85})`);
        g.addColorStop(0.35, `hsla(${hue},90%,85%,${glowA * 0.35})`);
        g.addColorStop(1,    `hsla(${hue},80%,70%,0)`);
        ctx.beginPath();
        ctx.arc(st.x, st.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(st.x, st.y, starR, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},60%,100%,1)`;
        ctx.fill();
      }
      ctx.restore();

      // ── Draw: paint star dots ─────────────────────────────
      if (paint.length > 0) {
        ctx.save();
        ctx.shadowBlur  = 20;
        ctx.shadowColor = `hsl(${hue},100%,88%)`;
        for (const ps of paint) {
          const pOp  = Math.max(0, 1 - (now - ps.born) / PAINT_LIFE);
          if (pOp < 0.02) continue;
          const starR = ps.r * (0.7 + 0.3 * pOp);
          const glowR = starR * 9 * pOp;
          if (glowR <= 0) continue;

          const g = ctx.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, glowR);
          g.addColorStop(0,   `hsla(${hue},100%,100%,${pOp})`);
          g.addColorStop(0.4, `hsla(${hue},95%,85%,${pOp * 0.4})`);
          g.addColorStop(1,   `hsla(${hue},85%,70%,0)`);
          ctx.beginPath();
          ctx.arc(ps.x, ps.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ps.x, ps.y, starR, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},60%,100%,${pOp})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // ── Cursor glow ───────────────────────────────────────
      if (mActive) {
        ctx.save();
        ctx.shadowBlur  = 18;
        ctx.shadowColor = `hsl(${hue},100%,84%)`;
        const cp = 0.8 + 0.2 * Math.sin(ts * 0.004);
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, 14);
        cg.addColorStop(0, `hsla(${hue},100%,100%,${cp})`);
        cg.addColorStop(1, `hsla(${hue},88%,80%,0)`);
        ctx.beginPath();
        ctx.arc(mx, my, 14, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    starsRef.current = makeStars(canvas.width, canvas.height, settings.starCount, settings.speed);
    pairOpRef.current.clear();
  }, [settings.starCount, settings.speed]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      if (isPaintingRef.current) {
        const lp   = lastPaintRef.current;
        const dist = Math.hypot(e.clientX - lp.x, e.clientY - lp.y);
        if (dist >= 10 && paintStarsRef.current.length < 250) {
          const dirX = (e.clientX - lp.x) / dist;
          const dirY = (e.clientY - lp.y) / dist;
          paintStarsRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 4,
            y: e.clientY + (Math.random() - 0.5) * 4,
            vx: dirX * 0.35 + (Math.random() - 0.5) * 0.4,
            vy: dirY * 0.35 + (Math.random() - 0.5) * 0.4,
            r:    1.8 + Math.random() * 2.2,
            born:       performance.now(),
            strokeBorn: strokeBornRef.current,
            strokeId:   curStrokeRef.current,
          });
          lastPaintRef.current = { x: e.clientX, y: e.clientY };
        }
      }
    };

    const onDown = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.closest('button,a,input,select,textarea,[role="button"]')) return;

      isPaintingRef.current = true;
      curStrokeRef.current  = ++_strokeId;
      strokeBornRef.current = performance.now();
      lastPaintRef.current  = { x: e.clientX, y: e.clientY };
      if (paintStarsRef.current.length < 250) {
        paintStarsRef.current.push({
          x: e.clientX, y: e.clientY,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r:        2.0 + Math.random() * 2.2,
          born:       performance.now(),
          strokeBorn: strokeBornRef.current,
          strokeId:   curStrokeRef.current,
        });
      }
    };

    const onUp = () => {
      isPaintingRef.current = false;
    };

    const onLeave = () => {
      mouseRef.current.active = false;
      isPaintingRef.current   = false;
    };

    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mousedown',  onDown);
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      <div className="constellation-controls">
        <button
          className="canvas-ctrl-btn"
          onClick={() => setShowSettings(v => !v)}
          title="Background settings"
          style={{ fontSize: '15px' }}
        >
          {showSettings ? '✕' : '⚙'}
        </button>

        {showSettings && (
          <div className="cs-panel">
            <div className="cs-title">// Background</div>

            <div className="cs-row">
              <label className="cs-label">Stars <span>{settings.starCount}</span></label>
              <input type="range" className="cs-slider" min="30" max="200" value={settings.starCount}
                onChange={e => update('starCount', +e.target.value)} />
            </div>

            <div className="cs-row">
              <label className="cs-label">Connect Distance <span>{settings.connectDist}px</span></label>
              <input type="range" className="cs-slider" min="60" max="400" value={settings.connectDist}
                onChange={e => update('connectDist', +e.target.value)} />
            </div>

            <div className="cs-row">
              <label className="cs-label">Speed <span>{settings.speed.toFixed(1)}×</span></label>
              <input type="range" className="cs-slider" min="1" max="30" value={Math.round(settings.speed * 10)}
                onChange={e => update('speed', +e.target.value / 10)} />
            </div>

            <div className="cs-row">
              <label className="cs-label">Mouse Radius <span>{settings.mouseRadius}px</span></label>
              <input type="range" className="cs-slider" min="40" max="300" value={settings.mouseRadius}
                onChange={e => update('mouseRadius', +e.target.value)} />
            </div>

            <div className="cs-row">
              <label className="cs-label">
                Color <span style={{ color: `hsl(${settings.hue},70%,70%)` }}>●</span>
              </label>
              <div className="cs-hue-track">
                <div className="cs-hue-bar" />
                <input type="range" className="cs-slider cs-hue-slider" min="0" max="359" value={settings.hue}
                  onChange={e => update('hue', +e.target.value)} />
              </div>
            </div>

            <div className="cs-row">
              <label className="cs-label">Mouse Mode</label>
              <div className="cs-toggle">
                <button className={`cs-toggle-btn ${!settings.attract ? 'cs-active' : ''}`}
                  onClick={() => update('attract', false)}>Repel</button>
                <button className={`cs-toggle-btn ${settings.attract ? 'cs-active' : ''}`}
                  onClick={() => update('attract', true)}>Attract</button>
              </div>
            </div>

            <div className="cs-hint">click + drag to draw a constellation<br/>grab a star to fling it</div>
          </div>
        )}
      </div>
    </>
  );
}
