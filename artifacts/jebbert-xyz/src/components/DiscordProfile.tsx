import { useState } from 'react';
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

/* ── Platform icons ── */
function DesktopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Desktop">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
}
function MobileIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Mobile">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="18" r="1" fill="#0a0a0f"/>
    </svg>
  );
}
function WebIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Web">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

interface Props {
  data: LanyardData | null;
  loading: boolean;
  customStatus: string | null;
  avatarUrl: string;
  avatarFallback: string;
}

export default function DiscordProfile({ data, loading, customStatus, avatarUrl, avatarFallback }: Props) {
  const [avatarErr, setAvatarErr] = useState(false);
  const [decorErr,  setDecorErr]  = useState(false);
  const [clanErr,   setClanErr]   = useState(false);

  const user  = data?.discord_user;
  const status = data?.discord_status ?? 'offline';

  /* Avatar decoration URL */
  const decorUrl = user?.avatar_decoration_data
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=240&passthrough=true`
    : null;

  /* Clan badge URL */
  const clan = user?.primary_guild ?? null;
  const clanBadgeUrl = clan
    ? `https://cdn.discordapp.com/clan-badges/${clan.identity_guild_id}/${clan.badge}.png?size=20`
    : null;

  /* Active platforms */
  const platforms: { label: string; icon: React.ReactNode }[] = [];
  if (data?.active_on_discord_desktop) platforms.push({ label: 'Desktop', icon: <DesktopIcon /> });
  if (data?.active_on_discord_mobile)  platforms.push({ label: 'Mobile',  icon: <MobileIcon /> });
  if (data?.active_on_discord_web)     platforms.push({ label: 'Web',     icon: <WebIcon /> });

  if (loading) {
    return <div className="discord-profile dp-skeleton" />;
  }

  return (
    <div className="discord-profile">
      {/* ── Banner ── */}
      <div className="dp-banner">
        <img src={`${BASE}banner.gif`} alt="Profile banner" className="dp-banner-img" />
      </div>

      {/* ── Body ── */}
      <div className="dp-body">

        {/* Avatar + decoration */}
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

        {/* Badges — top right */}
        <div className="dp-badges">
          {BADGES.map(b => (
            <div key={b.key} className="dp-badge-wrap">
              <img src={b.src} alt={b.tip} className="dp-badge" />
              <div className="dp-badge-tip">{b.tip}</div>
            </div>
          ))}
        </div>

        {/* Name row */}
        <div className="dp-name-row">
          <span className="dp-display-name">{user?.global_name ?? 'Jebbert'}</span>
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

        {/* Username */}
        <div className="dp-username">@{user?.username ?? 'jebbert5115'}</div>

        {/* Divider */}
        <div className="dp-divider" />

        {/* Custom status */}
        {customStatus && (
          <div className="dp-custom-status">
            <span className="dp-status-emoji">💬</span>
            <span>{customStatus}</span>
          </div>
        )}

        {/* Platform indicators */}
        {platforms.length > 0 && (
          <div className="dp-platforms">
            {platforms.map(p => (
              <span key={p.label} className="dp-platform-icon" title={`Active on ${p.label}`}>
                {p.icon}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
