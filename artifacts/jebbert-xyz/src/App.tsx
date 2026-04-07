import { useState, useCallback } from 'react';
import { Router as WouterRouter } from 'wouter';
import ConstellationCanvas from '@/components/ConstellationCanvas';
import { SiteLayout } from '@/components/SiteLayout';
import EnterScreen from '@/components/EnterScreen';

function NavBar() {
  return (
    <nav className="nav">
      <a href={import.meta.env.BASE_URL} className="nav-logo">jebbert.xyz</a>
    </nav>
  );
}

function App() {
  const [entered,   setEntered]   = useState(false);
  const [revealing, setRevealing] = useState(false);

  const handleExiting = useCallback(() => {
    setRevealing(true);
  }, []);

  const handleEnter = useCallback(() => {
    setEntered(true);
  }, []);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ConstellationCanvas />

      {!entered && (
        <EnterScreen onExiting={handleExiting} onEnter={handleEnter} />
      )}

      <div className={`site-reveal${revealing || entered ? ' site-revealed' : ''}`}>
        <NavBar />
        <main className="page-wrapper">
          <SiteLayout />
        </main>
      </div>
    </WouterRouter>
  );
}

export default App;
