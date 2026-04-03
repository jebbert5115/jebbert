import { useState, useEffect } from 'react';
import { LanyardData, getSpotifyProgress } from '../hooks/useLanyard';

interface SpotifyCardProps {
  data: LanyardData | null;
  loading: boolean;
}

export function SpotifyCard({ data, loading }: SpotifyCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!data?.listening_to_spotify || !data.spotify) return;

    const update = () => {
      setProgress(getSpotifyProgress(data.spotify!.timestamps));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Now Playing</div>
        <div className="spotify-not-listening">
          <span>loading...</span>
        </div>
      </div>
    );
  }

  if (!data?.listening_to_spotify || !data.spotify) {
    return (
      <div className="card">
        <div className="card-title">Now Playing</div>
        <div className="spotify-not-listening">
          <span>♪</span>
          <span>not listening to anything</span>
        </div>
      </div>
    );
  }

  const { song, artist, album_art_url } = data.spotify;

  return (
    <div className="card">
      <div className="card-title">Now Playing</div>
      <div className="spotify-card">
        {album_art_url ? (
          <img
            className="album-art"
            src={album_art_url}
            alt={`${song} album art`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="album-art-placeholder">♪</div>
        )}
        <div className="spotify-info">
          <div className="spotify-song">{song}</div>
          <div className="spotify-artist">{artist}</div>
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
