import { useState, useRef, useEffect, useCallback } from 'react';

/* ── Confetti helper ── */
function spawnConfetti(x: number, y: number) {
  const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    el.style.left = `${x + (Math.random() - 0.5) * 100}px`;
    el.style.top = `${y}px`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    el.style.animationDuration = `${0.8 + Math.random() * 1}s`;
    el.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

/* ── Fullscreen hook ── */
function useFullscreen(ref: React.RefObject<HTMLDivElement | null>) {
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const handler = () => setIsFs(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [ref]);
  const toggle = () => {
    if (!document.fullscreenElement) ref.current?.requestFullscreen();
    else document.exitFullscreen();
  };
  return { isFs, toggle };
}

/* ── Extra card wrapper with fullscreen button ── */
function ExtraCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isFs, toggle } = useFullscreen(cardRef);
  return (
    <div ref={cardRef} className={`card ${className}`}>
      <div className="card-header-row">
        <div className="card-title">{title}</div>
        <button className="fullscreen-btn" onClick={toggle} title={isFs ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFs ? '✕' : '⛶'}
        </button>
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   1. USELESS BUTTON
════════════════════════════════════════════ */
const USELESS_LABELS = [
  'DO NOT PRESS',
  'I said don\'t.',
  'That\'s strike two.',
  'You were warned.',
  'Fine. Nothing happened. Happy?',
  'Seriously stop.',
  'The button does nothing. NOTHING.',
  'Ok at this point it\'s on you.',
  '...',
  'I give up.',
];

function UselessButton() {
  const [idx, setIdx] = useState(0);
  const handleClick = () => setIdx(i => (i + 1) % USELESS_LABELS.length);

  return (
    <ExtraCard title="The Useless Button">
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '14px 32px', transition: 'all 0.15s' }}
          onClick={handleClick}
        >
          {USELESS_LABELS[idx]}
        </button>
      </div>
    </ExtraCard>
  );
}

/* ════════════════════════════════════════════
   2. COMPLIMENT GENERATOR
════════════════════════════════════════════ */
const COMPLIMENTS = [
  "You have the energy of someone who actually reads documentation.",
  "You're the kind of person who leaves good commit messages.",
  "Your taste in loading screens is genuinely unmatched.",
  "You radiate the energy of a correctly indented codebase.",
  "Somewhere out there, a rubber duck is proud of you.",
  "You are a merge conflict that resolved itself beautifully.",
  "If you were a font, you'd be perfectly kerned.",
  "You probably close all your tabs before shutting down. Respect.",
  "Your presence on the internet is net positive. Rare.",
  "You are the 200 OK of human beings.",
  "You fix bugs without creating new ones. You're special.",
  "The universe compiled successfully because you exist.",
  "You leave CSS cleaner than you found it.",
  "You are the reason `console.log` still feels hopeful.",
  "You don't just think outside the box — you refactor the box.",
  "Genuinely, you seem like someone who pushes code and it works first try.",
  "You are a well-placed semicolon in a world of syntax errors.",
  "You give off 'dark mode on by default' energy and I respect it.",
  "You're someone who actually types things out instead of relying on autocomplete. Admirable.",
  "You're the human equivalent of a progress bar that actually finishes.",
  "Everything runs faster when you're around. Fact.",
  "Your hover states are inspired.",
  "You probably remember to handle edge cases. Hero.",
  "You exist at exactly the right frame rate.",
  "Other people's code gets better just by being near you.",
  "You are carrying this project. Quietly. Gracefully.",
  "You would write good tests and I admire that.",
  "If vibes were a variable, yours would be `const legend = true`.",
  "You are the one who checks if the thing actually works after deploying. Rare. Precious.",
  "You make the internet slightly better just by being in it.",
  "You are undeniably built different.",
];

function ComplimentGenerator() {
  const [text, setText] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);

  const generate = (e: React.MouseEvent) => {
    const idx = Math.floor(Math.random() * COMPLIMENTS.length);
    setText(COMPLIMENTS[idx]);
    spawnConfetti(e.clientX, e.clientY);
  };

  return (
    <ExtraCard title="Compliment Generator">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {text && <div className="result-text" style={{ color: 'var(--accent-2)' }}>{text}</div>}
        <button ref={btnRef} className="btn btn-primary" onClick={generate}>
          ✨ Generate Compliment
        </button>
      </div>
    </ExtraCard>
  );
}

