import { MessageCircle, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { billingAlertMessage } from "../lib/messageTemplates.js";
import { sortByVencimento } from "../lib/invoices.js";

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Achata todos os boletos de todos os clientes numa lista só, cada um
// carregando os dados do cliente pra exibir/alertar.
function allInvoices(clients) {
  return sortByVencimento(clients.flatMap((c) => (c.boletos || []).map((b) => ({ ...b, cliente: c }))));
}

export default function Billing({ clients, onUpdate, onOpenClient }) {
  const invoices = allInvoices(clients);
  const atrasados = invoices.filter((b) => b.status === "atrasado");
  const pendentes = invoices.filter((b) => b.status === "pendente");
  const pagos = [...invoices.filter((b) => b.status === "pago")].reverse();

  const alertasPendentes = atrasados.filter((b) => !b.alertaEnviadoEm).length;
  const alertasDisparados = atrasados.filter((b) => b.alertaEnviadoEm).length;

  function marcarAlertaEnviado(boleto) {
    const cliente = boleto.cliente;
    const hoje = new Date().toISOString().slice(0, 10);
    const boletos = cliente.boletos.map((b) => (b.id === boleto.id ? { ...b, alertaEnviadoEm: hoje } : b));
    onUpdate(cliente.id, { boletos });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Cobranças</h1>
        <p className="mt-1 text-sm text-ink-muted">Visão consolidada dos boletos (Asaas) de todos os clientes.</p>
      </div>

      {atrasados.length > 0 && (
        <div className="mb-8 flex gap-4 rounded-2xl border border-flame/30 bg-flame/5 p-4 text-sm">
          <span className="flex items-center gap-1.5 text-flame">
            <Clock size={14} /> {alertasPendentes} alerta(s) pendente(s)
          </span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            <CheckCircle2 size={14} /> {alertasDisparados} já disparado(s)
          </span>
        </div>
      )}

      <Section title={`Atrasados (${atrasados.length})`} invoices={atrasados} onOpenClient={onOpenClient} onAlert={marcarAlertaEnviado} showAlert />
      <Section title={`Pendentes (${pendentes.length})`} invoices={pendentes} onOpenClient={onOpenClient} />
      <Section title={`Em dia (${pagos.length})`} invoices={pagos} onOpenClient={onOpenClient} />
    </div>
  );
}

function Section({ title, invoices, onOpenClient, onAlert, showAlert = false }) {
  if (invoices.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {invoices.map((b) => {
          const waLink = buildWhatsAppLink(b.cliente.telefone, billingAlertMessage(b.cliente, b));
          return (
            <div key={b.id} className="flex items-center justify-between gap-4 border-b border-line/40 px-5 py-4 last:border-b-0">
              <button onClick={() => onOpenClient(b.cliente.id)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <p className="text-sm font-medium text-ink">{b.cliente.nome}</p>
                  <p className="text-xs text-ink-dim">
                    Vencimento: {formatDate(b.vencimento)}
                    {b.alertaEnviadoEm && ` · Alerta enviado em ${formatDate(b.alertaEnviadoEm)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink">R$ {b.valor.toFixed(2)}</span>
                  <StatusBadge status={b.status} />
                  <ChevronRight size={15} className="text-ink-dim" />
                </div>
              </button>

              {showAlert && (
                <button
                  onClick={() => {
                    window.open(waLink, "_blank", "noreferrer");
                    onAlert(b);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    b.alertaEnviadoEm
                      ? "border border-line text-ink-muted hover:text-ink"
                      : "bg-emerald-brand text-base hover:bg-emerald-bright"
                  }`}
                >
                  <MessageCircle size={13} />
                  {b.alertaEnviadoEm ? "Reenviar" : "Alertar"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
