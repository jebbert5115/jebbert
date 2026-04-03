import { useState, useEffect, useRef } from 'react';

function isMobileDevice(): boolean {
  return (
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
  );
}

export function MobileWarning() {
  const [phase, setPhase] = useState<'warning' | 'mommy' | 'gone'>('warning');
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visible = phase !== 'gone' && isMobileDevice();

  useEffect(() => {
    if (phase === 'mommy') {
      intervalRef.current = setInterval(() => {
        setCountdown(n => {
          if (n <= 1) {
            clearInterval(intervalRef.current!);
            window.location.href = 'https://www.youtube.com/watch?v=7UrPyTC2pZY';
            return 0;
          }
          return n - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  if (!visible) return null;

  return (
    <div className="mw-backdrop">
      <div className="mw-card">
        {phase === 'warning' && (
          <>
            <div className="mw-frown">:(</div>
            <p className="mw-text">
              It looks like you're on mobile. This site's greatness was designed
              for desktop. If you experience any visual bugs, you were warned.
            </p>
            <div className="mw-buttons">
              <button className="mw-btn mw-btn-accept" onClick={() => setPhase('gone')}>
                I accept the risk
              </button>
              <button className="mw-btn mw-btn-mommy" onClick={() => setPhase('mommy')}>
                I want my mommy
              </button>
            </div>
          </>
        )}

        {phase === 'mommy' && (
          <>
            <div className="mw-frown">🍼</div>
            <p className="mw-text">
              You will now be redirected to a comforting cartoon. Deep breaths,
              you're gonna be okay.
            </p>
            <div className="mw-countdown">{countdown}</div>
          </>
        )}
      </div>
    </div>
  );
}
