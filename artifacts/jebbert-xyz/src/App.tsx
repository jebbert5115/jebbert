import { Router as WouterRouter } from "wouter";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import { SiteLayout } from "@/components/SiteLayout";

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ConstellationCanvas />
      <main className="page-wrapper">
        <SiteLayout />
      </main>
    </WouterRouter>
  );
}

export default App;
