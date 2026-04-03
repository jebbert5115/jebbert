import type { ReactNode } from 'react';
import FlowFieldCanvas from '../components/FlowFieldCanvas';

const BASE = import.meta.env.BASE_URL;

interface Bot {
  name: string;
  logo: string;
  lang: 'Python' | 'Node.js';
  about: ReactNode;
  invite: string | null;
}

const bots: Bot[] = [
  {
    name: 'Nexus',
    logo: `${BASE}bots/nexus.png`,
    lang: 'Python',
    about: 'Advanced all-in-one server moderation, anti nuke, management, and entertainment bot.',
    invite: 'https://discord.com/oauth2/authorize?client_id=1482084412970631379',
  },
  {
    name: 'HUDdy',
    logo: `${BASE}bots/huddy.png`,
    lang: 'Python',
    about: 'Live API information for ARC Raiders, and a themed minigame.',
    invite: 'https://discord.com/oauth2/authorize?client_id=1448887377996288131',
  },
  {
    name: 'Partner Manager',
    logo: `${BASE}bots/partnermgr.png`,
    lang: 'Python',
    about: <>Custom partnership management bot for the <em>Garden Café</em>.</>,
    invite: null,
  },
  {
    name: 'Radio New Vegas',
    logo: `${BASE}bots/radionewvegas.png`,
    lang: 'Node.js',
    about: 'Dual station radio bot with songs from Fallout: New Vegas and Fallout 4.',
    invite: 'https://discord.com/oauth2/authorize?client_id=1473401347566207250',
  },
  {
    name: 'LyriX',
    logo: `${BASE}bots/lyrix.png`,
    lang: 'Python',
    about: 'Detects your Spotify activity to fetch song lyrics, and supports custom lyric searches.',
    invite: 'https://discord.com/oauth2/authorize?client_id=1488795086824280284',
  },
];

const langColor: Record<Bot['lang'], string> = {
  Python:  'var(--accent-1)',
  'Node.js': '#68a063',
};

export default function Projects() {
  return (
    <>
      <FlowFieldCanvas />

      <div className="page-title">// <span className="page-title-accent">Projects</span></div>
      <p className="page-subtitle">discord bots i've built</p>

      <div className="bots-grid">
        {bots.map((bot) => (
          <div key={bot.name} className="card bot-card">
            <div className="bot-logo-wrapper">
              <img src={bot.logo} alt={`${bot.name} logo`} className="bot-logo" />
            </div>

            <span className="bot-lang-tag" style={{ borderColor: langColor[bot.lang], color: langColor[bot.lang] }}>
              {bot.lang}
            </span>

            <div className="bot-name">{bot.name}</div>

            <p className="bot-about">{bot.about}</p>

            {bot.invite ? (
              <a
                className="bot-invite-btn"
                href={bot.invite}
                target="_blank"
                rel="noreferrer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
                Add Bot
              </a>
            ) : (
              <span className="bot-invite-unavail">Private Bot</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
