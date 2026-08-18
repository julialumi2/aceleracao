import { useState } from "react";
import { UserPlus, MessageCircle, Search, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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

function LeadEditForm({ lead, onSave, onCancel }) {
  const [campos, setCampos] = useState({
    nome: lead.nome,
    telefone: lead.telefone,
    email: lead.email,
    nomeNegocio: lead.nomeNegocio,
  });
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!campos.nome.trim() || salvando) return;
    setSalvando(true);
    try {
      await onSave(campos);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line/60 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Nome</span>
          <input
            value={campos.nome}
            onChange={(e) => setCampos((c) => ({ ...c, nome: e.target.value }))}
            className={textInputClass()}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Nome do negócio</span>
          <input
            value={campos.nomeNegocio}
            onChange={(e) => setCampos((c) => ({ ...c, nomeNegocio: e.target.value }))}
            className={textInputClass()}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Telefone (WhatsApp)</span>
          <input
            value={campos.telefone}
            onChange={(e) => setCampos((c) => ({ ...c, telefone: e.target.value }))}
            className={textInputClass()}
          />
        </label>
        {/* O formulário público (/comecar) não pede e-mail — só aparece aqui
            se o lead já tiver um (ex: cadastrado manualmente pela equipe). */}
        {lead.email && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">E-mail</span>
            <input
              value={campos.email}
              onChange={(e) => setCampos((c) => ({ ...c, email: e.target.value }))}
              className={textInputClass()}
            />
          </label>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={!campos.nome.trim() || salvando}
          className="rounded-xl bg-emerald-brand px-4 py-2 text-xs font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
        >
          Salvar
        </button>
        <button onClick={onCancel} className="text-xs text-ink-muted hover:text-ink">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function LeadRespostas({ lead }) {
  const itens = [
    ["Nome do negócio", lead.nomeNegocio],
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

export default function LeadsList({ leads, onUpdateStatus, onUpdateTemperatura, onCreateLead, onUpdateLead, onDeleteLead, onConvert }) {
  const [query, setQuery] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ nome: "", telefone: "", email: "", origem: "indicacao_equipe", temperatura: "morno" });
  const [salvando, setSalvando] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

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

  async function salvarEdicao(lead, campos) {
    await onUpdateLead(lead, campos);
    setEditingId(null);
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
          const editando = editingId === lead.id;
          const expandido = expandedId === lead.id;
          const confirmandoExclusao = confirmDeleteId === lead.id;

          return (
            <div key={lead.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{lead.nome}</p>
                    {recente && lead.status === "novo" && (
                      <span className="rounded-full bg-emerald-brand/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-bright">
                        NOVO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-dim">
                    {lead.nomeNegocio ? `${lead.nomeNegocio} · ` : ""}
                    {lead.email || lead.telefone || "sem contato"} · {relativeDaysLabel(lead.criadoEm)}
                  </p>
                </div>

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
                      onClick={() => onConvert(lead)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-brand px-3 py-1.5 text-xs font-medium text-base transition-colors hover:bg-emerald-bright"
                    >
                      <UserPlus size={13} />
                      Converter em cliente
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-4 border-t border-line/40 pt-3">
                <button
                  onClick={() => setExpandedId(expandido ? null : lead.id)}
                  className="flex items-center gap-1 text-xs text-ink-dim transition-colors hover:text-ink"
                >
                  {expandido ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  Respostas
                </button>

                <button
                  onClick={() => {
                    setEditingId(editando ? null : lead.id);
                    setExpandedId(null);
                  }}
                  className="flex items-center gap-1 text-xs text-ink-dim transition-colors hover:text-ink"
                >
                  <Pencil size={12} />
                  Editar
                </button>

                <button
                  onClick={() => setConfirmDeleteId(lead.id)}
                  className="flex items-center gap-1 text-xs text-ink-dim transition-colors hover:text-flame"
                >
                  <Trash2 size={12} />
                  Excluir
                </button>
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

              {editando && (
                <LeadEditForm lead={lead} onSave={(campos) => salvarEdicao(lead, campos)} onCancel={() => setEditingId(null)} />
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
    </div>
  );
}
