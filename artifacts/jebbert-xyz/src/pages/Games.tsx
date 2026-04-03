import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Fullscreen hook ── */
function useFullscreen(ref: React.RefObject<HTMLDivElement | null>) {
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const handler = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  const toggle = () => {
    if (!document.fullscreenElement) ref.current?.requestFullscreen();
    else document.exitFullscreen();
  };
  return { isFs, toggle };
}

/* ── Game card wrapper with fullscreen button ── */
function GameCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isFs, toggle } = useFullscreen(cardRef);
  return (
    <div ref={cardRef} className={`card game-card ${className}`}>
      <div className="game-header-row">
        <div className="game-title">{title}</div>
        <button className="fullscreen-btn" onClick={toggle} title={isFs ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFs ? '✕' : '⛶'}
        </button>
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   SNAKE GAME
════════════════════════════════════════════ */
const CELL = 16;
const COLS = 20;
const ROWS = 20;
type Dir = 'U' | 'D' | 'L' | 'R';
type Pt = { x: number; y: number };

function rndFood(snake: Pt[]): Pt {
  let p: Pt;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === p.x && s.y === p.y));
  return p;
}

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Pt[],
    dir: 'R' as Dir,
    nextDir: 'R' as Dir,
    food: { x: 15, y: 10 } as Pt,
    score: 0,
    running: false,
    dead: false,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('snake_highscore') || '0'));
  const [gameState, setGameState] = useState<'idle' | 'running' | 'dead'>('idle');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Grid lines */
    ctx.strokeStyle = 'rgba(42, 42, 61, 0.8)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    ctx.fillStyle = '#7c3aed';
    for (const p of s.snake) {
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    }
    ctx.fillStyle = '#06b6d4';
    const head = s.snake[0];
    ctx.fillRect(head.x * CELL + 1, head.y * CELL + 1, CELL - 2, CELL - 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(s.food.x * CELL + 2, s.food.y * CELL + 2, CELL - 4, CELL - 4);
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.dir = s.nextDir;
    const head = s.snake[0];
    const next: Pt = { ...head };
    if (s.dir === 'U') next.y--;
    else if (s.dir === 'D') next.y++;
    else if (s.dir === 'L') next.x--;
    else next.x++;

    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS ||
        s.snake.some(p => p.x === next.x && p.y === next.y)) {
      s.running = false;
      s.dead = true;
      setGameState('dead');
      if (s.score > highScore) {
        localStorage.setItem('snake_highscore', String(s.score));
        setHighScore(s.score);
      }
      return;
    }

    s.snake.unshift(next);
    if (next.x === s.food.x && next.y === s.food.y) {
      s.score++;
      setScore(s.score);
      s.food = rndFood(s.snake);
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw, highScore]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 10 }];
    s.dir = 'R';
    s.nextDir = 'R';
    s.food = rndFood(s.snake);
    s.score = 0;
    s.running = true;
    s.dead = false;
    setScore(0);
    setGameState('running');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 130);
    draw();
  }, [tick, draw]);

  useEffect(() => {
    draw();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [draw]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      const map: Record<string, Dir> = {
        ArrowUp: 'U', w: 'U', W: 'U',
        ArrowDown: 'D', s: 'D', S: 'D',
        ArrowLeft: 'L', a: 'L', A: 'L',
        ArrowRight: 'R', d: 'R', D: 'R',
      };
      const newDir = map[e.key];
      if (!newDir) return;
      const opp: Record<Dir, Dir> = { U: 'D', D: 'U', L: 'R', R: 'L' };
      if (newDir !== opp[s.dir]) s.nextDir = newDir;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const dpad = (dir: Dir) => {
    const s = stateRef.current;
    if (!s.running) return;
    const opp: Record<Dir, Dir> = { U: 'D', D: 'U', L: 'R', R: 'L' };
    if (dir !== opp[s.dir]) s.nextDir = dir;
  };

  return (
    <GameCard title="SNAKE">
      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />
      <div className="game-controls">
        <button className="btn btn-primary" onClick={startGame}>
          {gameState === 'dead' ? 'Restart' : gameState === 'running' ? 'Restart' : 'Start'}
        </button>
        <span className="score-display">Score: {score}</span>
        <span className="score-display">Best: {highScore}</span>
      </div>
      {gameState === 'dead' && (
        <div style={{ color: '#ef4444', fontFamily: 'var(--font-display)', fontSize: '9px' }}>
          gg. you died.
        </div>
      )}
      <div className="mobile-controls">
        <div />
        <button className="btn dpad-btn" onClick={() => dpad('U')}>▲</button>
        <div />
        <button className="btn dpad-btn" onClick={() => dpad('L')}>◄</button>
        <div />
        <button className="btn dpad-btn" onClick={() => dpad('R')}>►</button>
        <div />
        <button className="btn dpad-btn" onClick={() => dpad('D')}>▼</button>
        <div />
      </div>
    </GameCard>
  );
}

/* ════════════════════════════════════════════
   CLICKER GAME
════════════════════════════════════════════ */
const MILESTONES: Record<number, string> = {
  10: 'ok',
  100: 'why',
  1000: 'please stop',
  10000: 'you need help',
  100000: 'i am begging you',
};

function getNextMilestone(count: number): string {
  const keys = Object.keys(MILESTONES).map(Number).sort((a, b) => a - b);
  for (const k of keys) {
    if (count === k) return MILESTONES[k];
  }
  return '';
}

function ClickerGame() {
  const [count, setCount] = useState(() => parseInt(localStorage.getItem('click_count') || '0'));
  const [flash, setFlash] = useState('');

  const handleClick = () => {
    const next = count + 1;
    setCount(next);
    localStorage.setItem('click_count', String(next));
    const msg = getNextMilestone(next);
    if (msg) {
      setFlash(msg);
      setTimeout(() => setFlash(''), 2000);
    }
  };

  const reset = () => {
    setCount(0);
    localStorage.setItem('click_count', '0');
  };

  return (
    <GameCard title="THE CLICKER">
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          color: 'var(--accent-1)',
          textShadow: '0 0 20px var(--accent-1)',
          marginBottom: '16px',
        }}>
          {count.toLocaleString()}
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: '14px', padding: '16px 40px' }}
          onClick={handleClick}
        >
          CLICK
        </button>
        {flash && (
          <div style={{
            marginTop: '12px',
            fontFamily: 'var(--font-display)',
            fontSize: '9px',
            color: 'var(--accent-3)',
            textShadow: '0 0 12px var(--accent-3)',
          }}>
            {flash}
          </div>
        )}
      </div>
      <div className="game-controls">
        <button className="btn" style={{ fontSize: '9px' }} onClick={reset}>Reset</button>
        <span className="score-display">Lifetime: {count.toLocaleString()}</span>
      </div>
    </GameCard>
  );
}

