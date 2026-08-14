import { useState } from "react";
import { MessageCircle, ChevronRight, CheckCircle2, Clock, BellRing, Filter } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { billingAlertMessage } from "../lib/messageTemplates.js";
import { sortByVencimento, alertStage, ALERT_STAGE_LABELS } from "../lib/invoices.js";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function mesKey(iso) {
  return iso.slice(0, 7); // "AAAA-MM"
}

function mesLabel(key) {
  const [y, m] = key.split("-");
  return `${MESES[Number(m) - 1]} de ${y}`;
}

// Achata todos os boletos de todos os clientes numa lista só, cada um
// carregando os dados do cliente pra exibir/alertar.
function allInvoices(clients) {
  return sortByVencimento(clients.flatMap((c) => (c.boletos || []).map((b) => ({ ...b, cliente: c }))));
}

export default function Billing({ clients, onSetInvoiceStatus, onMarkInvoiceAlertSent, onOpenClient }) {
  const [mesFiltro, setMesFiltro] = useState("todos");

  const todasInvoices = allInvoices(clients);
  const meses = [...new Set(todasInvoices.map((b) => mesKey(b.vencimento)))].sort().reverse();
  const invoices = mesFiltro === "todos" ? todasInvoices : todasInvoices.filter((b) => mesKey(b.vencimento) === mesFiltro);

  const atrasados = invoices.filter((b) => b.status === "atrasado");
  const pendentes = invoices.filter((b) => b.status === "pendente");
  const pagos = [...invoices.filter((b) => b.status === "pago")].reverse();

  const lembretesHoje = invoices
    .map((b) => ({ ...b, stage: alertStage(b) }))
    .filter((b) => b.stage !== null);

  const alertasPendentes = atrasados.filter((b) => !b.alertaEnviadoEm).length;
  const alertasDisparados = atrasados.filter((b) => b.alertaEnviadoEm).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Cobranças</h1>
          <p className="mt-1 text-sm text-ink-muted">Visão consolidada dos boletos (Asaas) de todos os clientes.</p>
        </div>

        {meses.length > 0 && (
          <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm">
            <Filter size={14} className="text-ink-dim" />
            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="bg-transparent text-ink focus:outline-none"
            >
              <option value="todos" className="bg-surface text-ink">Todos os meses</option>
              {meses.map((m) => (
                <option key={m} value={m} className="bg-surface text-ink">
                  {mesLabel(m)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {lembretesHoje.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <BellRing size={14} className="text-emerald-bright" />
            Lembretes de hoje ({lembretesHoje.length})
          </h2>
          <p className="mb-3 text-xs text-ink-dim">2 dias antes do vencimento, no dia, e 2 dias depois — os 3 pontos de contato pra não deixar passar.</p>
          <div className="overflow-hidden rounded-2xl border border-emerald-brand/30 bg-emerald-brand/5">
            {lembretesHoje.map((b) => {
              const waLink = buildWhatsAppLink(b.cliente.telefone, billingAlertMessage(b.cliente, b, b.stage));
              return (
                <div key={b.id} className="flex items-center justify-between gap-4 border-b border-emerald-brand/20 px-5 py-4 last:border-b-0">
                  <button onClick={() => onOpenClient(b.cliente.id)} className="flex flex-1 items-center justify-between text-left">
                    <div>
                      <p className="text-sm font-medium text-ink">{b.cliente.empresa || b.cliente.nome}</p>
                      <p className="text-xs text-ink-dim">
                        {ALERT_STAGE_LABELS[b.stage]} ({formatDate(b.vencimento)}) · R$ {b.valor.toFixed(2)}
                      </p>
                    </div>
                  </button>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onMarkInvoiceAlertSent(b.cliente, b.id)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-brand px-3 py-2 text-xs font-medium text-base transition-colors hover:bg-emerald-bright"
                  >
                    <MessageCircle size={13} />
                    Alertar
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      <Section
        title={`Atrasados (${atrasados.length})`}
        invoices={atrasados}
        onOpenClient={onOpenClient}
        onSetInvoiceStatus={onSetInvoiceStatus}
        onMarkInvoiceAlertSent={onMarkInvoiceAlertSent}
        showAlert
      />
      <Section title={`A pagar (${pendentes.length})`} invoices={pendentes} onOpenClient={onOpenClient} onSetInvoiceStatus={onSetInvoiceStatus} />
      <Section title={`Em dia (${pagos.length})`} invoices={pagos} onOpenClient={onOpenClient} onSetInvoiceStatus={onSetInvoiceStatus} />
    </div>
  );
}

function Section({ title, invoices, onOpenClient, onMarkInvoiceAlertSent, showAlert = false }) {
  if (invoices.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {invoices.map((b) => {
          const waLink = buildWhatsAppLink(b.cliente.telefone, billingAlertMessage(b.cliente, b, alertStage(b)));
          return (
            <div key={b.id} className="flex items-center justify-between gap-4 border-b border-line/40 px-5 py-4 last:border-b-0">
              <button onClick={() => onOpenClient(b.cliente.id)} className="flex flex-1 items-center justify-between text-left">
                <div>
                  <p className="text-sm font-medium text-ink">{b.cliente.empresa || b.cliente.nome}</p>
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
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onMarkInvoiceAlertSent(b.cliente, b.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    b.alertaEnviadoEm
                      ? "border border-line text-ink-muted hover:text-ink"
                      : "bg-emerald-brand text-base hover:bg-emerald-bright"
                  }`}
                >
                  <MessageCircle size={13} />
                  {b.alertaEnviadoEm ? "Reenviar" : "Alertar"}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
