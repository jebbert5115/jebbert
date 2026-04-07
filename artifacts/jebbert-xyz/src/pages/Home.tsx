import { Link } from 'wouter';

export default function Home() {
  return (
    <>
      <Link href="/secret" className="secret-hidden-link">.</Link>
    </>
  );
}
