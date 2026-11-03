import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminDashboard from "./screens/AdminDashboard.jsx";
import ClientsList from "./screens/ClientsList.jsx";
import ClientDetail from "./screens/ClientDetail.jsx";
import LeadsList from "./screens/LeadsList.jsx";
import AnaliseOrigem from "./screens/AnaliseOrigem.jsx";
import { fetchMembrosEquipe } from "./lib/teamApi.js";
import Billing from "./screens/Billing.jsx";
import Intensity from "./screens/Intensity.jsx";
import TasksBoard from "./screens/TasksBoard.jsx";
import Settings from "./screens/Settings.jsx";
import {
  fetchClients,
  fetchLeads,
  fetchTasks,
  setLeadResponsavel,
  createTask,
  updateTaskStatus,
  deleteTask,
  updateClientFields,
  setRecurringBilling,
  clearRecurringBilling,
  setContractStatus,
  setContractDocumentUrl,
  setContractEnvelope,
  addInvoice,
  setInvoiceStatus,
  updateInvoice,
  deleteInvoice,
  markInvoiceAlertSent,
  addIntensityCheck,
  markIntensityMessageSent,
  updateLeadStatus,
  updateLeadTemperatura,
  createLead,
  deleteLead,
  convertLeadToClient,
  createClient,
  fetchArchivedClients,
  archiveClient,
  restoreClient,
  deleteClient,
  setCancelamento,
  reativarCliente,
} from "./lib/adminApi.js";
import { Loader2, Flame, LayoutDashboard, Users, Contact, Megaphone, Wallet, Settings as SettingsIcon } from "lucide-react";
import { currentInvoice } from "./lib/invoices.js";

const TITULOS = {
  dashboard: "Visão geral",
  clientes: "Clientes",
  leads: "Leads",
  analise: "Anúncios e Origem",
  cobrancas: "Cobranças",
  intensidade: "Intensidade",
  tarefas: "Tarefas",
  configuracoes: "Configurações",
};

const HOJE = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Sao_Paulo",
});

const MOBILE_NAV = [
  { key: "dashboard", label: "Início", icon: LayoutDashboard },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "leads", label: "Leads", icon: Contact },
  { key: "analise", label: "Anúncios", icon: Megaphone },
  { key: "cobrancas", label: "Cobranças", icon: Wallet },
  { key: "configuracoes", label: "Config", icon: SettingsIcon },
];

