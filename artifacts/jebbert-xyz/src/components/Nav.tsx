import { Link, useLocation } from 'wouter';
import { useKonami } from '../hooks/useKonami';

export function Nav() {
  const [location] = useLocation();
  useKonami();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo neon-flicker">jebbert.xyz</Link>
      <ul className="nav-links">
        <li><Link href="/" className={location === '/' ? 'active' : ''}>Home</Link></li>
        <li><Link href="/projects" className={location === '/projects' ? 'active' : ''}>Projects</Link></li>
        <li><Link href="/games" className={location === '/games' ? 'active' : ''}>Games</Link></li>
        <li><Link href="/extras" className={location === '/extras' ? 'active' : ''}>Extras</Link></li>
        <li><Link href="/screensavers" className={location === '/screensavers' ? 'active' : ''}>Screen Savers</Link></li>
      </ul>
    </nav>
  );
}
