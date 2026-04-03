import { useEffect, useState } from 'react';
import { Link } from 'wouter';

const ASCII_ART = `
 __   ______  _   _   _____ _____ _   _ _   _ _____      ___ _____ 
 \\ \\ / / __ \\| | | | |  ___|  _  | | | | \\ | |  __ \\    |_ _|_   _|
  \\ V / |  | | | | | | |_  | | | | | | |  \\| | |  | |    | |  | |  
   \\ /| |  | | | | | |  _| | | | | | | | . \` | |  | |    | |  | |  
   | || |__| | |_| | | |   \\ \\_/ / |_| | |\\  | |__| |    | |  | |  
   |_| \\____/ \\___/  |_|    \\___/ \\___/|_| \\_|_____/    |___| |_|  
`;

const SECRET_TIER_LIST = [
  {
    tier: 'S',
    className: 'tier-s',
    items: ['Finding this page', 'Konami code enjoyers', 'Pixel hunters'],
  },
  {
    tier: 'A',
    className: 'tier-a',
    items: ['People who read source code', 'Curious by nature'],
  },
  {
    tier: 'B',
    className: 'tier-b',
    items: ['Clicking random corners of websites', 'Trusting a hyperlink'],
  },
  {
    tier: 'F',
    className: 'tier-f',
    items: ['People who would never look for secrets', 'Skimming'],
  },
];

export default function Secret() {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const v = parseInt(localStorage.getItem('secret_visits') || '0') + 1;
    localStorage.setItem('secret_visits', String(v));
    setVisits(v);
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <pre
          className="secret-ascii"
          style={{ fontSize: 'clamp(5px, 1.2vw, 10px)', overflowX: 'auto' }}
        >
          {ASCII_ART}
        </pre>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '10px',
          color: 'var(--accent-2)',
          marginTop: '24px',
          lineHeight: '2',
        }}>
          YOU FOUND IT
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div className="visitor-counter">
          You are visitor #{visits.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          (this number is stored locally on your device and is totally made up. still counts.)
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">Congratulations, genuinely</div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '12px' }}>
          You found the secret page. Whether you typed the Konami code (↑↑↓↓←→←→BA) 
          or you clicked some weird invisible pixel in the corner of the homepage —
          either way, you have excellent taste and/or questionable priorities.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
          This page exists as a reward for the curious. The people who look behind things. 
          Who press buttons that say don't press. Who read source code for fun.
          You're one of those people. That's rare. Stay weird.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">Secret Rare Compliment</div>
        <div className="result-text" style={{ color: 'var(--accent-3)' }}>
          "You are the kind of person who finds things they weren't supposed to find — 
          and that curiosity is genuinely one of the most powerful things a person can have. 
          Never lose it."
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-title">Secret Tier List: Ways People Found This Page</div>
        <div className="tier-list">
          {SECRET_TIER_LIST.map(({ tier, className, items }) => (
            <div key={tier} className={`tier-row ${className}`}>
              <div className="tier-label">{tier}</div>
              <div className="tier-items">
                {items.map(item => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-accent)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '10px 24px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            display: 'inline-block',
            transition: 'all 0.2s',
          }}
        >
          ← forget you were ever here
        </Link>
      </div>
    </div>
  );
}
