import { useLanyard } from '../hooks/useLanyard';
import { SpotifyCard } from '../components/SpotifyCard';
import { GameCard } from '../components/GameCard';
import { Link } from 'wouter';
import ConstellationCanvas from '../components/ConstellationCanvas';
import DiscordProfile from '../components/DiscordProfile';

export default function Home() {
  const { data, loading, avatarUrl, avatarFallback } = useLanyard();

  const hasSpotify = !loading && !!data?.listening_to_spotify && !!data.spotify;
  const hasGame    = !loading && !!data?.activities?.find(a => a.type === 0);

  return (
    <>
      <ConstellationCanvas />

      <div className="profile-page">
        <DiscordProfile
          data={data}
          loading={loading}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
        >
          {(hasSpotify || hasGame) && (
            <>
              <SpotifyCard data={data} loading={loading} />
              <GameCard    data={data} loading={loading} />
            </>
          )}
        </DiscordProfile>
      </div>

      <Link href="/secret" className="secret-hidden-link">.</Link>
    </>
  );
}
