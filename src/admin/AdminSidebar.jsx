import { useState } from "react";
import { ShieldCheck, LayoutDashboard, Users, Contact, Wallet, Activity, Settings, LogOut, Menu } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clientes", label: "Clientes (CRM)", icon: Users },
  { key: "leads", label: "Leads", icon: Contact },
  { key: "cobrancas", label: "Cobranças", icon: Wallet },
  { key: "intensidade", label: "Intensidade", icon: Activity },
  { key: "configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminSidebar({ active, onNavigate, session, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-line/60 bg-surface/40 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-6 ${collapsed ? "justify-center" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
          <ShieldCheck size={18} />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block truncate font-display text-base font-semibold leading-tight tracking-wide text-ink">
              Aceleração Delivery
            </span>
            <span className="block truncate text-[11px] leading-tight text-ink-dim">Painel interno</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        className={`mx-3 mb-3 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <Menu size={16} className="shrink-0" />
        {!collapsed && "Recolher menu"}
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              title={collapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-emerald-brand/15 text-emerald-bright"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-line/60 p-4">
        <div className={`flex items-center gap-3 rounded-xl px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm font-semibold text-ink">
            {(session?.name || "E")[0].toUpperCase()}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{session?.name || "Equipe"}</p>
              <p className="truncate text-xs text-ink-dim">{session?.email}</p>
            </div>
          )}
          <button onClick={onLogout} aria-label="Sair" title="Sair" className="shrink-0 text-ink-dim hover:text-ink">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
