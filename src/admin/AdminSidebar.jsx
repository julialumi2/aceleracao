import { ShieldCheck, LayoutDashboard, Users, Contact, Wallet, Activity, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clientes", label: "Clientes (CRM)", icon: Users },
  { key: "leads", label: "Leads", icon: Contact },
  { key: "cobrancas", label: "Cobranças", icon: Wallet },
  { key: "intensidade", label: "Intensidade", icon: Activity },
  { key: "configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminSidebar({ active, onNavigate, session, onLogout }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line/60 bg-surface/40 lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
          <ShieldCheck size={18} />
        </span>
        <div>
          <span className="block font-display text-base font-semibold leading-tight tracking-wide text-ink">Aceleração Delivery</span>
          <span className="block text-[11px] leading-tight text-ink-dim">Painel interno</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-brand/15 text-emerald-bright"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-line/60 p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-sm font-semibold text-ink">
            {(session?.name || "E")[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{session?.name || "Equipe"}</p>
            <p className="truncate text-xs text-ink-dim">{session?.email}</p>
          </div>
          <button onClick={onLogout} aria-label="Sair" className="text-ink-dim hover:text-ink">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
