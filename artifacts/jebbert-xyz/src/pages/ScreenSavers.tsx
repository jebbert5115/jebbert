import { useState, useEffect, useRef } from 'react';
import ConstellationCanvas from '../components/ConstellationCanvas';

function isMobile(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
}

interface Screensaver {
  id: string;
  name: string;
  description: string;
  available: boolean;
  component?: React.ReactNode;
}

const SCREENSAVERS: Screensaver[] = [
  {
    id: 'constellation',
    name: 'Constellation',
    description: 'Drifting stars with neon connections. Click and drag to draw your own constellations.',
    available: true,
  },
  {
    id: 'coming-soon-1',
    name: '???',
    description: 'Coming soon.',
    available: false,
  },
  {
    id: 'coming-soon-2',
    name: '???',
    description: 'Coming soon.',
    available: false,
  },
];

function ConstellationPreview({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="ss-card" onClick={onLaunch} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onLaunch()}>
      <div className="ss-preview-wrap">
        <ConstellationCanvas preview />
        <div className="ss-preview-overlay">
          <span className="ss-launch-label">▶ Launch</span>
        </div>
      </div>
      <div className="ss-card-body">
        <div className="ss-card-name">Constellation</div>
        <div className="ss-card-desc">
          Drifting stars with neon connections. Click and drag to draw your own constellations.
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({ name }: { name: string }) {
  return (
    <div className="ss-card ss-card--soon">
      <div className="ss-preview-wrap ss-preview-wrap--soon">
        <span className="ss-soon-text">coming soon</span>
      </div>
      <div className="ss-card-body">
        <div className="ss-card-name">{name}</div>
      </div>
    </div>
  );
}

function FullscreenSaver({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.requestFullscreen().then(() => setIsFs(true)).catch(() => {});
    const onFsChange = () => {
      if (!document.fullscreenElement) onClose();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [onClose]);

  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else onClose();
  };

  return (
    <div ref={containerRef} className="ss-fullscreen">
      <ConstellationCanvas />
      <button className="ss-exit-btn" onClick={exit} title="Exit screensaver (ESC)">
        ✕ exit
      </button>
    </div>
  );
}

function MobileDisclaimer() {
  return (
    <div className="ss-mobile-disclaimer">
      <div className="ss-mobile-icon">:(</div>
      <p className="ss-mobile-text">
        Screensavers require a desktop browser and won't work on mobile devices.
        Come back on a real computer.
      </p>
    </div>
  );
}

export default function ScreenSavers() {
  const mobile = isMobile();
  const [activeSaver, setActiveSaver] = useState<string | null>(null);

  if (mobile) {
    return (
      <div className="page-content">
        <div className="section-header">
          <h1 className="section-title">// Screen Savers</h1>
        </div>
        <MobileDisclaimer />
      </div>
    );
  }

  return (
    <div className="page-content">
      {activeSaver === 'constellation' && (
        <FullscreenSaver onClose={() => setActiveSaver(null)} />
      )}

      <div className="section-header">
        <h1 className="section-title">// Screen Savers</h1>
        <p className="section-subtitle">
          click a screensaver to launch it fullscreen. press{' '}
          <kbd className="ss-kbd">ESC</kbd> to exit.
        </p>
      </div>

      <div className="ss-grid">
        <ConstellationPreview onLaunch={() => setActiveSaver('constellation')} />
        {SCREENSAVERS.filter(s => !s.available).map(s => (
          <ComingSoonCard key={s.id} name={s.name} />
        ))}
      </div>
    </div>
  );
}
