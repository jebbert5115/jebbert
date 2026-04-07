import { Switch, Route, Router as WouterRouter } from "wouter";
import { MobileWarning } from "@/components/MobileWarning";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Secret from "@/pages/Secret";

function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '14px',
        color: 'var(--accent-1)',
        textShadow: '0 0 20px var(--accent-1)',
      }}>
        404
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        this page does not exist (yet)
      </div>
    </div>
  );
}

function Router() {
  return (
    <main className="page-wrapper">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/secret" component={Secret} />
        <Route component={NotFound} />
      </Switch>
    </main>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <MobileWarning />
      <Router />
    </WouterRouter>
  );
}

export default App;
