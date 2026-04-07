import { useState, useRef, useCallback } from 'react';
import { LanyardData } from '../hooks/useLanyard';

const BASE = import.meta.env.BASE_URL;

const BADGES = [
  { key: 'nitro',    src: `${BASE}badges/nitro_platinum.png`,    tip: 'Nitro Platinum' },
  { key: 'bravery', src: `${BASE}badges/hypesquad_bravery.png`, tip: 'HypeSquad Bravery' },
  { key: 'booster', src: `${BASE}badges/server_booster.png`,    tip: 'Server boosting since Sep 3, 2025' },
  { key: 'legacy',  src: `${BASE}badges/legacy_username.png`,   tip: 'Originally known as Jebbert#3385' },
  { key: 'quest',   src: `${BASE}badges/quest.png`,             tip: 'Completed a Quest' },
  { key: 'level',   src: `${BASE}badges/level_100.png`,         tip: 'Level 100 reached' },
  { key: 'orbs',    src: `${BASE}badges/orbs_apprentice.png`,   tip: 'Orbs Apprentice' },
];

interface Props {
  data: LanyardData | null;
  loading: boolean;
  avatarUrl: string;
  avatarFallback: string;
}

interface Tilt {
  rx: number;
  ry: number;
  mx: number;
  my: number;
  active: boolean;
}

export default function DiscordProfile({ data, loading, avatarUrl, avatarFallback }: Props) {
  const [avatarErr, setAvatarErr] = useState(false);
  const [decorErr,  setDecorErr]  = useState(false);
  const [clanErr,   setClanErr]   = useState(false);
  const [tilt, setTilt] = useState<Tilt>({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const cardRef = useRef<HTMLDivElement>(null);

  const user   = data?.discord_user;
  const status = data?.discord_status ?? 'offline';

  const decorUrl = user?.avatar_decoration_data
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=40&passthrough=true`
    : null;

  const clan = user?.primary_guild ?? null;
  const clanBadgeUrl = clan
    ? `https://cdn.discordapp.com/clan-badges/${clan.identity_guild_id}/${clan.badge}.png?size=20`
    : null;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    setTilt({
      rx: (y - 0.5) * -14,
      ry: (x - 0.5) *  14,
      mx: x * 100,
      my: y * 100,
      active: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  }, []);

  if (loading) {
    return <div className="guns-card dp-skeleton" />;
  }

  return (
    <div
      ref={cardRef}
      className={`guns-card${tilt.active ? ' guns-card--tilted' : ''}`}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        '--mx': `${tilt.mx}%`,
        '--my': `${tilt.my}%`,
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holographic sheen overlay */}
      <div className={`guns-sheen${tilt.active ? ' guns-sheen--visible' : ''}`} />

      {/* Banner */}
      <div className="guns-banner">
        <img src={`${BASE}banner.gif`} alt="Profile banner" className="dp-banner-img" />
      </div>

      {/* Avatar row */}
      <div className="guns-avatar-row">
        <div className="dp-avatar-wrap">
          <img
            className="dp-avatar"
            src={avatarErr ? (avatarFallback || `${BASE}avatars/default.png`) : avatarUrl}
            alt="Avatar"
            onError={() => setAvatarErr(true)}
          />
          {decorUrl && !decorErr && (
            <img
              className="dp-decoration"
              src={decorUrl}
              alt="Avatar decoration"
              onError={() => setDecorErr(true)}
            />
          )}
          <span className={`dp-status-dot dp-status-${status}`} />
        </div>
      </div>

      {/* Name + username */}
      <div className="guns-name-block">
        <div className="guns-display-name">
          {user?.global_name ?? 'Jebbert'}
        </div>
        <div className="guns-username">
          @{user?.username ?? 'jebbert5115'}
          {clan && clanBadgeUrl && !clanErr && (
            <span className="dp-clan-wrap" title={clan.tag}>
              <img
                className="dp-clan-icon"
                src={clanBadgeUrl}
                alt={clan.tag}
                onError={() => setClanErr(true)}
              />
              <span className="dp-clan-tag">{clan.tag}</span>
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="guns-badges">
        {BADGES.map(b => (
          <div key={b.key} className="dp-badge-wrap">
            <img src={b.src} alt={b.tip} className="dp-badge" />
            <div className="dp-badge-tip">{b.tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
