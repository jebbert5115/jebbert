import { useRef, useState } from 'react';
import { useLanyard } from '../hooks/useLanyard';
import { SpotifyCard } from '../components/SpotifyCard';
import { GameCard } from '../components/GameCard';
import { Link } from 'wouter';
import FlowFieldCanvas from '../components/FlowFieldCanvas';
import DiscordProfile from '../components/DiscordProfile';

export default function Home() {
  const { data, loading, avatarUrl, avatarFallback, customStatus } = useLanyard();
  const [hideCards, setHideCards]   = useState(false);
  const resetColorsRef              = useRef<(() => void) | null>(null);

  return (
    <>
      <FlowFieldCanvas resetRef={resetColorsRef} />

      {/* ── Canvas control buttons ── */}
      <div className="canvas-controls">
        <button
          className="canvas-ctrl-btn"
          title={hideCards ? 'Show cards' : 'Hide cards'}
          onClick={() => setHideCards(h => !h)}
        >
          {hideCards ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="0" width="6" height="6" rx="1"/>
              <rect x="8" y="0" width="6" height="6" rx="1"/>
              <rect x="0" y="8" width="6" height="6" rx="1"/>
              <rect x="8" y="8" width="6" height="6" rx="1"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1"  y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        <button
          className="canvas-ctrl-btn"
          title="Reset particle colors"
          onClick={() => resetColorsRef.current?.()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.63"/>
          </svg>
        </button>
      </div>

      {!hideCards && (
        <div className="home-stack">

          {/* ── Discord profile card ── */}
          <DiscordProfile
            data={data}
            loading={loading}
            avatarUrl={avatarUrl}
            avatarFallback={avatarFallback}
          />

          {/* ── Mid row: Spotify + Game ── */}
          <div className="home-mid-row">
            <SpotifyCard data={data} loading={loading} />
            <GameCard data={data} loading={loading} />
          </div>

          {/* ── About Me ── */}
          <div className="card about-card-inline">
            <div className="card-title">About Me</div>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              I actually have no idea what to put in these things.
            </p>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-muted)', marginTop: '12px' }}>
              yeah.
            </p>
          </div>

          {/* ── Board ── */}
          <div className="card">
            <div className="card-title">Board</div>
            <div className="currently-list">
              {[
                { emoji: '🎮', label: 'Favorite Game',      value: 'ARC Raiders' },
                { emoji: '📺', label: 'Currently Watching', value: 'The Rookie' },
                { emoji: '📖', label: 'Currently Reading',  value: 'The Ballad of Songbirds and Snakes' },
                { emoji: '🎵', label: 'Fav Song',           value: "Don't Drag Me Down – Social Distortion" },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="currently-item">
                  <span className="currently-emoji">{emoji}</span>
                  <span className="currently-label">{label}</span>
                  <span className="currently-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      <Link href="/secret" className="secret-hidden-link">.</Link>
    </>
  );
}
