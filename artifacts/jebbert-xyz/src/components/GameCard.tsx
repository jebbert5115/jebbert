import { useState, useEffect } from 'react';
import { LanyardData } from '../hooks/useLanyard';

interface GameCardProps {
  data: LanyardData | null;
  loading: boolean;
}

function getGameIconUrl(activity: LanyardData['activities'][0]): string | null {
  const { application_id, assets } = activity;
  if (assets?.large_image) {
    if (assets.large_image.startsWith('mp:external/')) {
      return `https://media.discordapp.net/external/${assets.large_image.replace('mp:external/', '')}`;
    }
    if (application_id) {
      return `https://cdn.discordapp.com/app-assets/${application_id}/${assets.large_image}.png`;
    }
  }
  if (application_id) {
    return `https://dcdn.dstn.to/app-icons/${application_id}`;
  }
  return null;
}

function useElapsed(start?: number) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!start) { setElapsed(''); return; }
    const update = () => {
      const startMs = start < 1e11 ? start * 1000 : start;
      const secs = Math.floor((Date.now() - startMs) / 1000);
      if (secs < 0) { setElapsed(''); return; }
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setElapsed(
        h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${m}:${String(s).padStart(2, '0')}`
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [start]);

  return elapsed;
}

export function GameCard({ data, loading }: GameCardProps) {
  const activity = data?.activities?.find(a => a.type === 0) ?? null;
  const elapsed = useElapsed(activity?.timestamps?.start);
  const [iconFailed, setIconFailed] = useState(false);

  useEffect(() => { setIconFailed(false); }, [activity?.name]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Now Playing</div>
        <div className="spotify-not-listening"><span>loading...</span></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="card">
        <div className="card-title">Now Playing</div>
        <div className="spotify-not-listening">
          <span>🎮</span>
          <span>not playing anything</span>
        </div>
      </div>
    );
  }

  const iconUrl = getGameIconUrl(activity);

  const partyText = activity.party?.size
    ? `${activity.party.size[0]} / ${activity.party.size[1]} Players`
    : activity.state ?? null;

  return (
    <div className="card">
      <div className="card-title">Now Playing</div>
      <div className="spotify-card">
        {iconUrl && !iconFailed ? (
          <img
            className="album-art"
            style={{ borderRadius: '8px' }}
            src={iconUrl}
            alt={activity.name}
            onError={() => setIconFailed(true)}
          />
        ) : (
          <div className="album-art-placeholder">🎮</div>
        )}
        <div className="spotify-info">
          <div className="spotify-song">{activity.name}</div>
          {activity.details && (
            <div className="spotify-artist">{activity.details}</div>
          )}
          {partyText && (
            <div className="spotify-artist">{partyText}</div>
          )}
          {elapsed && (
            <div className="game-elapsed">{elapsed} elapsed</div>
          )}
        </div>
      </div>
    </div>
  );
}
