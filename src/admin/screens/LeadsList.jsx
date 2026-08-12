import { useState } from "react";
import { UserPlus, MessageCircle, Search, Plus } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
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

export default function LeadsList({ leads, onUpdateStatus, onUpdateTemperatura, onCreateLead, onConvert }) {
  const [query, setQuery] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ nome: "", telefone: "", email: "", origem: "indicacao_equipe", temperatura: "morno" });
  const [salvando, setSalvando] = useState(false);

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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Leads</h1>
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
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Telefone (WhatsApp)</span>
              <input
                value={novo.telefone}
                onChange={(e) => setNovo((n) => ({ ...n, telefone: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">E-mail (opcional)</span>
              <input
                value={novo.email}
                onChange={(e) => setNovo((n) => ({ ...n, email: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Origem</span>
              <select
                value={novo.origem}
                onChange={(e) => setNovo((n) => ({ ...n, origem: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
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
          return (
            <div key={lead.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
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
                  {lead.email || lead.telefone || "sem contato"} · {relativeDaysLabel(lead.criadoEm)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={lead.status} />
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

                {lead.temperatura && <StatusBadge status={`temp_${lead.temperatura}`} />}
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
