import { useRef, useEffect, useState } from 'react';

interface Settings {
  starCount: number;
  connectDist: number;
  speed: number;
  hue: number;
  mouseRadius: number;
  attract: boolean;
}

const DEFAULTS: Settings = {
  starCount: 110,
  connectDist: 160,
  speed: 1.0,
  hue: 215,
  mouseRadius: 150,
  attract: false,
};

interface Star {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  phase: number;
}

interface Wave {
  x: number; y: number;
  born: number;
}

function makeStars(w: number, h: number, count: number, speed: number): Star[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const spd = (0.12 + Math.random() * 0.32) * speed;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r: 1.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

export default function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const wavesRef = useRef<Wave[]>([]);
  const dragRef = useRef<{ idx: number; prevX: number; prevY: number; vx: number; vy: number } | null>(null);
  const settingsRef = useRef<Settings>(DEFAULTS);

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [showSettings, setShowSettings] = useState(false);

  const update = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
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

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        if (dragRef.current?.idx === i) continue;

        if (mActive) {
          const dx = st.x - mx, dy = st.y - my;
          const d = Math.hypot(dx, dy);
          if (d < s.mouseRadius && d > 0) {
            const strength = (1 - d / s.mouseRadius) * 1.4;
            const dir = s.attract ? -1 : 1;
            st.vx += (dx / d) * strength * dir * 0.14;
            st.vy += (dy / d) * strength * dir * 0.14;
          }
        }

        for (const w of wavesRef.current) {
          const elapsed = ts - w.born;
          const wR = Math.max(0, elapsed * 0.38);
          const dx = st.x - w.x, dy = st.y - w.y;
          const d = Math.hypot(dx, dy);
          const ring = Math.abs(d - wR);
          if (ring < 40 && d > 0) {
            const force = (1 - ring / 40) * 4;
            st.vx += (dx / d) * force;
            st.vy += (dy / d) * force;
          }
        }

        const spd = Math.hypot(st.vx, st.vy);
        const maxSpd = 3.5 * s.speed;
        if (spd > maxSpd) { st.vx = (st.vx / spd) * maxSpd; st.vy = (st.vy / spd) * maxSpd; }
        st.vx *= 0.991;
        st.vy *= 0.991;

        st.x += st.vx;
        st.y += st.vy;

        if (st.x < 0)  { st.x = 0;  st.vx =  Math.abs(st.vx); }
        if (st.x > W)  { st.x = W;  st.vx = -Math.abs(st.vx); }
        if (st.y < 0)  { st.y = 0;  st.vy =  Math.abs(st.vy); }
        if (st.y > H)  { st.y = H;  st.vy = -Math.abs(st.vy); }
      }

      wavesRef.current = wavesRef.current.filter(w => ts - w.born < 2800);

      const hue = s.hue;
      const cd = s.connectDist;

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i], b = stars[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d >= cd) continue;

          let op = (1 - d / cd) * 0.5;

          const aNear = mActive && Math.hypot(a.x - mx, a.y - my) < s.mouseRadius;
          const bNear = mActive && Math.hypot(b.x - mx, b.y - my) < s.mouseRadius;
          if (aNear || bNear) op = Math.min(0.95, op * 3);

          for (const w of wavesRef.current) {
            const wR = Math.max(0, (ts - w.born) * 0.38);
            const mx2 = (a.x + b.x) / 2, my2 = (a.y + b.y) / 2;
            const md = Math.hypot(mx2 - w.x, my2 - w.y);
            if (Math.abs(md - wR) < 55) op = Math.min(0.98, op + (1 - Math.abs(md - wR) / 55) * 0.75);
          }

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${hue},72%,76%,${op})`;
          ctx.lineWidth = op > 0.55 ? 1.6 : 0.8;
          ctx.stroke();
        }

        if (mActive) {
          const dx = stars[i].x - mx, dy = stars[i].y - my;
          const d = Math.hypot(dx, dy);
          const cursorR = s.mouseRadius * 0.72;
          if (d < cursorR) {
            const op = (1 - d / cursorR) * 0.92;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(stars[i].x, stars[i].y);
            ctx.strokeStyle = `hsla(${hue},85%,88%,${op})`;
            ctx.lineWidth = op > 0.6 ? 1.6 : 0.9;
            ctx.stroke();
          }
        }
      }

      for (const w of wavesRef.current) {
        const elapsed = ts - w.born;
        const wR = Math.max(0, elapsed * 0.38);
        const wOp = Math.max(0, 1 - elapsed / 2800) * 0.55;
        if (wOp <= 0.01 || wR <= 0) continue;
        ctx.beginPath();
        ctx.arc(w.x, w.y, wR, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue},88%,92%,${wOp})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const pulse = 0.5 + 0.5 * Math.sin(ts * 0.0014 + st.phase);
        const isDragged = dragRef.current?.idx === i;
        const dMouse = mActive ? Math.hypot(st.x - mx, st.y - my) : 9999;
        const isNear = dMouse < s.mouseRadius;

        const glowA = isDragged ? 1 : isNear ? 0.75 + 0.25 * pulse : 0.22 + 0.18 * pulse;
        const starR  = isDragged ? st.r * 2.5 : isNear ? st.r * 1.7 : st.r;
        const glowR  = starR * 5.5;

        const g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, glowR);
        g.addColorStop(0,   `hsla(${hue},80%,96%,${glowA * 0.65})`);
        g.addColorStop(0.4, `hsla(${hue},70%,82%,${glowA * 0.18})`);
        g.addColorStop(1,   `hsla(${hue},60%,72%,0)`);
        ctx.beginPath();
        ctx.arc(st.x, st.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(st.x, st.y, starR, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},45%,98%,1)`;
        ctx.fill();
      }

      if (mActive) {
        const cp = 0.65 + 0.35 * Math.sin(ts * 0.004);
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, 12);
        cg.addColorStop(0, `hsla(${hue},90%,96%,${cp})`);
        cg.addColorStop(1, `hsla(${hue},80%,82%,0)`);
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
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
  }, [settings.starCount, settings.speed]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
      if (!dragRef.current) return;
      const dr = dragRef.current;
      const dx = e.clientX - dr.prevX, dy = e.clientY - dr.prevY;
      dr.vx = dx * 0.65 + dr.vx * 0.35;
      dr.vy = dy * 0.65 + dr.vy * 0.35;
      dr.prevX = e.clientX; dr.prevY = e.clientY;
      const st = starsRef.current[dr.idx];
      st.x = e.clientX; st.y = e.clientY;
    };

    const onDown = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.closest('button,a,input,select,textarea,[role="button"]')) return;
      const stars = starsRef.current;
      let best = -1, bestD = 48;
      for (let i = 0; i < stars.length; i++) {
        const d = Math.hypot(stars[i].x - e.clientX, stars[i].y - e.clientY);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best >= 0) dragRef.current = { idx: best, prevX: e.clientX, prevY: e.clientY, vx: 0, vy: 0 };
    };

    const onUp = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      const isInteractive = tgt.closest('button,a,input,select,textarea,[role="button"]');
      if (dragRef.current) {
        const st = starsRef.current[dragRef.current.idx];
        st.vx = dragRef.current.vx * 0.45;
        st.vy = dragRef.current.vy * 0.45;
        dragRef.current = null;
      } else if (!isInteractive) {
        wavesRef.current.push({ x: e.clientX, y: e.clientY, born: performance.now() });
      }
    };

    const onLeave = () => {
      mouseRef.current.active = false;
      if (dragRef.current) {
        const st = starsRef.current[dragRef.current.idx];
        st.vx = dragRef.current.vx * 0.45;
        st.vy = dragRef.current.vy * 0.45;
        dragRef.current = null;
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
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
        {showSettings && (
          <div className="cs-panel">
            <div className="cs-title">// Background</div>

            <div className="cs-row">
              <label className="cs-label">Stars <span>{settings.starCount}</span></label>
              <input type="range" className="cs-slider" min="30" max="220" value={settings.starCount}
                onChange={e => update('starCount', +e.target.value)} />
            </div>

            <div className="cs-row">
              <label className="cs-label">Connect Distance <span>{settings.connectDist}px</span></label>
              <input type="range" className="cs-slider" min="60" max="300" value={settings.connectDist}
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

            <div className="cs-hint">click anywhere to send a shockwave<br/>drag stars to fling them</div>
          </div>
        )}

        <button
          className="canvas-ctrl-btn"
          onClick={() => setShowSettings(v => !v)}
          title="Background settings"
          style={{ fontSize: '15px' }}
        >
          {showSettings ? '✕' : '⚙'}
        </button>
      </div>
    </>
  );
}
