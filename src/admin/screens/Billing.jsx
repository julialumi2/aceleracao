import { MessageCircle, ChevronRight } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { billingAlertMessage } from "../lib/messageTemplates.js";

export default function Billing({ clients, onOpenClient }) {
  const atrasados = clients.filter((c) => c.boleto.status === "atrasado");
  const pendentes = clients.filter((c) => c.boleto.status === "pendente");
  const pagos = clients.filter((c) => c.boleto.status === "pago");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Cobranças</h1>
        <p className="mt-1 text-sm text-ink-muted">Visão consolidada dos boletos (Asaas) de todos os clientes.</p>
      </div>

      <Section title={`Atrasados (${atrasados.length})`} tone="danger" clients={atrasados} onOpenClient={onOpenClient} showAlert />
      <Section title={`Pendentes (${pendentes.length})`} tone="warning" clients={pendentes} onOpenClient={onOpenClient} />
      <Section title={`Em dia (${pagos.length})`} tone="default" clients={pagos} onOpenClient={onOpenClient} />
    </div>
  );
}

function Section({ title, clients, onOpenClient, showAlert = false }) {
  if (clients.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {clients.map((c) => {
          const waLink = buildWhatsAppLink(c.telefone, billingAlertMessage(c, c.boleto));
          return (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 border-b border-line/40 px-5 py-4 last:border-b-0"
            >
              <button onClick={() => onOpenClient(c.id)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <p className="text-sm font-medium text-ink">{c.nome}</p>
                  <p className="text-xs text-ink-dim">Vencimento: {c.boleto.vencimento || "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink">R$ {c.boleto.valor.toFixed(2)}</span>
                  <StatusBadge status={c.boleto.status} />
                  <ChevronRight size={15} className="text-ink-dim" />
                </div>
              </button>

              {showAlert && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-brand px-3 py-2 text-xs font-medium text-base transition-colors hover:bg-emerald-bright"
                >
                  <MessageCircle size={13} />
                  Alertar
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
