import { useState } from 'react';
import { Router as WouterRouter, Link, useLocation } from 'wouter';
import ConstellationCanvas from '@/components/ConstellationCanvas';
import { SiteLayout } from '@/components/SiteLayout';
import EnterScreen from '@/components/EnterScreen';

function NavBar() {
  const [location] = useLocation();
  const isHome     = !location.startsWith('/projects') && !location.startsWith('/secret');
  return (
    <nav className="nav">
      <a href={import.meta.env.BASE_URL} className="nav-logo">JEBBERT</a>
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
  const [entered, setEntered] = useState(
    () => sessionStorage.getItem('jeb_entered') === '1'
  );

  const handleEnter = () => {
    sessionStorage.setItem('jeb_entered', '1');
    setEntered(true);
  };

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ConstellationCanvas />

      {!entered && <EnterScreen onEnter={handleEnter} />}

      <NavBar />

      <main className="page-wrapper">
        <SiteLayout />
      </main>
    </WouterRouter>
  );
}

export default App;
