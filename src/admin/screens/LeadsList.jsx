import { useState } from "react";
import { UserPlus, MessageCircle, Search, Plus, Trash2, ChevronDown, ChevronUp, LayoutList, Kanban } from "lucide-react";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { leadFirstContactMessage } from "../lib/messageTemplates.js";
import OrigemCampanha from "../components/OrigemCampanha.jsx";

// Os valores antigos (contatado, convertido, descartado) continuam os mesmos
// no banco — só o nome na tela mudou. "convertido" é a conversão em cliente.
const STATUSES = [
  { valor: "novo", rotulo: "Novo" },
  { valor: "contatado", rotulo: "Em Contato" },
  { valor: "qualificado", rotulo: "Qualificado" },
  { valor: "reuniao_agendada", rotulo: "Reunião Agendada" },
  { valor: "follow_up", rotulo: "Follow Up" },
  { valor: "convertido", rotulo: "Fechado" },
  { valor: "descartado", rotulo: "Desqualificado" },
];
const TEMPERATURAS = ["frio", "morno", "quente"];
const ORIGENS = [
  { value: "indicacao_equipe", label: "Indicação da equipe" },
  { value: "trafego_pago", label: "Tráfego pago" },
  { value: "bio_instagram", label: "Bio do Instagram" },
  { value: "outro", label: "Outro" },
];

// Soltar um card em "Fechado" não muda o status direto: abre a janela de
// conversão, que cria o cliente. A coluna fica sempre vazia porque lead
// convertido some da tela de Leads.
const COR_COLUNA = {
  novo: "bg-emerald-brand",
  convertido: "bg-emerald-bright",
  descartado: "bg-flame-dim",
};

const COR_TEMPERATURA = {
  quente: "bg-flame",
  morno: "bg-emerald-brand",
  frio: "bg-ink-dim",
};

const PESO_TEMPERATURA = { quente: 3, morno: 2, frio: 1 };

const ORDENACOES = {
  recentes: { rotulo: "Mais recentes", comparar: (a, b) => b.criadoEm.localeCompare(a.criadoEm) },
  quentes: {
    rotulo: "Mais quentes",
    comparar: (a, b) =>
      (PESO_TEMPERATURA[b.temperatura] || 0) - (PESO_TEMPERATURA[a.temperatura] || 0) || b.criadoEm.localeCompare(a.criadoEm),
  },
  antigos: { rotulo: "Mais antigos", comparar: (a, b) => a.criadoEm.localeCompare(b.criadoEm) },
};

const CHAVE_VISUALIZACAO = "leads-visualizacao";

function lerVisualizacao() {
  try {
    return localStorage.getItem(CHAVE_VISUALIZACAO) === "pipeline" ? "pipeline" : "lista";
  } catch {
    return "lista";
  }
}

