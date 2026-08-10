import { useState } from "react";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminDashboard from "./screens/AdminDashboard.jsx";
import ClientsList from "./screens/ClientsList.jsx";
import ClientDetail from "./screens/ClientDetail.jsx";
import LeadsList from "./screens/LeadsList.jsx";
import Billing from "./screens/Billing.jsx";
import Settings from "./screens/Settings.jsx";
import { INITIAL_CLIENTS, INITIAL_LEADS } from "./lib/mockData.js";
import { LayoutDashboard, Users, Contact, Wallet, Settings as SettingsIcon } from "lucide-react";

const MOBILE_NAV = [
  { key: "dashboard", label: "Início", icon: LayoutDashboard },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "leads", label: "Leads", icon: Contact },
  { key: "cobrancas", label: "Cobranças", icon: Wallet },
  { key: "configuracoes", label: "Config", icon: SettingsIcon },
];

export default function AdminLayout({ session, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [leads, setLeads] = useState(INITIAL_LEADS);

  function updateClient(id, patch) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function navigate(key) {
    setSelectedClientId(null);
    setActive(key);
  }

  function openClient(id) {
    setSelectedClientId(id);
  }

  function convertLead(lead) {
    setClients((prev) => [
      ...prev,
      {
        id: `c-${lead.id}`,
        nome: lead.nome,
        cnpj: "",
        endereco: "",
        telefone: lead.telefone,
        email: lead.email,
        contrato: { status: "pendente", documentoUrl: "", assinadoEm: null },
        boleto: { status: "pendente", valor: 997, vencimento: "" },
        intensidade: { status: "ativo", observacao: "Cliente recém-convertido.", atualizadoEm: new Date().toISOString().slice(0, 10) },
      },
    ]);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: "convertido" } : l)));
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  return (
    <div className="flex min-h-screen bg-base text-ink">
      <AdminSidebar active={active} onNavigate={navigate} session={session} onLogout={onLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line/60 bg-surface/40 px-5 py-4 lg:hidden">
          <span className="font-display text-base font-semibold text-ink">Painel interno</span>
          <button onClick={onLogout} className="text-xs text-ink-muted">Sair</button>
        </div>

        <main className="flex-1 px-5 py-8 md:px-10 md:py-10">
          {active === "dashboard" && <AdminDashboard clients={clients} leads={leads} onNavigate={navigate} />}

          {active === "clientes" &&
            (selectedClient ? (
              <ClientDetail client={selectedClient} onUpdate={updateClient} onBack={() => setSelectedClientId(null)} />
            ) : (
              <ClientsList clients={clients} onOpenClient={openClient} />
            ))}

          {active === "leads" && <LeadsList leads={leads} setLeads={setLeads} onConvert={convertLead} />}

          {active === "cobrancas" && <Billing clients={clients} onOpenClient={(id) => { setActive("clientes"); openClient(id); }} />}

          {active === "configuracoes" && <Settings />}
        </main>

        <nav className="grid grid-cols-5 border-t border-line/60 bg-surface/60 lg:hidden">
          {MOBILE_NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] ${
                active === key ? "text-emerald-bright" : "text-ink-dim"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
