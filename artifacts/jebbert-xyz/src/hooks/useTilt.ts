import { RefObject, useEffect } from 'react';

const MAX_TILT   = 12;    // degrees
const PARALLAX   = 6;     // px offset for avatar counter-move
const SHEEN_OPQ  = 0.28;
const LERP       = 0.10;  // interpolation factor per frame (~60fps)
const INNER      = 0.88;  // active tilt zone — outer 12% of each edge is a dead band
const FREEZE_MS  = 480;   // ms to pause tilt after navigation

const SHEEN_COLORS = [
  'rgba(255, 80,  160, 0.22)',
  'rgba(180, 80,  255, 0.22)',
  'rgba(0,   210, 255, 0.18)',
  'rgba(80,  255, 200, 0.16)',
  'rgba(255, 220, 80,  0.16)',
  'rgba(255, 80,  160, 0.22)',
].join(', ');

interface Center { cx: number; cy: number; hw: number; hh: number; }

function getLayoutCenter(card: HTMLElement): Center {
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  let x = 0, y = 0;
  let el: HTMLElement | null = card;
  while (el) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop  - el.scrollTop;
    el = el.offsetParent as HTMLElement | null;
  }
  return {
    cx: x + w / 2 - window.scrollX,
    cy: y + h / 2 - window.scrollY,
    hw: w / 2,
    hh: h / 2,
  };
}

export function useTilt(
  cardRef:    RefObject<HTMLDivElement | null>,
  sheenRef:   RefObject<HTMLDivElement | null>,
  /** Output ref — caller writes nothing; hook populates .current with freeze() */
  freezeRef?: RefObject<(() => void) | null>,
) {
  useEffect(() => {
    const card  = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return;

    let rafId       = 0;
    let hovered     = false;
    let frozenUntil = 0;
    let center: Center | null = null;

    const target  = { dx: 0, dy: 0 };
    const current = { dx: 0, dy: 0 };

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const applyFlat = (withTransition: boolean) => {
      if (withTransition) {
        card.style.transition  = 'transform 350ms cubic-bezier(0.23,1,0.32,1), box-shadow 300ms ease';
        sheen.style.transition = 'opacity 250ms ease-out';
      } else {
        card.style.transition  = '';
        sheen.style.transition = '';
      }
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow = '';
      sheen.style.opacity  = '0';
      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
    };

    // rAF loop — lerps current toward target and writes to DOM
    const tick = () => {
      if (!hovered) return;

      // During freeze: keep flat and wait
      if (Date.now() < frozenUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      // First tick after unfreeze: re-cache center for new card dimensions
      if (!center) center = getLayoutCenter(card);

      current.dx += (target.dx - current.dx) * LERP;
      current.dy += (target.dy - current.dy) * LERP;

      const rotX       = -current.dy * MAX_TILT;
      const rotY       =  current.dx * MAX_TILT;
      const sheenAngle = ((current.dx + current.dy + 2) / 4) * 360;
      const absDy      = Math.abs(current.dy);

      card.style.transition  = '';
      card.style.transform   = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.boxShadow   = `0 ${20 + absDy * 16}px ${60 + absDy * 20}px rgba(0,0,0,0.55), 0 0 32px rgba(157,78,221,0.2)`;

      sheen.style.background = `conic-gradient(from ${sheenAngle}deg at 50% 50%, ${SHEEN_COLORS})`;
      sheen.style.opacity    = String(SHEEN_OPQ);
      sheen.style.transition = '';

      card.style.setProperty('--px', `${-current.dx * PARALLAX}px`);
      card.style.setProperty('--py', `${-current.dy * PARALLAX}px`);

      rafId = requestAnimationFrame(tick);
    };

    const onEnter = () => {
      // Ignore mouseenter during freeze (card is still settling)
      if (Date.now() < frozenUntil) return;
      hovered    = true;
      center     = getLayoutCenter(card);
      current.dx = 0;
      current.dy = 0;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    };

    const mapAxis = (raw: number): number =>
      Math.abs(raw) >= INNER ? 0 : clamp(raw / INNER);

    const onMove = (e: MouseEvent) => {
      if (!center || Date.now() < frozenUntil) return;
      target.dx = mapAxis((e.clientX - center.cx) / center.hw);
      target.dy = mapAxis((e.clientY - center.cy) / center.hh);
    };

    const onLeave = () => {
      hovered   = false;
      center    = null;
      target.dx = 0;
      target.dy = 0;
      cancelAnimationFrame(rafId);
      applyFlat(true);
    };

    const onResize = () => { if (hovered) center = getLayoutCenter(card); };

    // Expose freeze() so SiteLayout can call it on navigation
    const freeze = () => {
      frozenUntil = Date.now() + FREEZE_MS;
      target.dx   = 0;
      target.dy   = 0;
      center      = null; // will re-cache from new dimensions after thaw
      applyFlat(true);
    };
    if (freezeRef) freezeRef.current = freeze;

    card.addEventListener('mouseenter',  onEnter);
    card.addEventListener('mousemove',   onMove);
    card.addEventListener('mouseleave',  onLeave);
    window.addEventListener('resize',    onResize);
    return () => {
      cancelAnimationFrame(rafId);
      if (freezeRef) freezeRef.current = null;
      card.removeEventListener('mouseenter',  onEnter);
      card.removeEventListener('mousemove',   onMove);
      card.removeEventListener('mouseleave',  onLeave);
      window.removeEventListener('resize',    onResize);
    };
  }, [cardRef, sheenRef, freezeRef]);
}
