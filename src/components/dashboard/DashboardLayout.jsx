import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import DashboardHome from "./DashboardHome.jsx";
import OnboardingForm from "./OnboardingForm.jsx";
import { LayoutDashboard, Store, UtensilsCrossed, FileSignature } from "lucide-react";

const MOBILE_NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "restaurante", label: "Restaurante", icon: Store },
  { key: "cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { key: "contratos", label: "Contratos", icon: FileSignature },
];

export default function DashboardLayout({ session, onLogout }) {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-base text-ink">
      <Sidebar active={active} onNavigate={setActive} session={session} onLogout={onLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar mobile */}
        <div className="flex items-center justify-between border-b border-line/60 bg-surface/40 px-5 py-4 lg:hidden">
          <span className="font-display text-base font-semibold tracking-wide text-ink">Aceleração Delivery</span>
          <button onClick={onLogout} className="text-xs text-ink-muted">Sair</button>
        </div>

        <main className="flex-1 px-5 py-8 md:px-10 md:py-10">
          {active === "dashboard" && <DashboardHome session={session} onNavigate={setActive} />}
          {active === "restaurante" && <OnboardingForm section="cadastrais" />}
          {active === "cardapio" && <OnboardingForm section="operacao" />}
          {active === "contratos" && <DashboardHome session={session} onNavigate={setActive} onlyStatus />}
        </main>

        {/* Nav mobile */}
        <nav className="grid grid-cols-4 border-t border-line/60 bg-surface/60 lg:hidden">
          {MOBILE_NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] ${
                active === key ? "text-emerald-bright" : "text-ink-dim"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
