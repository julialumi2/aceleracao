import { useState } from "react";
import { UserPlus, MessageCircle, Search, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { leadFirstContactMessage } from "../lib/messageTemplates.js";

const STATUSES = ["novo", "contatado", "convertido", "descartado"];
const TEMPERATURAS = ["frio", "morno", "quente"];
const ORIGENS = [
  { value: "indicacao_equipe", label: "Indicação da equipe" },
  { value: "trafego_pago", label: "Tráfego pago" },
  { value: "bio_instagram", label: "Bio do Instagram" },
  { value: "outro", label: "Outro" },
];

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

function LeadRespostas({ lead }) {
  const itens = [
    ["Nome do negócio", lead.nomeNegocio],
    ["Cidade", lead.cidade && lead.estado ? `${lead.cidade} - ${lead.estado}` : lead.cidade || lead.estado],
    ["Faturamento mensal", lead.faturamentoMensal],
    ["Maior gargalo", lead.maiorGargalo],
    ["Gestor de tráfego", lead.gestorTrafego],
    ["Mensagem", lead.mensagem],
  ].filter(([, valor]) => valor);

  if (itens.length === 0) {
    return <p className="mt-4 border-t border-line/60 pt-4 text-xs text-ink-dim">Sem respostas adicionais do formulário.</p>;
  }

  return (
    <dl className="mt-4 grid gap-3 border-t border-line/60 pt-4 sm:grid-cols-2">
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

  const filtered = leads.filter((lead) => lead.nome.toLowerCase().includes(query.toLowerCase()));

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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-ink">Leads</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Respostas do formulário de captação, sincronizadas na tabela <code className="font-mono text-xs">leads</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 sm:w-64">
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
                    onChange={(e) => onUpdateStatus(lead, e.target.value)}
                    className="rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-surface text-ink">
                        {s}
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

              {expandido && <LeadRespostas lead={lead} />}
            </div>
          );
        })}

        {filtered.length === 0 && leads.length > 0 && (
          <p className="text-sm text-ink-dim">Nenhum lead encontrado com esse nome.</p>
        )}
        {leads.length === 0 && <p className="text-sm text-ink-dim">Nenhum lead recebido ainda.</p>}
      </div>

      {convertendoLead && (
        <ConverterClienteModal lead={convertendoLead} onClose={() => setConvertendoLead(null)} onConfirmar={onConvert} />
      )}
    </div>
  );
}