function relativeDaysLabel(iso) {
  const dias = Math.floor((new Date() - new Date(iso)) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return "recebido hoje";
  if (dias === 1) return "recebido ontem";
  return `recebido há ${dias} dias`;
}

function textInputClass() {
  return "w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none";
}

function ConverterClienteModal({ lead, onClose, onConfirmar }) {
  const [valor, setValor] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [convertendo, setConvertendo] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const podeConfirmar = Number(valor) > 0 && dataInicio;

  async function confirmar() {
    if (!podeConfirmar || convertendo) return;
    setErro("");
    setAviso("");
    setConvertendo(true);
    try {
      const resultado = await onConfirmar(lead, { valor: Number(valor), dataInicio });
      if (resultado?.avisoAsaas) {
        setAviso(resultado.avisoAsaas);
      } else {
        onClose();
      }
    } catch (err) {
      setErro(err.message || "Não foi possível converter o lead. Tenta de novo.");
    } finally {
      setConvertendo(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
        <p className="font-display text-base tracking-wide text-ink">Converter {lead.nome} em cliente</p>
        <p className="mt-1 text-xs text-ink-dim">
          Isso já configura a cobrança recorrente mensal — dá pra ajustar depois na aba Cobrança do cliente.
        </p>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Valor combinado (R$/mês)</span>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="2500"
              className={textInputClass()}
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Data que inicia a recorrência</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={textInputClass()}
            />
          </label>
        </div>

        {erro && <p className="mt-3 text-sm text-flame">{erro}</p>}
        {aviso && <p className="mt-3 text-sm text-emerald-bright">{aviso}</p>}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={confirmar}
            disabled={!podeConfirmar || convertendo}
            className="rounded-xl bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
          >
            {convertendo ? "Convertendo..." : aviso ? "Concluir" : "Converter"}
          </button>
          <button onClick={onClose} className="text-sm text-ink-muted hover:text-ink">
            {aviso ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadRespostas({ lead, compacto = false }) {
  const itens = [
    ["Nome do negócio", lead.nomeNegocio],
    ["Cidade", lead.cidade && lead.estado ? `${lead.cidade} - ${lead.estado}` : lead.cidade || lead.estado],
    ["Faturamento mensal", lead.faturamentoMensal],
    ["Maior gargalo", lead.maiorGargalo],
    ["Gestor de tráfego", lead.gestorTrafego],
    ["Mensagem", lead.mensagem],
  ].filter(([, valor]) => valor);

  const moldura = compacto ? "" : "mt-4 border-t border-line/60 pt-4";

  if (itens.length === 0) {
    return <p className={`${moldura} text-xs text-ink-dim`}>Sem respostas adicionais do formulário.</p>;
  }

  return (
    <dl className={`${moldura} grid ${compacto ? "gap-2.5" : "gap-3 sm:grid-cols-2"}`}>
      {itens.map(([label, valor]) => (
        <div key={label}>
          <dt className="text-xs font-medium text-ink-dim">{label}</dt>
          <dd className="mt-0.5 text-sm text-ink">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function LeadsList({ leads, onUpdateStatus, onUpdateTemperatura, onCreateLead, onDeleteLead, onConvert }) {
  const [query, setQuery] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ nome: "", telefone: "", email: "", origem: "indicacao_equipe", temperatura: "morno" });
  const [salvando, setSalvando] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [convertendoLead, setConvertendoLead] = useState(null);
  const [visualizacao, setVisualizacao] = useState(lerVisualizacao);

  function trocarVisualizacao(nova) {
    setVisualizacao(nova);
    try {
      localStorage.setItem(CHAVE_VISUALIZACAO, nova);
    } catch {
      // Sem armazenamento no navegador — a escolha vale só nesta visita.
    }
  }

  // "convertido" nunca é gravado direto: sem passar pela conversão, o lead
  // sumia daqui sem virar cliente.
  function mudarStatus(lead, status) {
    if (status === lead.status) return;
    if (status === "convertido") {
      setConvertendoLead(lead);
      return;
    }
    onUpdateStatus(lead, status);
  }

  // Lead convertido já virou cliente — some da área de leads, o registro
  // continua existindo (status "convertido"), só não aparece mais aqui.
  const filtered = leads.filter(
    (lead) => lead.status !== "convertido" && lead.nome.toLowerCase().includes(query.toLowerCase())
  );

  async function salvarNovoLead() {
    if (!novo.nome.trim() || salvando) return;
    setSalvando(true);
    try {
      await onCreateLead(novo);
      setNovo({ nome: "", telefone: "", email: "", origem: "indicacao_equipe", temperatura: "morno" });
      setMostrarForm(false);
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao(lead) {
    if (excluindo) return;
    setExcluindo(true);
    try {
      await onDeleteLead(lead);
      setConfirmDeleteId(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className={visualizacao === "pipeline" ? "" : "mx-auto max-w-4xl"}>
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <h1 className="font-display text-2xl tracking-wide text-ink">Leads</h1>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div role="group" aria-label="Visualização" className="flex rounded-xl border border-line bg-surface p-1">
              {[
                { valor: "lista", rotulo: "Lista", Icone: LayoutList },
                { valor: "pipeline", rotulo: "Pipeline", Icone: Kanban },
              ].map(({ valor, rotulo, Icone }) => (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={visualizacao === valor}
                  onClick={() => trocarVisualizacao(valor)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    visualizacao === valor ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <Icone size={14} />
                  {rotulo}
                </button>
              ))}
            </div>
            <div className="order-last flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 sm:order-none sm:w-64">
              <Search size={15} className="text-ink-dim" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar lead..."
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
              />
            </div>
            <button
              onClick={() => setMostrarForm((v) => !v)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-brand px-4 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
            >
              <Plus size={15} />
              Adicionar lead
            </button>
          </div>
        </div>
        <p className="mt-3 hidden text-sm text-ink-muted sm:block">
          Respostas do formulário de captação, sincronizadas na tabela <code className="font-mono text-xs">leads</code>.
        </p>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm font-medium text-ink">Novo lead</p>
          <p className="mt-1 text-xs text-ink-dim">Indicação da equipe, ou quem respondeu o formulário de tráfego frio — cadastra aqui pra entrar no funil.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Nome</span>
              <input
                value={novo.nome}
                onChange={(e) => setNovo((n) => ({ ...n, nome: e.target.value }))}
                className={textInputClass()}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Telefone (WhatsApp)</span>
              <input
                value={novo.telefone}
                onChange={(e) => setNovo((n) => ({ ...n, telefone: e.target.value }))}
                className={textInputClass()}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">E-mail (opcional)</span>
              <input
                value={novo.email}
                onChange={(e) => setNovo((n) => ({ ...n, email: e.target.value }))}
                className={textInputClass()}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Origem</span>
              <select
                value={novo.origem}
                onChange={(e) => setNovo((n) => ({ ...n, origem: e.target.value }))}
                className={textInputClass()}
              >
                {ORIGENS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-surface text-ink">
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Temperatura</span>
            <div className="flex gap-2">
              {TEMPERATURAS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNovo((n) => ({ ...n, temperatura: t }))}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium capitalize transition-colors ${
                    novo.temperatura === t ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={salvarNovoLead}
              disabled={!novo.nome.trim() || salvando}
              className="rounded-xl bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              Salvar lead
            </button>
            <button onClick={() => setMostrarForm(false)} className="text-sm text-ink-muted hover:text-ink">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {visualizacao === "pipeline" ? (
        <LeadsPipeline
          leads={filtered}
          todos={leads}
          semLeads={leads.length === 0}
          onMudarStatus={mudarStatus}
          onUpdateTemperatura={onUpdateTemperatura}
          confirmDeleteId={confirmDeleteId}
          onPedirExclusao={setConfirmDeleteId}
          onConfirmarExclusao={confirmarExclusao}
          excluindo={excluindo}
        />
      ) : (
      <div className="space-y-3">
        {filtered.map((lead) => {
          const waLink = buildWhatsAppLink(lead.telefone, leadFirstContactMessage(lead));
          const recente = Math.floor((new Date() - new Date(lead.criadoEm)) / (1000 * 60 * 60 * 24)) <= 1;
          const expandido = expandedId === lead.id;
          const confirmandoExclusao = confirmDeleteId === lead.id;

          return (
            <div key={lead.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandido ? null : lead.id)}
                  className="group flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{lead.nome}</p>
                    {recente && lead.status === "novo" && (
                      <span className="rounded-full bg-emerald-brand/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-bright">
                        NOVO
                      </span>
                    )}
                    {expandido ? (
                      <ChevronUp size={13} className="text-ink-dim transition-colors group-hover:text-ink" />
                    ) : (
                      <ChevronDown size={13} className="text-ink-dim transition-colors group-hover:text-ink" />
                    )}
                  </div>
                  <p className="text-xs text-ink-dim">
                    {lead.nomeNegocio ? `${lead.nomeNegocio} · ` : ""}
                    {lead.cidade ? `${lead.cidade}${lead.estado ? `/${lead.estado}` : ""} · ` : ""}
                    {lead.email || lead.telefone || "sem contato"} · {relativeDaysLabel(lead.criadoEm)}
                  </p>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => mudarStatus(lead, e.target.value)}
                    className="rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.valor} value={s.valor} className="bg-surface text-ink">
                        {s.rotulo}
                      </option>
                    ))}
                  </select>

                  <select
                    value={lead.temperatura || ""}
                    onChange={(e) => onUpdateTemperatura(lead, e.target.value || null)}
                    className="rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                  >
                    <option value="" className="bg-surface text-ink">
                      sem temperatura
                    </option>
                    {TEMPERATURAS.map((t) => (
                      <option key={t} value={t} className="bg-surface text-ink">
                        {t}
                      </option>
                    ))}
                  </select>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-brand/40 px-3 py-1.5 text-xs font-medium text-emerald-bright transition-colors hover:bg-emerald-brand/10"
                  >
                    <MessageCircle size={13} />
                    Chamar no WhatsApp
                  </a>

                  {lead.status !== "convertido" && (
                    <button
                      onClick={() => setConvertendoLead(lead)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-brand px-3 py-1.5 text-xs font-medium text-base transition-colors hover:bg-emerald-bright"
                    >
                      <UserPlus size={13} />
                      Converter em cliente
                    </button>
                  )}

                  <button
                    onClick={() => setConfirmDeleteId(lead.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-flame/40 hover:text-flame"
                    title="Excluir lead"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {confirmandoExclusao && (
                <div className="mt-4 flex items-center gap-3 border-t border-line/60 pt-4">
                  <p className="text-xs text-ink-muted">Excluir este lead permanentemente?</p>
                  <button
                    onClick={() => confirmarExclusao(lead)}
                    disabled={excluindo}
                    className="rounded-lg bg-flame/15 px-3 py-1.5 text-xs font-semibold text-flame transition-colors hover:bg-flame/25 disabled:opacity-60"
                  >
                    Confirmar exclusão
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-ink-muted hover:text-ink">
                    Cancelar
                  </button>
                </div>
              )}

              {expandido && (
                <>
                  <LeadRespostas lead={lead} />
                  <OrigemCampanha utm={lead.utm} className="mt-4 border-t border-line/60 pt-4" />
                </>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && leads.length > 0 && (
          <p className="text-sm text-ink-dim">Nenhum lead encontrado com esse nome.</p>
        )}
        {leads.length === 0 && <p className="text-sm text-ink-dim">Nenhum lead recebido ainda.</p>}
      </div>
      )}

      {convertendoLead && (
        <ConverterClienteModal lead={convertendoLead} onClose={() => setConvertendoLead(null)} onConfirmar={onConvert} />
      )}
    </div>
  );
}

// Arrastar (HTML5) só funciona com mouse — no celular e no teclado, o status
// muda pelo seletor que aparece ao abrir o card.
function LeadsPipeline({
  leads,
  todos,
  semLeads,
  onMudarStatus,
  onUpdateTemperatura,
  confirmDeleteId,
  onPedirExclusao,
  onConfirmarExclusao,
  excluindo,
}) {
  const [arrastandoId, setArrastandoId] = useState(null);
  const [colunaAlvo, setColunaAlvo] = useState(null);
  const [abertoId, setAbertoId] = useState(null);
  const [ordem, setOrdem] = useState("recentes");

  function soltar(e, status) {
    e.preventDefault();
    setColunaAlvo(null);
    const lead = leads.find((l) => l.id === e.dataTransfer.getData("text/plain"));
    if (lead) onMudarStatus(lead, status);
  }

  return (
    <>
      <ResumoPipeline leads={todos} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-dim">
          {semLeads ? (
            "Nenhum lead recebido ainda."
          ) : leads.length === 0 ? (
            "Nenhum lead encontrado com esse nome."
          ) : (
            <>
              <span className="hidden md:inline">Arraste o card para mudar o status.</span>
              <span className="md:hidden">Deslize pro lado pra ver as etapas.</span>
            </>
          )}
        </p>
        <label className="flex items-center gap-2 text-xs text-ink-dim">
          Ordenar
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink focus:outline-none"
          >
            {Object.entries(ORDENACOES).map(([valor, { rotulo }]) => (
              <option key={valor} value={valor} className="bg-surface text-ink">
                {rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="-mx-5 snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 pb-3 md:mx-0 md:snap-none md:px-0">
        <div className="flex items-start gap-3">
          {STATUSES.map((coluna) => {
            const daColuna = leads.filter((l) => l.status === coluna.valor).sort(ORDENACOES[ordem].comparar);
            const ehConversao = coluna.valor === "convertido";
            const ehAlvo = colunaAlvo === coluna.valor;

            return (
              <section
                key={coluna.valor}
                aria-label={coluna.rotulo}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (colunaAlvo !== coluna.valor) setColunaAlvo(coluna.valor);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setColunaAlvo(null);
                }}
                onDrop={(e) => soltar(e, coluna.valor)}
                className={`w-[72vw] max-w-[300px] shrink-0 snap-start rounded-xl border p-2.5 transition-colors md:w-[252px] md:max-w-none ${
                  ehAlvo ? "border-emerald-brand/60 bg-emerald-brand/5" : "border-line/60 bg-surface/40"
                }`}
              >
                <header className="mb-2.5 flex items-center justify-between px-1 pt-0.5">
                  <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    <span className={`h-3 w-[3px] rounded-full ${COR_COLUNA[coluna.valor] || "bg-ink-dim/60"}`} />
                    {coluna.rotulo}
                  </h2>
                  {!ehConversao && <span className="text-[11px] tabular-nums text-ink-dim">{daColuna.length}</span>}
                </header>

                {ehConversao ? (
                  <div
                    className={`rounded-lg border border-dashed px-3 py-5 text-center text-xs leading-relaxed transition-colors ${
                      ehAlvo ? "border-emerald-brand/60 text-emerald-bright" : "border-line text-ink-dim"
                    }`}
                  >
                    Solte aqui pra fechar e converter em cliente
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {daColuna.map((lead) => (
                      <CardPipeline
                        key={lead.id}
                        lead={lead}
                        aberto={abertoId === lead.id}
                        onAlternar={() => setAbertoId(abertoId === lead.id ? null : lead.id)}
                        arrastando={arrastandoId === lead.id}
                        onComecarArrastar={() => setArrastandoId(lead.id)}
                        onTerminarArrastar={() => {
                          setArrastandoId(null);
                          setColunaAlvo(null);
                        }}
                        onMudarStatus={onMudarStatus}
                        onUpdateTemperatura={onUpdateTemperatura}
                        confirmandoExclusao={confirmDeleteId === lead.id}
                        onPedirExclusao={onPedirExclusao}
                        onConfirmarExclusao={onConfirmarExclusao}
                        excluindo={excluindo}
                      />
                    ))}
                    {daColuna.length === 0 && <p className="px-1 pb-1 text-xs text-ink-dim">vazio</p>}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ResumoPipeline({ leads }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const naBase = leads.length;
  const recebidosHoje = leads.filter((l) => l.criadoEm === hoje).length;
  const semContato = leads.filter((l) => l.status === "novo").length;
  const emAberto = leads.filter((l) => l.status !== "convertido" && l.status !== "descartado");
  const quentes = emAberto.filter((l) => l.temperatura === "quente").length;
  const agendados = leads.filter((l) => l.status === "reuniao_agendada").length;
  const pctAgendados = naBase ? Math.round((agendados / naBase) * 100) : 0;

  const indicadores = [
    { rotulo: "Leads na base", valor: naBase, detalhe: `${recebidosHoje} hoje` },
    { rotulo: "Sem contato", valor: semContato, detalhe: "aguardando retorno" },
    { rotulo: "Quentes", valor: quentes, detalhe: "temperatura quente" },
    { rotulo: "Reuniões agendadas", valor: agendados, detalhe: `${pctAgendados}% da base` },
  ];

  return (
    <dl className="mb-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface md:mb-6 md:grid-cols-4">
      {indicadores.map(({ rotulo, valor, detalhe }, i) => (
        <div
          key={rotulo}
          className={`px-4 py-3 md:px-5 md:py-4 ${i % 2 === 1 ? "border-l border-line/60" : ""} ${i >= 2 ? "border-t border-line/60 md:border-t-0" : ""} ${
            i === 2 ? "md:border-l" : ""
          }`}
        >
          <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-dim md:text-[11px]">{rotulo}</dt>
          <dd className="mt-1.5 font-display text-2xl leading-none tabular-nums text-ink md:mt-2 md:text-3xl">{valor}</dd>
          <dd className="mt-1 text-[11px] text-ink-dim md:mt-1.5 md:text-xs">{detalhe}</dd>
        </div>
      ))}
    </dl>
  );
}

function CardPipeline({
  lead,
  aberto,
  onAlternar,
  arrastando,
  onComecarArrastar,
  onTerminarArrastar,
  onMudarStatus,
  onUpdateTemperatura,
  confirmandoExclusao,
  onPedirExclusao,
  onConfirmarExclusao,
  excluindo,
}) {
  const waLink = buildWhatsAppLink(lead.telefone, leadFirstContactMessage(lead));
  const recente = Math.floor((new Date() - new Date(lead.criadoEm)) / (1000 * 60 * 60 * 24)) <= 1;
  const local = lead.cidade ? `${lead.cidade}${lead.estado ? `/${lead.estado}` : ""}` : "";

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
        onComecarArrastar();
      }}
      onDragEnd={onTerminarArrastar}
      className={`cursor-grab rounded-lg border bg-surface transition-[opacity,border-color] active:cursor-grabbing ${
        aberto ? "border-emerald-brand/40" : "border-line/80 hover:border-line"
      } ${arrastando ? "opacity-40" : lead.status === "descartado" ? "opacity-60" : ""}`}
    >
      <button type="button" onClick={onAlternar} aria-expanded={aberto} className="block w-full p-3 text-left">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-snug text-ink">{lead.nome}</span>
          {recente && lead.status === "novo" && (
            <span className="shrink-0 rounded-full bg-emerald-brand/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-emerald-bright">
              NOVO
            </span>
          )}
        </span>
        {(lead.nomeNegocio || local) && (
          <span className="mt-0.5 block truncate text-xs text-ink-dim">{[lead.nomeNegocio, local].filter(Boolean).join(" · ")}</span>
        )}

        <span className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5 text-[11px]">
          {lead.temperatura ? (
            <span className="flex items-center gap-1.5 capitalize text-ink-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${COR_TEMPERATURA[lead.temperatura]}`} />
              {lead.temperatura}
            </span>
          ) : (
            <span className="text-ink-dim">sem temperatura</span>
          )}
          <span className="truncate text-ink-dim">{lead.faturamentoMensal || relativeDaysLabel(lead.criadoEm)}</span>
        </span>
      </button>

      {aberto && (
        <div className="space-y-3 border-t border-line/60 px-3 pb-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg border border-emerald-brand/40 px-2.5 py-1 text-[11px] font-medium text-emerald-bright transition-colors hover:bg-emerald-brand/10"
            >
              <MessageCircle size={12} />
              Chamar no WhatsApp
            </a>
            <span className="text-[11px] text-ink-dim">{relativeDaysLabel(lead.criadoEm)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] text-ink-dim">Status</span>
              <select
                value={lead.status}
                onChange={(e) => onMudarStatus(lead, e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-raised px-2 py-1.5 text-xs text-ink focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s.valor} value={s.valor} className="bg-surface text-ink">
                    {s.rotulo}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-ink-dim">Temperatura</span>
              <select
                value={lead.temperatura || ""}
                onChange={(e) => onUpdateTemperatura(lead, e.target.value || null)}
                className="w-full rounded-lg border border-line bg-surface-raised px-2 py-1.5 text-xs text-ink focus:outline-none"
              >
                <option value="" className="bg-surface text-ink">
                  sem temperatura
                </option>
                {TEMPERATURAS.map((t) => (
                  <option key={t} value={t} className="bg-surface text-ink">
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <LeadRespostas lead={lead} compacto />
          <OrigemCampanha utm={lead.utm} compacto className="border-t border-line/60 pt-3" />

          <div className="border-t border-line/60 pt-3">
            {confirmandoExclusao ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onConfirmarExclusao(lead)}
                  disabled={excluindo}
                  className="rounded-lg bg-flame/15 px-2.5 py-1 text-[11px] font-semibold text-flame transition-colors hover:bg-flame/25 disabled:opacity-60"
                >
                  Confirmar exclusão
                </button>
                <button onClick={() => onPedirExclusao(null)} className="text-[11px] text-ink-muted hover:text-ink">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => onPedirExclusao(lead.id)}
                className="flex items-center gap-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-flame"
              >
                <Trash2 size={12} />
                Excluir lead
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
