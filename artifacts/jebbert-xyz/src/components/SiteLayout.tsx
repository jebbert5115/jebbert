import { useRef } from 'react';
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

  const cardRef  = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  useTilt(cardRef, sheenRef);

  const hasSpotify = !loading && !!data?.listening_to_spotify && !!data.spotify;
  const hasGame    = !loading && !!data?.activities?.find(a => a.type === 0);

  return (
    <div className="site-frame">

      {/* Nav tabs – above the card */}
      <div className="site-tabs">
        <Link href="/"         className={`site-tab${location === '/'         ? ' active' : ''}`}>Home</Link>
        <Link href="/projects" className={`site-tab${location === '/projects' ? ' active' : ''}`}>Projects</Link>
      </div>

      {/* The main card */}
      <div ref={cardRef} className="site-card">

        {/* Conic shimmer overlay – background set by useTilt */}
        <div ref={sheenRef} className="guns-sheen" />

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
