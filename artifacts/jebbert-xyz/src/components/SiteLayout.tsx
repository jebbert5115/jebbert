import { useRef, useCallback } from 'react';
import { Link, useLocation, Switch, Route } from 'wouter';
import { useLanyard } from '../hooks/useLanyard';
import { useTilt } from '../hooks/useTilt';
import DiscordProfile from './DiscordProfile';
import { SpotifyCard } from './SpotifyCard';
import { GameCard } from './GameCard';
import Home from '../pages/Home';
import Projects from '../pages/Projects';
import Secret from '../pages/Secret';

export function SiteLayout() {
  const [location] = useLocation();
  const { data, loading, avatarUrl, avatarFallback } = useLanyard();

  const cardRef    = useRef<HTMLDivElement>(null);
  const sheenRef   = useRef<HTMLDivElement>(null);
  const freezeRef  = useRef<(() => void) | null>(null);

  useTilt(cardRef, sheenRef, freezeRef);

  const hasSpotify = !loading && !!data?.listening_to_spotify && !!data.spotify;
  const hasGame    = !loading && !!data?.activities?.find(a => a.type === 0);

  const handleNavClick = useCallback(() => {
    freezeRef.current?.();
  }, []);

  return (
    <div className="site-frame">
      {/* The main card */}
      <div ref={cardRef} className="site-card">

        {/* Conic shimmer overlay */}
        <div ref={sheenRef} className="guns-sheen" />

        {/* Profile header */}
        <DiscordProfile
          data={data}
          loading={loading}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
        />

        {/* Activity rows – home only */}
        {location === '/' && (hasSpotify || hasGame) && (
          <div className="guns-activities">
            <SpotifyCard data={data} loading={loading} />
            <GameCard    data={data} loading={loading} />
          </div>
        )}

        {/* Nav tabs – inside the card, between profile and content */}
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

        {/* Page content — keyed by route so it re-mounts and fades in */}
        <div key={location} className="site-content page-fade-in">
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
