import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminDashboard from "./screens/AdminDashboard.jsx";
import ClientsList from "./screens/ClientsList.jsx";
import ClientDetail from "./screens/ClientDetail.jsx";
import LeadsList from "./screens/LeadsList.jsx";
import Billing from "./screens/Billing.jsx";
import Intensity from "./screens/Intensity.jsx";
import TasksBoard from "./screens/TasksBoard.jsx";
import Settings from "./screens/Settings.jsx";
import {
  fetchClients,
  fetchLeads,
  fetchTasks,
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
  setCancelamento,
  reativarCliente,
} from "./lib/adminApi.js";
import { Loader2, LayoutDashboard, Users, Contact, Wallet, Settings as SettingsIcon } from "lucide-react";

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
  const [selectedTab, setSelectedTab] = useState("dados");
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [archivedClients, setArchivedClients] = useState([]);
  const [archivedLoaded, setArchivedLoaded] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setLoadError("");
    try {
      const [clientsData, leadsData, tasksData] = await Promise.all([fetchClients(), fetchLeads(), fetchTasks()]);
      setClients(clientsData);
      setLeads(leadsData);
      setTasks(tasksData);
    } catch (err) {
      setLoadError(err.message || "Não foi possível carregar os dados do Supabase.");
    } finally {
      setLoading(false);
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
  async function handleContratoGerado(client, envelopeId) {
    const evento = await setContractEnvelope(client.id, envelopeId);
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
    setActive(key);
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

  async function convertLead(lead) {
    const novoCliente = await convertLeadToClient(lead);
    setClients((prev) => [novoCliente, ...prev]);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: "convertido" } : l)));
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

  return (
    <div className="flex min-h-screen bg-base text-ink">
      <AdminSidebar active={active} onNavigate={navigate} session={session} onLogout={onLogout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line/60 bg-surface/40 px-5 py-4 lg:hidden">
          <span className="font-display text-base tracking-wide text-ink">Painel interno</span>
          <button onClick={onLogout} className="text-xs text-ink-muted">Sair</button>
        </div>

        <main className="flex-1 px-5 pt-8 pb-24 md:px-10 md:pt-10 md:pb-24 lg:pb-10">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Loader2 size={16} className="animate-spin" /> Carregando dados do Supabase...
            </div>
          )}

          {!loading && loadError && (
            <div className="mb-6 rounded-xl border border-flame/30 bg-flame/5 px-4 py-3 text-sm text-flame">
              {loadError} — conferindo com dados já carregados nesta sessão.
            </div>
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
                />
              )}

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

        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line/60 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
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
