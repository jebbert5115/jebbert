import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanyard } from '../hooks/useLanyard';
import { useTilt } from '../hooks/useTilt';
import DiscordProfile from './DiscordProfile';
import { SpotifyCard } from './SpotifyCard';
import { GameCard } from './GameCard';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import Secret from '../pages/Secret';

const EXIT_MS = 80;

function renderPage(loc: string) {
  if (loc.startsWith('/projects')) return <Projects />;
  if (loc.startsWith('/secret'))   return <Secret />;
  return <Home />;
}

export function SiteLayout() {
  const [location] = useLocation();
  const { data, loading, avatarUrl, avatarFallback } = useLanyard();

  const cardRef  = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const onHome = !location.startsWith('/projects') && !location.startsWith('/secret');
  useTilt(cardRef, sheenRef, onHome);

  const hasSpotify = !loading && !!data?.listening_to_spotify && !!data.spotify;
  const hasGame    = !loading && !!data?.activities?.find(a => a.type === 0);

  const [displayedLoc, setDisplayedLoc] = useState(location);
  const [contentKey,   setContentKey]   = useState(0);
  const [phase, setPhase]               = useState<'idle' | 'out' | 'in'>('idle');

  useEffect(() => {
    if (location === displayedLoc) return;
    setPhase('out');
    const t = setTimeout(() => {
      setDisplayedLoc(location);
      setContentKey(k => k + 1);
      setPhase('in');
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [location, displayedLoc]);

  const contentClass =
    phase === 'out' ? 'site-content page-exit'
    : phase === 'in' ? 'site-content page-enter'
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

        {displayedLoc === '/' && (hasSpotify || hasGame) && (
          <div className="guns-activities">
            <SpotifyCard data={data} loading={loading} />
            <GameCard    data={data} loading={loading} />
          </div>
        )}

        <div key={contentKey} className={contentClass}>
          {renderPage(displayedLoc)}
        </div>
      </div>
    </div>
  );
}
