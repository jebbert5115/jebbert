import { useRef, useCallback, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanyard } from '../hooks/useLanyard';
import { useTilt } from '../hooks/useTilt';
import DiscordProfile from './DiscordProfile';
import { SpotifyCard } from './SpotifyCard';
import { GameCard } from './GameCard';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import Secret from '../pages/Secret';

const FADE_OUT_MS = 130;

function renderPage(loc: string) {
  if (loc.startsWith('/projects')) return <Projects />;
  if (loc.startsWith('/secret'))   return <Secret />;
  return <Home />;
}

export function SiteLayout() {
  const [location] = useLocation();
  const { data, loading, avatarUrl, avatarFallback } = useLanyard();

  const cardRef   = useRef<HTMLDivElement>(null);
  const sheenRef  = useRef<HTMLDivElement>(null);
  const freezeRef = useRef<(() => void) | null>(null);

  useTilt(cardRef, sheenRef, freezeRef);

  const hasSpotify = !loading && !!data?.listening_to_spotify && !!data.spotify;
  const hasGame    = !loading && !!data?.activities?.find(a => a.type === 0);

  // ── Two-phase page cross-fade ───────────────────────────────────────
  // displayedLoc: what is currently rendered (lags behind location during out-phase)
  // contentKey:   increments on each swap to force React remount of the new page
  // phase:        drives the CSS animation class
  const [displayedLoc, setDisplayedLoc] = useState(location);
  const [contentKey,   setContentKey]   = useState(0);
  const [phase, setPhase]               = useState<'idle' | 'out' | 'in'>('idle');

  useEffect(() => {
    if (location === displayedLoc) return;
    // Phase 1: fade out the current (old) content
    setPhase('out');
    const t = setTimeout(() => {
      // Phase 2: swap to new content and fade it in
      setDisplayedLoc(location);
      setContentKey(k => k + 1);
      setPhase('in');
    }, FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [location, displayedLoc]);

  const handleNavClick = useCallback(() => {
    freezeRef.current?.();
  }, []);

  const contentClass =
    phase === 'out' ? 'site-content page-fade-out'
    : phase === 'in' ? 'site-content page-fade-in'
    : 'site-content';

  return (
    <div className="site-frame">
      <div ref={cardRef} className="site-card">

        <div ref={sheenRef} className="guns-sheen" />

        <DiscordProfile
          data={data}
          loading={loading}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
        />

        {/* Activities use displayedLoc so they fade out with the Home content */}
        {displayedLoc === '/' && (hasSpotify || hasGame) && (
          <div className="guns-activities">
            <SpotifyCard data={data} loading={loading} />
            <GameCard    data={data} loading={loading} />
          </div>
        )}

        {/* Nav tabs – nav active state tracks real location for instant feedback */}
        <nav className="card-nav">
          <Link
            href="/"
            className={`card-nav-tab${location === '/' ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            Home
          </Link>
          <Link
            href="/projects"
            className={`card-nav-tab${location === '/projects' ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            Projects
          </Link>
        </nav>

        {/* Content – keyed by contentKey so React remounts on each swap */}
        <div key={contentKey} className={contentClass}>
          {renderPage(displayedLoc)}
        </div>
      </div>
    </div>
  );
}
