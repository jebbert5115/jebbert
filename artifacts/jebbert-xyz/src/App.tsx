import { useState, useCallback } from 'react';
import { Router as WouterRouter, Link, useLocation } from 'wouter';
import ConstellationCanvas from '@/components/ConstellationCanvas';
import { SiteLayout } from '@/components/SiteLayout';
import EnterScreen from '@/components/EnterScreen';

function NavBar() {
  const [location] = useLocation();
  const isHome = !location.startsWith('/projects') && !location.startsWith('/secret');
  return (
    <nav className="nav">
      <a href={import.meta.env.BASE_URL} className="nav-logo">jebbert.xyz</a>
      <ul className="nav-links">
        <li>
          <Link href="/" className={isHome ? 'active' : ''}>Home</Link>
        </li>
        <li>
          <Link href="/projects" className={location.startsWith('/projects') ? 'active' : ''}>Projects</Link>
        </li>
      </ul>
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