export default function AdminLayout({ session, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("dados");
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [archivedClients, setArchivedClients] = useState([]);
  const [archivedLoaded, setArchivedLoaded] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [buscaLeads, setBuscaLeads] = useState("");
  const [equipe, setEquipe] = useState([]);

  useEffect(() => {
    loadAll();

    // O navegador congela o timer de renovação automática do token
    // quando a aba fica em segundo plano por muito tempo — ao voltar pra
    // ela, o token já expirou. Renova e recarrega sozinho nesse
    // momento, em vez de deixar a pessoa vendo um erro cru de sessão.
    // Silencioso (sem spinner de tela cheia) pra não piscar o painel
    // toda vez que a pessoa só troca de aba e volta.
    function aoVoltarParaAba() {
      if (document.visibilityState === "visible") loadAll({ silencioso: true });
    }
    document.addEventListener("visibilitychange", aoVoltarParaAba);
    return () => document.removeEventListener("visibilitychange", aoVoltarParaAba);
  }, []);

  async function loadAll({ jaTentouRenovar = false, silencioso = false } = {}) {
    if (!silencioso) setLoading(true);
    setLoadError("");
    try {
      const [clientsData, leadsData, tasksData, equipeData] = await Promise.all([
        fetchClients(),
        fetchLeads(),
        fetchTasks(),
        fetchMembrosEquipe().catch(() => []),
      ]);
      setClients(clientsData);
      setLeads(leadsData);
      setTasks(tasksData);
      setEquipe(equipeData);
    } catch (err) {
      const sessaoExpirada = /jwt|token/i.test(err.message || "");
      if (sessaoExpirada && !jaTentouRenovar) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) return loadAll({ jaTentouRenovar: true, silencioso });
      }
      // Numa renovação silenciosa a pessoa nem viu nada quebrar — só
      // mostra o aviso se a tentativa de recarregar em segundo plano
      // também falhou.
      setLoadError(
        sessaoExpirada
          ? "Sua sessão expirou. Atualize a página (F5) — se continuar pedindo, saia e entre de novo."
          : err.message || "Não foi possível carregar os dados do Supabase."
      );
    } finally {
      if (!silencioso) setLoading(false);
    }
  }

  function patchClientLocal(id, patch) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  // Campos simples do cadastro (nome, CNPJ, cardápio, saúde etc.)
  async function updateClient(id, patch) {
    patchClientLocal(id, patch);
    await updateClientFields(id, patch).catch((err) => setLoadError(err.message));
  }

  async function handleSetRecurringBilling(
    client,
    { valor, diaVencimento, proximaCobrancaEm, asaasCustomerId, asaasSubscriptionId, periodicidade, valor2, diaVencimento2, proximaCobrancaEm2, asaasSubscriptionId2 }
  ) {
    await setRecurringBilling(client.id, {
      valor,
      diaVencimento,
      proximaCobrancaEm,
      asaasCustomerId,
      asaasSubscriptionId,
      periodicidade,
      valor2,
      diaVencimento2,
      proximaCobrancaEm2,
      asaasSubscriptionId2,
    });
    const quinzenal = periodicidade === "quinzenal";
    patchClientLocal(client.id, {
      cobrancaRecorrente: {
        ...client.cobrancaRecorrente,
        valor,
        diaVencimento,
        proximaCobrancaEm,
        asaasCustomerId: asaasCustomerId || client.cobrancaRecorrente?.asaasCustomerId || null,
        asaasSubscriptionId: asaasSubscriptionId || client.cobrancaRecorrente?.asaasSubscriptionId || null,
        periodicidade: periodicidade || "mensal",
        valor2: quinzenal ? valor2 : null,
        diaVencimento2: quinzenal ? diaVencimento2 : null,
        proximaCobrancaEm2: quinzenal ? proximaCobrancaEm2 : null,
        asaasSubscriptionId2: quinzenal ? asaasSubscriptionId2 || client.cobrancaRecorrente?.asaasSubscriptionId2 || null : null,
        configuradaEm: new Date().toISOString(),
      },
    });
  }

  async function handleClearRecurringBilling(client) {
    await clearRecurringBilling(client.id);
    patchClientLocal(client.id, {
      cobrancaRecorrente: {
        valor: null,
        diaVencimento: null,
        proximaCobrancaEm: null,
        configuradaEm: null,
        asaasCustomerId: null,
        asaasSubscriptionId: null,
        periodicidade: "mensal",
        valor2: null,
        diaVencimento2: null,
        proximaCobrancaEm2: null,
        asaasSubscriptionId2: null,
      },
    });
  }

  async function handleSetContractStatus(client, status) {
    const evento = await setContractStatus(client.id, status);
    patchClientLocal(client.id, {
      contrato: {
        ...client.contrato,
        status,
        assinadoEm: status === "assinado" ? new Date().toISOString().slice(0, 10) : null,
        historico: [...client.contrato.historico, evento],
      },
    });
  }

  async function handleSetContractDocumentUrl(client, url) {
    patchClientLocal(client.id, { contrato: { ...client.contrato, documentoUrl: url } });
    await setContractDocumentUrl(client.id, url).catch((err) => setLoadError(err.message));
  }

  // Chamado depois que o contrato já foi gerado e enviado pro Clicksign
  // com sucesso (a chamada em si acontece em ContratoTab, que fala
  // direto com o asaas-proxy) — só registra o envelope e o evento aqui.
  async function handleContratoGerado(client, envelopeId, documentoId) {
    const evento = await setContractEnvelope(client.id, envelopeId, documentoId);
    patchClientLocal(client.id, {
      contrato: { ...client.contrato, historico: [...client.contrato.historico, evento] },
    });
  }

  async function handleAddInvoice(client, { valor, vencimento, asaasId, status }) {
    const boleto = await addInvoice(client.id, { valor, vencimento, asaasId, status });
    patchClientLocal(client.id, { boletos: [...client.boletos, boleto] });
  }

  async function handleSetInvoiceStatus(client, invoiceId, status) {
    patchClientLocal(client.id, {
      boletos: client.boletos.map((b) => (b.id === invoiceId ? { ...b, status } : b)),
    });
    await setInvoiceStatus(invoiceId, status).catch((err) => setLoadError(err.message));
  }

  async function handleUpdateInvoice(client, invoiceId, { valor, vencimento, asaasId }) {
    patchClientLocal(client.id, {
      boletos: client.boletos.map((b) => (b.id === invoiceId ? { ...b, valor, vencimento, asaasId } : b)),
    });
    await updateInvoice(invoiceId, { valor, vencimento, asaasId }).catch((err) => setLoadError(err.message));
  }

  async function handleDeleteInvoice(client, invoiceId) {
    patchClientLocal(client.id, {
      boletos: client.boletos.filter((b) => b.id !== invoiceId),
    });
    await deleteInvoice(invoiceId).catch((err) => setLoadError(err.message));
  }

  async function handleMarkInvoiceAlertSent(client, invoiceId) {
    const hoje = await markInvoiceAlertSent(invoiceId);
    patchClientLocal(client.id, {
      boletos: client.boletos.map((b) => (b.id === invoiceId ? { ...b, alertaEnviadoEm: hoje } : b)),
    });
  }

  async function handleAddIntensityCheck(client, { status, observacao }) {
    const check = await addIntensityCheck(client.id, { status, observacao });
    patchClientLocal(client.id, {
      intensidade: {
        status: check.status,
        observacao: check.observacao,
        atualizadoEm: check.data,
        historico: [...client.intensidade.historico, check],
      },
    });
  }

  async function handleMarkIntensityMessageSent(client) {
    const historico = [...client.intensidade.historico];
    const ultima = historico[historico.length - 1];
    if (!ultima) return;
    historico[historico.length - 1] = { ...ultima, mensagemEnviada: true };
    patchClientLocal(client.id, { intensidade: { ...client.intensidade, historico } });
    await markIntensityMessageSent(ultima.id).catch((err) => setLoadError(err.message));
  }

  function navigate(key) {
    setSelectedClientId(null);
    setBuscaLeads("");
    setActive(key);
  }

  // Quem falou com o lead. A trava da primeira marcação é do banco; aqui
  // só atualizamos a lista com o que ele devolveu.
  async function handleDefinirResponsavelLead(lead, membro) {
    const salvo = await setLeadResponsavel(lead.id, membro.id);
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, responsavelId: salvo.responsavelId, responsavelEm: salvo.responsavelEm } : l))
    );
  }

  // Clique num lead da Análise de Anúncios: abre a aba Leads já filtrada nele.
  function abrirLeadNaLista(lead) {
    setSelectedClientId(null);
    setBuscaLeads(lead.nome || "");
    setActive("leads");
  }

  function openClient(id, tab = "dados") {
    setSelectedClientId(id);
    setSelectedTab(tab);
  }

  function openClientTab(id, tab) {
    setActive("clientes");
    openClient(id, tab);
  }

  async function handleUpdateLeadStatus(lead, status) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    await updateLeadStatus(lead.id, status).catch((err) => setLoadError(err.message));
  }

  async function handleUpdateLeadTemperatura(lead, temperatura) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, temperatura } : l)));
    await updateLeadTemperatura(lead.id, temperatura).catch((err) => setLoadError(err.message));
  }

  async function handleCreateLead(fields) {
    const novoLead = await createLead(fields);
    setLeads((prev) => [novoLead, ...prev]);
  }

  async function handleDeleteLead(lead) {
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    await deleteLead(lead.id).catch((err) => setLoadError(err.message));
  }

  async function convertLead(lead, cobranca) {
    const { avisoAsaas, ...novoCliente } = await convertLeadToClient(lead, cobranca);
    setClients((prev) => [novoCliente, ...prev]);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: "convertido" } : l)));
    return { avisoAsaas };
  }

  async function handleCreateClient(fields) {
    const novoCliente = await createClient(fields);
    setClients((prev) => [novoCliente, ...prev]);
    openClient(novoCliente.id, "dados");
  }

  async function loadArchivedClients() {
    if (archivedLoaded) return;
    setLoadingArchived(true);
    try {
      const data = await fetchArchivedClients();
      setArchivedClients(data);
      setArchivedLoaded(true);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoadingArchived(false);
    }
  }

  async function handleArchiveClient(client) {
    const arquivadoEm = await archiveClient(client.id);
    setClients((prev) => prev.filter((c) => c.id !== client.id));
    setArchivedClients((prev) => [{ ...client, arquivadoEm }, ...prev]);
    if (selectedClientId === client.id) setSelectedClientId(null);
  }

  async function handleSetCancelamento(client, motivo) {
    const canceladoEm = await setCancelamento(client.id, motivo);
    patchClientLocal(client.id, { canceladoEm, motivoCancelamento: motivo || "", saude: "inativo" });
  }

  async function handleReativarCliente(client) {
    await reativarCliente(client.id);
    patchClientLocal(client.id, { canceladoEm: null, motivoCancelamento: "" });
  }

  async function handleCreateTask(fields) {
    const novaTarefa = await createTask(fields);
    setTasks((prev) => [novaTarefa, ...prev]);
  }

  async function handleUpdateTaskStatus(task, status) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    await updateTaskStatus(task.id, status).catch((err) => setLoadError(err.message));
  }

  async function handleDeleteTask(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await deleteTask(task.id).catch((err) => setLoadError(err.message));
  }

  async function handleRestoreClient(client) {
    await restoreClient(client.id);
    setArchivedClients((prev) => prev.filter((c) => c.id !== client.id));
    setClients((prev) => [{ ...client, arquivadoEm: null }, ...prev]);
  }

  async function handleDeleteClient(client) {
    await deleteClient(client.id);
    setArchivedClients((prev) => prev.filter((c) => c.id !== client.id));
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const clientHandlers = {
    onUpdate: updateClient,
    onSetRecurringBilling: handleSetRecurringBilling,
    onClearRecurringBilling: handleClearRecurringBilling,
    onSetContractStatus: handleSetContractStatus,
    onSetContractDocumentUrl: handleSetContractDocumentUrl,
    onContratoGerado: handleContratoGerado,
    onAddInvoice: handleAddInvoice,
    onSetInvoiceStatus: handleSetInvoiceStatus,
    onUpdateInvoice: handleUpdateInvoice,
    onDeleteInvoice: handleDeleteInvoice,
    onMarkInvoiceAlertSent: handleMarkInvoiceAlertSent,
    onAddIntensityCheck: handleAddIntensityCheck,
    onMarkIntensityMessageSent: handleMarkIntensityMessageSent,
    onArchiveClient: handleArchiveClient,
    onSetCancelamento: handleSetCancelamento,
    onReativarCliente: handleReativarCliente,
  };

  const contadores = {
    clientes: clients.filter((c) => !c.canceladoEm).length,
    leads: leads.length,
    cobrancas: clients.filter((c) => currentInvoice(c.boletos)?.status === "atrasado").length,
    tarefas: tasks.filter((t) => t.status !== "feito").length,
  };

  const dataDeHoje = HOJE.format(new Date());

  return (
    <div className="painel flex min-h-screen bg-base text-ink">
      <AdminSidebar
        active={active}
        onNavigate={navigate}
        session={session}
        onLogout={onLogout}
        contadores={contadores}
      />

      {/* min-w-0: sem isso, uma faixa larga (a pipeline) empurra a coluna
          inteira e quem rola na horizontal é a página, levando junto o
          menu lateral e a barra de cima. */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface/60 px-5 py-3.5 lg:hidden">
          <span className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-brand to-flame text-base">
              <Flame size={13} strokeWidth={2.4} />
            </span>
            {TITULOS[active] || "Painel"}
          </span>
          <button onClick={onLogout} className="text-xs text-ink-muted hover:text-ink">
            Sair
          </button>
        </div>

        <div className="hidden items-center justify-between gap-4 border-b border-line bg-surface/50 px-10 py-3 lg:flex">
          <p className="text-[12.5px] text-ink-dim">
            Painel <span className="px-1.5 text-ink-dim/60">/</span>
            <span className="font-semibold text-ink">{TITULOS[active] || "Painel"}</span>
          </p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-dim">{dataDeHoje}</p>
        </div>

        <main className="flex-1 px-5 pb-24 pt-7 md:px-10 md:pb-24 md:pt-9 lg:pb-10">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Loader2 size={16} className="animate-spin" /> Carregando dados do Supabase...
            </div>
          )}

          {!loading && loadError && (
            <div className="mb-6 rounded-xl border border-flame/30 bg-flame/5 px-4 py-3 text-sm text-flame">{loadError}</div>
          )}

          {!loading && (
            <>
              {active === "dashboard" && (
                <AdminDashboard clients={clients} leads={leads} onNavigate={navigate} onOpenClient={openClientTab} />
              )}

              {active === "clientes" &&
                (selectedClient ? (
                  <ClientDetail
                    key={`${selectedClient.id}:${selectedTab}`}
                    client={selectedClient}
                    initialTab={selectedTab}
                    {...clientHandlers}
                    onBack={() => setSelectedClientId(null)}
                  />
                ) : (
                  <ClientsList
                    clients={clients}
                    onOpenClient={openClient}
                    onCreateClient={handleCreateClient}
                    archivedClients={archivedClients}
                    loadingArchived={loadingArchived}
                    onLoadArchived={loadArchivedClients}
                    onRestoreClient={handleRestoreClient}
                    onDeleteClient={handleDeleteClient}
                  />
                ))}

              {active === "leads" && (
                <LeadsList
                  leads={leads}
                  onUpdateStatus={handleUpdateLeadStatus}
                  onUpdateTemperatura={handleUpdateLeadTemperatura}
                  onCreateLead={handleCreateLead}
                  onDeleteLead={handleDeleteLead}
                  onConvert={convertLead}
                  buscaInicial={buscaLeads}
                  equipe={equipe}
                  souAdmin={equipe.some((m) => m.id === session?.id && m.admin)}
                  onDefinirResponsavel={handleDefinirResponsavelLead}
                />
              )}

              {active === "analise" && <AnaliseOrigem leads={leads} onAbrirLead={abrirLeadNaLista} />}

              {active === "cobrancas" && (
                <Billing
                  clients={clients}
                  onSetInvoiceStatus={handleSetInvoiceStatus}
                  onMarkInvoiceAlertSent={handleMarkInvoiceAlertSent}
                  onOpenClient={(id) => openClientTab(id, "cobranca")}
                />
              )}

              {active === "intensidade" && (
                <Intensity
                  clients={clients}
                  onMarkMessageSent={handleMarkIntensityMessageSent}
                  onOpenClient={(id) => openClientTab(id, "intensidade")}
                />
              )}

              {active === "tarefas" && (
                <TasksBoard
                  tasks={tasks}
                  clients={clients}
                  leads={leads}
                  onCreateTask={handleCreateTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                  onOpenClient={openClientTab}
                />
              )}

              {active === "configuracoes" && <Settings session={session} />}
            </>
          )}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {MOBILE_NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[9.5px] transition-colors ${
                active === key ? "text-emerald-brand" : "text-ink-dim"
              }`}
            >
              <Icon size={17} strokeWidth={active === key ? 2.2 : 1.8} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
