import { useRef, useState, useCallback } from 'react';
import { Link, useLocation, Switch, Route } from 'wouter';
import { useLanyard } from '../hooks/useLanyard';
import DiscordProfile from './DiscordProfile';
import { SpotifyCard } from './SpotifyCard';
import { GameCard } from './GameCard';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import Secret from '../pages/Secret';

interface Tilt {
  rx: number; ry: number; active: boolean;
}

export function SiteLayout() {
  const [location] = useLocation();
  const { data, loading, avatarUrl, avatarFallback } = useLanyard();
  const [tilt, setTilt] = useState<Tilt>({ rx: 0, ry: 0, active: false });
  const cardRef = useRef<HTMLDivElement>(null);

  const hasSpotify = !loading && !!data?.listening_to_spotify && !!data.spotify;
  const hasGame    = !loading && !!data?.activities?.find(a => a.type === 0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    setTilt({ rx: (y - 0.5) * -10, ry: (x - 0.5) * 10, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, active: false });
  }, []);

  // Sheen origin: derived from tilt — opposite of tilt direction (where light hits)
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const sheenX = clamp(50 - tilt.ry * 3, 15, 85);
  const sheenY = clamp(50 + tilt.rx * 3, 15, 85);

  return (
    <div className="site-frame">

      {/* Nav tabs – above the card */}
      <div className="site-tabs">
        <Link href="/"         className={`site-tab${location === '/'         ? ' active' : ''}`}>Home</Link>
        <Link href="/projects" className={`site-tab${location === '/projects' ? ' active' : ''}`}>Projects</Link>
      </div>

      {/* The main card */}
      <div
        ref={cardRef}
        className={`site-card${tilt.active ? ' site-card--tilted' : ''}`}
        style={{
          transform: `perspective(1400px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          '--sheen-x': `${sheenX}%`,
          '--sheen-y': `${sheenY}%`,
        } as React.CSSProperties}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Holographic sheen */}
        <div className={`guns-sheen${tilt.active ? ' guns-sheen--visible' : ''}`} />

        {/* Profile header – always visible */}
        <DiscordProfile
          data={data}
          loading={loading}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
        />

        {/* Activity rows – home page only, and only when active */}
        {location === '/' && (hasSpotify || hasGame) && (
          <div className="guns-activities">
            <SpotifyCard data={data} loading={loading} />
            <GameCard    data={data} loading={loading} />
          </div>
        )}

        {/* Page content */}
        <div className="site-content">
          <Switch>
            <Route path="/"         component={Home} />
            <Route path="/projects" component={Projects} />
            <Route path="/secret"   component={Secret} />
          </Switch>
        </div>
      </div>
    </div>
  );
}
