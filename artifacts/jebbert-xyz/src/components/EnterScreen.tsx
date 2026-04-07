import { useState, useEffect, useCallback } from 'react';

interface Props {
  onEnter: () => void;
}

interface Line {
  text:  string;
  type:  'header' | 'sep' | 'cmd' | 'ok' | 'success' | 'empty';
  delay: number;
}

const BOOT: Line[] = [
  { type: 'header',  text: 'JEBBERT.XYZ  //  TERMINAL v2.0',              delay: 0    },
  { type: 'sep',     text: '──────────────────────────────────────────────', delay: 120  },
  { type: 'empty',   text: '',                                              delay: 300  },
  { type: 'cmd',     text: 'initializing kernel...',                        delay: 420  },
  { type: 'ok',      text: 'loading system modules',                        delay: 780  },
  { type: 'ok',      text: 'establishing network link',                     delay: 1060 },
  { type: 'ok',      text: 'discord presence API',                          delay: 1380 },
  { type: 'ok',      text: 'lanyard v3 websocket',                          delay: 1640 },
  { type: 'ok',      text: 'constellation renderer',                        delay: 1880 },
  { type: 'empty',   text: '',                                              delay: 2050 },
  { type: 'success', text: 'all systems nominal.',                          delay: 2160 },
  { type: 'empty',   text: '',                                              delay: 2340 },
  { type: 'success', text: 'welcome, operator.',                            delay: 2460 },
  { type: 'empty',   text: '',                                              delay: 2620 },
];

const PROMPT_DELAY = 3000;

function BootLine({ line }: { line: Line }) {
  if (line.type === 'empty') return <div className="et-line">&nbsp;</div>;
  if (line.type === 'sep')   return <div className="et-line et-sep">{line.text}</div>;
  if (line.type === 'header') {
    return <div className="et-line et-header">{line.text}</div>;
  }
  if (line.type === 'ok') {
    return (
      <div className="et-line">
        <span className="et-ps">&gt; </span>
        <span className="et-txt">{line.text.padEnd(38, '.')}</span>
        <span className="et-ok"> [OK]</span>
      </div>
    );
  }
  if (line.type === 'success') {
    return (
      <div className="et-line et-success">
        <span className="et-ps">&gt; </span>
        {line.text}
      </div>
    );
  }
  return (
    <div className="et-line">
      <span className="et-ps">&gt; </span>
      {line.text}
    </div>
  );
}

export default function EnterScreen({ onEnter }: Props) {
  const [visible,    setVisible]    = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [exiting,    setExiting]    = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(v => Math.max(v, i + 1)), BOOT[i].delay));
    });
    timers.push(setTimeout(() => setShowPrompt(true), PROMPT_DELAY));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = useCallback(() => {
    if (!showPrompt || exiting) return;
    setExiting(true);
    setTimeout(onEnter, 700);
  }, [showPrompt, exiting, onEnter]);

  useEffect(() => {
    const handler = () => handleEnter();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleEnter]);

  return (
    <div
      className={`enter-overlay${exiting ? ' enter-exiting' : ''}`}
      onClick={handleEnter}
    >
      <div className="enter-window" onClick={e => e.stopPropagation()}>

        {/* Title bar */}
        <div className="enter-titlebar">
          <div className="enter-dots">
            <span className="et-dot et-dot-red" />
            <span className="et-dot et-dot-yellow" />
            <span className="et-dot et-dot-green" />
          </div>
          <span className="enter-title">terminal — jebbert.xyz</span>
        </div>

        {/* Terminal body */}
        <div className="enter-body">
          {BOOT.slice(0, visible).map((line, i) => (
            <BootLine key={i} line={line} />
          ))}

          {/* Prompt line */}
          {showPrompt ? (
            <div className="et-line et-prompt-line">
              <span className="et-dollar">$ </span>
              <span className="et-prompt-text">press any key or click to access</span>
              <span className="et-cursor" />
            </div>
          ) : (
            <div className="et-line">
              <span className="et-dollar">$ </span>
              <span className="et-cursor" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
