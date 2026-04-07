import { RefObject, useEffect } from 'react';

const MAX_TILT  = 12;   // degrees
const PARALLAX  = 6;    // px offset for avatar counter-move
const SHEEN_OPQ = 0.28;
const LERP      = 0.10; // interpolation factor per frame (~60fps)

const SHEEN_COLORS = [
  'rgba(255, 80,  160, 0.22)',
  'rgba(180, 80,  255, 0.22)',
  'rgba(0,   210, 255, 0.18)',
  'rgba(80,  255, 200, 0.16)',
  'rgba(255, 220, 80,  0.16)',
  'rgba(255, 80,  160, 0.22)',
].join(', ');

export function useTilt(
  cardRef:  RefObject<HTMLDivElement | null>,
  sheenRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const card  = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return;

    // Mutable state — never triggers re-renders
    let rafId      = 0;
    let isHovered  = false;
    let cachedRect: DOMRect | null = null;

    const target  = { dx: 0, dy: 0 };
    const current = { dx: 0, dy: 0 };

    // rAF loop: lerp current → target and write to DOM
    const tick = () => {
      if (!isHovered) return;

      current.dx += (target.dx - current.dx) * LERP;
      current.dy += (target.dy - current.dy) * LERP;

      const rotX       = -current.dy * MAX_TILT;
      const rotY       =  current.dx * MAX_TILT;
      const sheenAngle = ((current.dx + current.dy + 2) / 4) * 360;
      const absDy      = Math.abs(current.dy);

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      card.style.boxShadow = `0 ${20 + absDy * 16}px ${60 + absDy * 20}px rgba(0,0,0,0.55), 0 0 32px rgba(157,78,221,0.2)`;

      sheen.style.background = `conic-gradient(from ${sheenAngle}deg at 50% 50%, ${SHEEN_COLORS})`;
      sheen.style.opacity    = String(SHEEN_OPQ);
      sheen.style.transition = '';

      card.style.setProperty('--px', `${-current.dx * PARALLAX}px`);
      card.style.setProperty('--py', `${-current.dy * PARALLAX}px`);

      rafId = requestAnimationFrame(tick);
    };

    // Cache the untransformed rect BEFORE any tilt is applied
    const onEnter = () => {
      isHovered = true;
      // Clear any leftover transition so the rect is unaffected
      card.style.transition = '';
      cachedRect = card.getBoundingClientRect();
      current.dx = 0;
      current.dy = 0;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    };

    // Update target only — rAF loop applies the actual values
    const onMove = (e: MouseEvent) => {
      if (!cachedRect) return;
      const cx = cachedRect.left + cachedRect.width  / 2;
      const cy = cachedRect.top  + cachedRect.height / 2;
      // Clamp to [-1, 1] so corners never overshoot
      target.dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (cachedRect.width  / 2)));
      target.dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (cachedRect.height / 2)));
    };

    const onLeave = () => {
      isHovered = false;
      cancelAnimationFrame(rafId);
      target.dx  = 0;
      target.dy  = 0;
      cachedRect = null;

      card.style.transition = 'transform 500ms cubic-bezier(0.23,1,0.32,1), box-shadow 400ms ease';
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow  = '';

      sheen.style.transition = 'opacity 350ms ease-out';
      sheen.style.opacity    = '0';

      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mousemove',  onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mousemove',  onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, [cardRef, sheenRef]);
}