/* ════════════════════════════════════════════
   3. EXCUSE GENERATOR
════════════════════════════════════════════ */
const EXCUSES = [
  "My router achieved sentience and refused to cooperate.",
  "I was debugging a race condition in my dreams.",
  "Time zones are a conspiracy and I refuse to acknowledge them.",
  "My cat sat on my keyboard and filed a pull request.",
  "I was abducted by a loading screen and only just got back.",
  "Mercury was in retrograde and also my computer was off.",
  "I had an existential crisis about the concept of 'on time'.",
  "I was too busy being right about everything.",
  "My notification settings achieved perfect silence.",
  "The vibes were off. I cannot function in misaligned vibes.",
  "I was performing critical maintenance on my scroll speed.",
  "I got lost in a Wikipedia rabbit hole about loading screens.",
  "I was ghosted by my own motivation.",
  "I spent three hours trying to fix a typo. I wasn't typing.",
  "The coffee was still hot and it would have been rude to leave it.",
  "I was briefly convinced I was living in a simulation.",
  "Someone was wrong on the internet. I had to handle it.",
  "I was documenting everything I did instead of doing anything.",
  "My IDE crashed and it took my will to live with it.",
  "I had a breakthrough idea and spent four hours forgetting it.",
  "Autocomplete wrote the wrong thing and I agreed with it.",
  "I was in a meeting about the thing I was supposed to be doing.",
  "My branch diverged from reality.",
  "I was busy preparing an excellent excuse for later.",
  "The task was marked urgent, which paradoxed me into stillness.",
  "I accidentally tabbed into a void.",
  "I was rate-limited by the concept of effort.",
  "I forgot what I was doing mid-thought and had to reboot.",
  "The deadline moved at the same speed I did, backwards.",
  "I was struck by inspiration and then struck by a nap.",
  "DNS didn't resolve. Metaphorically.",
];

function ExcuseGenerator() {
  const [text, setText] = useState('');

  const generate = () => {
    const idx = Math.floor(Math.random() * EXCUSES.length);
    setText(EXCUSES[idx]);
  };

  return (
    <ExtraCard title="Excuse Generator">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {text && <div className="result-text" style={{ color: 'var(--accent-3)' }}>{text}</div>}
        <button className="btn" onClick={generate}>
          🎲 Generate Excuse
        </button>
      </div>
    </ExtraCard>
  );
}

/* ════════════════════════════════════════════
   4. FAKE HACKER TERMINAL
════════════════════════════════════════════ */
const HACK_RESPONSES = [
  ["Accessing mainframe...", "Bypassing firewall...", "Rerouting through 47 proxies...", "ERROR: Too cool to hack."],
  ["Downloading the internet...", "47%... 47%... 47%...", "CRITICAL ERROR: Internet too large.", "Saving to floppy disk failed."],
  ["Initiating HACK.exe...", "Cracking 256-bit encryption...", "Cracking 256-bit encryption...", "Wait—", "OK I lied. I have no idea how encryption works."],
  ["Connecting to NSA mainframe...", "Authentication required:", "> username: jebbert5115", "> password: hunter2", "Access DENIED. Try 'hunter3'."],
  ["sudo rm -rf /", "Permission denied.", "sudo sudo rm -rf /", "Nice try."],
  ["Scanning target...", "Vulnerability found: user is too cool", "Exploit failed: could not handle the coolness.", "Aborting mission."],
  ["vim .", "hjkl hjkl hjkl", ":wq", "Cannot exit. You are trapped here forever."],
  ["git blame", "It was you.", "It was always you.", "The call is coming from inside the repo."],
];

