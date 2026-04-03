import { useState } from 'react';
import { useLanyard } from '../hooks/useLanyard';
import { SpotifyCard } from '../components/SpotifyCard';
import { Link } from 'wouter';

export default function Home() {
  const { data, loading, avatarUrl, avatarFallback, customStatus } = useLanyard();
  const [imgSrc, setImgSrc] = useState(avatarUrl);

  const statusClass = data ? `status-${data.discord_status}` : 'status-offline';
  const dotClass = data?.discord_status ?? 'offline';

  const resolvedAvatar = avatarUrl || avatarFallback || 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <>
      <div className="home-layout">
        {/* ── Left Sidebar ── */}
        <aside className="home-sidebar">
          <div className="card profile-card profile-card-full">
            <div className={`avatar-wrapper ${statusClass}`}>
              <img
                className="avatar-img"
                src={resolvedAvatar}
                alt="Jebbert avatar"
                onError={() => setImgSrc(avatarFallback || 'https://cdn.discordapp.com/embed/avatars/0.png')}
              />
              <span className={`status-dot ${dotClass}`} />
            </div>

            <div>
              <div className="display-name">
                <span className="glitch-text">Jebbert</span>
              </div>
              <div className="username">@ jebbert5115</div>
            </div>

            <span className="guild-badge">BOOT</span>

            {customStatus && (
              <div className="custom-status">"{customStatus}"</div>
            )}

            {!customStatus && data && (
              <div className="custom-status" style={{ color: 'var(--text-muted)' }}>
                {data.discord_status === 'dnd' ? 'Do not disturb' :
                 data.discord_status === 'idle' ? 'AFK somewhere...' :
                 data.discord_status === 'online' ? 'Online and lurking' :
                 'Somewhere in the void'}
              </div>
            )}

            <div className="social-links">
              <a
                className="social-btn"
                href="https://github.com/jebbert5115"
                target="_blank"
                rel="noreferrer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                className="social-btn"
                href="https://discord.com/users/751276412308291634"
                target="_blank"
                rel="noreferrer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
                Discord
              </a>
            </div>
          </div>
        </aside>

        {/* ── Right Content ── */}
        <div className="content-area">
          <SpotifyCard data={data} loading={loading} />

          {/* About Me */}
          <div className="card about-card">
            <div className="card-title">About Me</div>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
              hey, i'm <span style={{ color: 'var(--accent-2)' }}>jebbert</span>. i make things on the internet and break them shortly after.
              i've been on discord way too long, drink too much water (you should too), and spend way too much
              time thinking about loading screens.
            </p>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-muted)', marginTop: '12px' }}>
              currently obsessed with: <span style={{ color: 'var(--accent-3)' }}>retro web aesthetics, weird javascript tricks, and the concept of the perfect loading animation</span>
            </p>
          </div>

          {/* Board */}
          <div className="card">
            <div className="card-title">Board</div>
            <div className="currently-list">
              {[
                { emoji: '🎮', label: 'Favorite Game', value: 'Minecraft' },
                { emoji: '📺', label: 'Currently Watching', value: 'Severance' },
                { emoji: '📖', label: 'Currently Reading', value: 'A blog about CSS from 2009' },
                { emoji: '🎵', label: 'Fav Song', value: 'Always – blink-182' },
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
      </div>

      {/* Hidden secret link */}
      <Link href="/secret" className="secret-hidden-link">.</Link>
    </>
  );
}
