import { RefObject, useEffect } from 'react';

const MAX_TILT  = 12;  // degrees
const PARALLAX  = 6;   // px offset for avatar counter-move
const SHEEN_OPQ = 0.55;

const SHEEN_COLORS = [
  'rgba(255, 80,  160, 0.45)',
  'rgba(180, 80,  255, 0.45)',
  'rgba(0,   210, 255, 0.40)',
  'rgba(80,  255, 200, 0.35)',
  'rgba(255, 220, 80,  0.35)',
  'rgba(255, 80,  160, 0.45)',
].join(', ');

export function useTilt(
  cardRef:  RefObject<HTMLDivElement | null>,
  sheenRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const card  = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return;

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width  / 2);  // -1 to 1
      const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1

      const rotX = -dy * MAX_TILT;
      const rotY =  dx * MAX_TILT;

      // Map cursor quadrant → conic start angle (0-360)
      const sheenAngle = ((dx + dy + 2) / 4) * 360;

      // Apply tilt (no transition while tracking for immediate response)
      card.style.transition = 'box-shadow 200ms ease';
      card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      card.style.boxShadow  = `0 ${20 + Math.abs(dy) * 16}px ${60 + Math.abs(dy) * 20}px rgba(0,0,0,0.55), 0 0 32px rgba(157,78,221,0.2)`;

      // Conic shimmer sweep
      sheen.style.background = `conic-gradient(from ${sheenAngle}deg at 50% 50%, ${SHEEN_COLORS})`;
      sheen.style.opacity    = String(SHEEN_OPQ);
      sheen.style.transition = '';

      // Avatar parallax via CSS vars (cascade to children)
      card.style.setProperty('--px', `${-dx * PARALLAX}px`);
      card.style.setProperty('--py', `${-dy * PARALLAX}px`);
    };

    const onLeave = () => {
      card.style.transition = 'transform 500ms cubic-bezier(0.23,1,0.32,1), box-shadow 400ms ease';
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow  = '';

      sheen.style.transition = 'opacity 350ms ease-out';
      sheen.style.opacity    = '0';

      card.style.setProperty('--px', '0px');
      card.style.setProperty('--py', '0px');
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, [cardRef, sheenRef]);
}