function HackerTerminal() {
  const [output, setOutput] = useState('Type something and press Enter...\n');
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const handleKey = async (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim();
    setInput('');

    if (!cmd) return;

    const response = HACK_RESPONSES[Math.floor(Math.random() * HACK_RESPONSES.length)];

    setOutput(prev => prev + `\n$ ${cmd}\n`);

    for (let i = 0; i < response.length; i++) {
      await new Promise(r => setTimeout(r, 600 + i * 400));
      setOutput(prev => prev + response[i] + '\n');
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <ExtraCard title="Fake Hacker Terminal">
      <div className="terminal" ref={outputRef}>
        <div className="terminal-output">{output}</div>
        <div className="terminal-input-row">
          <span className="terminal-prompt">$</span>
          <input
            className="terminal-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="type a command..."
            autoComplete="off"
          />
        </div>
      </div>
    </ExtraCard>
  );
}

/* ════════════════════════════════════════════
   5. VIBE CHECKER
════════════════════════════════════════════ */
const VIBE_QUESTIONS = [
  {
    q: 'Pick a time of day:',
    opts: ['3:47 AM', 'Golden hour', 'Right after lunch', 'That weird 5 PM limbo'],
  },
  {
    q: 'Your browser has:',
    opts: ['3 tabs', '47 tabs', 'One tab: this one', 'Tabs in tabs somehow'],
  },
  {
    q: 'Your resting face suggests you are:',
    opts: ['Plotting something', 'Fine, actually', 'Calculating', 'Somewhere else entirely'],
  },
];

const VIBE_RESULTS = [
  "Chaotic Neutral Frog Energy",
  "Main Character but Make it Monday",
  "Retired Villain Turned Cottage Cheese Enthusiast",
  "Extremely Online Cryptid",
  "The Third Cloud from the Left",
  "Person-Shaped Mystery",
  "404 Vibe Not Found (Good Thing)",
  "Ambient Chaos with Good Intentions",
  "Understated Icon Who Haunts Libraries",
  "Emotionally Loading... please wait",
  "Technically Asleep But Spiritually Here",
  "Glitch in the Simulation (Best Kind)",
  "NPC Who Achieved Sentience",
  "Main Quest: Skipped. Side Quests: Maxed.",
];

function VibeChecker() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState('');

  const choose = () => {
    if (step < VIBE_QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      const r = VIBE_RESULTS[Math.floor(Math.random() * VIBE_RESULTS.length)];
      setResult(r);
    }
  };

  const reset = () => { setStep(0); setResult(''); };

  const title = result ? 'Vibe Checker' : `Vibe Checker (${step + 1}/${VIBE_QUESTIONS.length})`;

  return (
    <ExtraCard title={title}>
      {result ? (
        <>
          <div className="vibe-result">
            Your vibe is:<br />
            <span style={{ color: 'var(--accent-2)', fontSize: '13px' }}>{result}</span>
          </div>
          <button className="btn" onClick={reset} style={{ marginTop: '8px' }}>Check Again</button>
        </>
      ) : (
        <>
          <div className="vibe-question">{VIBE_QUESTIONS[step].q}</div>
          <div className="vibe-options">
            {VIBE_QUESTIONS[step].opts.map(opt => (
              <button key={opt} className="vibe-option" onClick={choose}>{opt}</button>
            ))}
          </div>
        </>
      )}
    </ExtraCard>
  );
}

/* ════════════════════════════════════════════
   6. BUTTON THAT RUNS AWAY
════════════════════════════════════════════ */
function RunawayButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [init, setInit] = useState(false);
  const [caught, setCaught] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const flee = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const maxX = rect.width - 120;
    const maxY = rect.height - 48;
    setPos({
      x: Math.random() * maxX,
      y: Math.random() * maxY,
    });
    setInit(true);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    setCaught(true);
    spawnConfetti(e.clientX, e.clientY);
    setTimeout(() => { setCaught(false); setInit(false); setPos({ x: 0, y: 0 }); }, 2000);
  };

  return (
    <ExtraCard title="The Button That Runs Away">
      <div
        ref={containerRef}
        style={{ position: 'relative', height: '160px', overflow: 'hidden' }}
      >
        {caught ? (
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '9px',
            color: 'var(--accent-3)',
            paddingTop: '48px',
          }}>
            YOU CAUGHT IT! 🎉
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={init ? {
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transition: 'left 0.15s, top 0.15s',
              whiteSpace: 'nowrap',
            } : { margin: '48px auto', display: 'block' }}
            onMouseEnter={flee}
            onClick={onClick}
          >
            {init ? 'Catch me!' : 'Click Me'}
          </button>
        )}
      </div>
    </ExtraCard>
  );
}


/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function Extras() {
  return (
    <div>
      <div className="page-header">
        <h1>EXTRAS</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          completely useless. completely worth it.
        </p>
      </div>

      <div className="extras-grid">
        <UselessButton />
        <ComplimentGenerator />
        <ExcuseGenerator />
        <HackerTerminal />
        <VibeChecker />
        <RunawayButton />
      </div>
    </div>
  );
}
