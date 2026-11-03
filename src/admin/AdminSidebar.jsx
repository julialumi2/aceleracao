import { useState } from "react";
import {
  Flame,
  LayoutDashboard,
  Users,
  Contact,
  Megaphone,
  Wallet,
  Activity,
  ListTodo,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// Agrupado pelo que a equipe faz, não pela ordem em que as telas
// nasceram: o dia a dia (operação) em cima, aquisição no meio, ajuste
// de sistema por último.
const GRUPOS = [
  {
    rotulo: "Operação",
    itens: [
      { key: "dashboard", label: "Visão geral", icon: LayoutDashboard },
      { key: "clientes", label: "Clientes", icon: Users, contador: "clientes" },
      { key: "leads", label: "Leads", icon: Contact, contador: "leads" },
      { key: "cobrancas", label: "Cobranças", icon: Wallet, contador: "cobrancas" },
      { key: "intensidade", label: "Intensidade", icon: Activity },
    ],
  },
  {
    rotulo: "Aquisição",
    itens: [
      { key: "analise", label: "Anúncios e Origem", icon: Megaphone },
      { key: "tarefas", label: "Tarefas", icon: ListTodo, contador: "tarefas" },
    ],
  },
  {
    rotulo: "Sistema",
    itens: [{ key: "configuracoes", label: "Configurações", icon: Settings }],
  },
];

export default function AdminSidebar({ active, onNavigate, session, onLogout, contadores = {} }) {
  const [recolhida, setRecolhida] = useState(false);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex ${
        recolhida ? "w-[72px]" : "w-60"
      }`}
    >
      <div className={`flex items-center gap-2.5 px-4 py-4 ${recolhida ? "justify-center" : "justify-between"}`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-emerald-brand to-flame text-base">
            <Flame size={15} strokeWidth={2.4} />
          </span>
          {!recolhida && (
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold leading-tight tracking-tight text-ink">
                Aceleração
              </span>
              <span className="block truncate text-[11px] leading-tight text-ink-dim">Painel interno</span>
            </span>
          )}
        </div>
        {!recolhida && (
          <button
            onClick={() => setRecolhida(true)}
            aria-label="Recolher menu"
            title="Recolher menu"
            className="shrink-0 rounded-lg p-1.5 text-ink-dim transition-colors hover:bg-surface-raised hover:text-ink"
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {recolhida && (
        <div className="mb-1 flex justify-center">
          <button
            onClick={() => setRecolhida(false)}
            aria-label="Expandir menu"
            title="Expandir menu"
            className="rounded-lg p-1.5 text-ink-dim transition-colors hover:bg-surface-raised hover:text-ink"
          >
            <PanelLeftOpen size={15} />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {GRUPOS.map((grupo) => (
          <div key={grupo.rotulo} className="mb-1">
            {recolhida ? (
              <div className="mx-2 my-3 border-t border-line" />
            ) : (
              <p className="px-2 pb-1.5 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
                {grupo.rotulo}
              </p>
            )}

            <div className="space-y-0.5">
              {grupo.itens.map(({ key, label, icon: Icone, contador }) => {
                const ativo = active === key;
                const valor = contadores[contador];
                return (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    aria-current={ativo ? "page" : undefined}
                    title={recolhida ? label : undefined}
                    className={`relative flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13.5px] transition-colors ${
                      recolhida ? "justify-center" : ""
                    } ${
                      ativo
                        ? "bg-surface-raised font-semibold text-ink"
                        : "font-medium text-ink-muted hover:bg-surface-raised/60 hover:text-ink"
                    }`}
                  >
                    {/* fio de brasa: marca a tela aberta sem precisar de fundo forte */}
                    {ativo && (
                      <span className="absolute -left-3 bottom-1.5 top-1.5 w-[2px] rounded-r bg-gradient-to-b from-emerald-brand to-flame" />
                    )}
                    <Icone size={16} className="shrink-0" strokeWidth={ativo ? 2.1 : 1.8} />
                    {!recolhida && <span className="truncate text-left">{label}</span>}
                    {!recolhida && valor > 0 && (
                      <span className="ml-auto font-mono text-[10.5px] tabular-nums text-ink-dim">{valor}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className={`flex items-center gap-2.5 ${recolhida ? "justify-center" : ""}`}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-line-forte bg-surface-raised text-[12px] font-semibold text-ink-muted">
            {(session?.name || "E")[0].toUpperCase()}
          </span>
          {!recolhida && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-ink">{session?.name || "Equipe"}</p>
                <p className="truncate text-[11px] text-ink-dim">{session?.email}</p>
              </div>
              <button
                onClick={onLogout}
                aria-label="Sair"
                title="Sair"
                className="shrink-0 rounded-lg p-1.5 text-ink-dim transition-colors hover:bg-surface-raised hover:text-ink"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