/* ════════════════════════════════════════════
   MEMORY CARD FLIP
════════════════════════════════════════════ */
const EMOJIS = ['🐸', '🚀', '🎃', '💀', '🌈', '🦋', '🎮', '🔮'];

interface MemCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createDeck(): MemCard[] {
  const doubled = [...EMOJIS, ...EMOJIS];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

function MemoryGame() {
  const [cards, setCards] = useState<MemCard[]>(createDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [won, startTime]);

  const flip = (id: number) => {
    if (locked || won) return;
    const card = cards[id];
    if (card.flipped || card.matched || selected.length >= 2) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        const matched = newCards.map(c =>
          c.id === a || c.id === b ? { ...c, matched: true } : c
        );
        setCards(matched);
        setSelected([]);
        setLocked(false);
        if (matched.every(c => c.matched)) setWon(true);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const restart = () => {
    setCards(createDeck());
    setSelected([]);
    setMoves(0);
    setElapsed(0);
    setWon(false);
    setLocked(false);
  };

  return (
    <GameCard title="MEMORY FLIP">
      {won ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '9px', color: 'var(--accent-3)', marginBottom: '8px' }}>
            you actually did it
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {moves} moves · {elapsed}s
          </div>
          <button className="btn btn-primary" onClick={restart}>Play Again</button>
        </div>
      ) : (
        <>
          <div className="memory-grid">
            {cards.map(card => (
              <div
                key={card.id}
                className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
                onClick={() => flip(card.id)}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-front">?</div>
                  <div className="memory-card-back">{card.emoji}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="game-controls">
            <button className="btn" onClick={restart}>Restart</button>
            <span className="score-display">Moves: {moves}</span>
            <span className="score-display">Time: {elapsed}s</span>
          </div>
        </>
      )}
    </GameCard>
  );
}

/* ════════════════════════════════════════════
   DON'T CLICK THE RED BUTTON
════════════════════════════════════════════ */
function RedButtonGame() {
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showError, setShowError] = useState(false);
  const [record] = useState(() => parseInt(localStorage.getItem('red_record') || '0'));
  const [newRecord, setNewRecord] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (started) return;
    setStarted(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const clickedRed = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (elapsed > record) {
      localStorage.setItem('red_record', String(elapsed));
      setNewRecord(true);
    }
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setStarted(false);
      setElapsed(0);
      setNewRecord(false);
    }, 3000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <GameCard title="DON'T CLICK THE RED BUTTON">
      {showError && (
        <div className="fake-error">
          <div className="sad-face">:(</div>
          <h1>YOU CLICKED IT</h1>
          <p>
            We told you. We BEGGED you. And yet here we are.{' '}
            {newRecord ? `New record: ${elapsed}s. Worth it?` : `You lasted ${elapsed} seconds. Embarrassing.`}
            <br /><br />
            Rebooting dignity...
          </p>
        </div>
      )}
      <div className="red-button-container">
        {!started ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Record: {record}s · Do. Not. Click. It.
            </div>
            <button className="btn" onClick={startTimer}>I accept this challenge</button>
          </div>
        ) : (
          <>
            <div className="timer-display">{elapsed}s</div>
            <button className="red-button-big" onClick={clickedRed}>
              DO NOT<br />CLICK
            </button>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Record: {record}s
            </div>
          </>
        )}
      </div>
    </GameCard>
  );
}

/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function Games() {
  return (
    <div>
      <div className="page-header">
        <h1>GAMES</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          nothing productive happens here
        </p>
      </div>

      <div className="games-grid">
        <SnakeGame />
        <ClickerGame />
        <MemoryGame />
        <RedButtonGame />
      </div>
    </div>
  );
}
