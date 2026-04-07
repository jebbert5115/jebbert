import { RefObject, useEffect } from 'react';

const MAX_TILT  = 12;
const PARALLAX  = 6;
const SHEEN_OPQ = 0.28;
const LERP      = 0.10;
const INNER     = 0.88;

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
  cardRef:  RefObject<HTMLDivElement | null>,
  sheenRef: RefObject<HTMLDivElement | null>,
  enabled   = true,
) {
  useEffect(() => {
    const card  = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return;

    if (!enabled) {
      card.style.transition  = 'transform 400ms cubic-bezier(0.23,1,0.32,1), box-shadow 300ms ease';
      card.style.transform   = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow   = '';
      sheen.style.transition = 'opacity 250ms ease-out';
      sheen.style.opacity    = '0';
      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
      return;
    }

    let rafId   = 0;
    let hovered = false;
    let center: Center | null = null;

    const target  = { dx: 0, dy: 0 };
    const current = { dx: 0, dy: 0 };

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const tick = () => {
      if (!hovered) return;

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
      if (!center) return;
      target.dx = mapAxis((e.clientX - center.cx) / center.hw);
      target.dy = mapAxis((e.clientY - center.cy) / center.hh);
    };

    const onLeave = () => {
      hovered   = false;
      center    = null;
      target.dx = 0;
      target.dy = 0;
      cancelAnimationFrame(rafId);

      card.style.transition = 'transform 500ms cubic-bezier(0.23,1,0.32,1), box-shadow 400ms ease';
      card.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow  = '';

      sheen.style.transition = 'opacity 350ms ease-out';
      sheen.style.opacity    = '0';

      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
    };

    const onResize = () => { if (hovered) center = getLayoutCenter(card); };

    const flattenCard = () => {
      hovered   = false;
      center    = null;
      target.dx = 0;
      target.dy = 0;
      cancelAnimationFrame(rafId);
      card.style.transition = 'transform 300ms cubic-bezier(0.23,1,0.32,1), box-shadow 250ms ease';
      card.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow  = '';
      sheen.style.transition = 'opacity 250ms ease-out';
      sheen.style.opacity    = '0';
      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
    };

    const nav = document.querySelector('.nav') as HTMLElement | null;

    card.addEventListener('mouseenter',  onEnter);
    card.addEventListener('mousemove',   onMove);
    card.addEventListener('mouseleave',  onLeave);
    nav?.addEventListener('mouseenter',  flattenCard);
    window.addEventListener('resize',    onResize);
    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('mouseenter',  onEnter);
      card.removeEventListener('mousemove',   onMove);
      card.removeEventListener('mouseleave',  onLeave);
      nav?.removeEventListener('mouseenter',  flattenCard);
      window.removeEventListener('resize',    onResize);
    };
  }, [cardRef, sheenRef, enabled]);
}
