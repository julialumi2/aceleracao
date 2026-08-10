import { UserPlus } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { updateLeadStatus } from "../lib/adminApi.js";

const STATUSES = ["novo", "contatado", "convertido", "descartado"];

export default function LeadsList({ leads, setLeads, onConvert }) {
  async function setStatus(lead, status) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    await updateLeadStatus(lead.id, status).catch(() => null);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Leads</h1>
        <p className="mt-1 text-sm text-ink-muted">Respostas recebidas pelo Google Forms, sincronizadas na tabela <code className="font-mono text-xs">leads</code>.</p>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{lead.nome}</p>
              <p className="text-xs text-ink-dim">{lead.email} · {lead.criadoEm}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={lead.status} />
              <select
                value={lead.status}
                onChange={(e) => setStatus(lead, e.target.value)}
                className="rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-ink focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-surface text-ink">
                    {s}
                  </option>
                ))}
              </select>

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
        ))}

        {leads.length === 0 && <p className="text-sm text-ink-dim">Nenhum lead recebido ainda.</p>}
      </div>
    </div>
  );
}
