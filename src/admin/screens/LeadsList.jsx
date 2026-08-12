import { useState } from "react";
import { UserPlus, MessageCircle, Search } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { leadFirstContactMessage } from "../lib/messageTemplates.js";

const STATUSES = ["novo", "contatado", "convertido", "descartado"];

function relativeDaysLabel(iso) {
  const dias = Math.floor((new Date() - new Date(iso)) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return "recebido hoje";
  if (dias === 1) return "recebido ontem";
  return `recebido há ${dias} dias`;
}

export default function LeadsList({ leads, onUpdateStatus, onConvert }) {
  const [query, setQuery] = useState("");

  const filtered = leads.filter((lead) => lead.nome.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Leads</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Respostas do formulário de captação, sincronizadas na tabela <code className="font-mono text-xs">leads</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 sm:w-64">
          <Search size={15} className="text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
          />
        </div>
      </div>

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
                  {lead.email} · {relativeDaysLabel(lead.criadoEm)}
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
