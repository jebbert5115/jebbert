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

interface Props {
  data: LanyardData | null;
  loading: boolean;
  avatarUrl: string;
  avatarFallback: string;
}

export default function DiscordProfile({ data, loading, avatarUrl, avatarFallback }: Props) {
  const [avatarErr, setAvatarErr] = useState(false);
  const [decorErr,  setDecorErr]  = useState(false);
  const [clanErr,   setClanErr]   = useState(false);

  const user  = data?.discord_user;
  const status = data?.discord_status ?? 'offline';

  /* Avatar decoration URL */
  const decorUrl = user?.avatar_decoration_data
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=40&passthrough=true`
    : null;

  /* Clan badge URL */
  const clan = user?.primary_guild ?? null;
  const clanBadgeUrl = clan
    ? `https://cdn.discordapp.com/clan-badges/${clan.identity_guild_id}/${clan.badge}.png?size=20`
    : null;

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

      </div>
    </div>
  );
}
