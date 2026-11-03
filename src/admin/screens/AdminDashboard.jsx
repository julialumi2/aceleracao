import { ReceiptText, TrendingDown, Activity, FileSignature, ChevronRight, PartyPopper } from "lucide-react";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Dica from "../components/Dica.jsx";
import { currentInvoice, alertStage, ALERT_STAGE_LABELS } from "../lib/invoices.js";

const SAUDE_ORDER = ["laranja", "amarelo", "verde"];

function isThisWeek(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return date >= sevenDaysAgo && date <= now;
}

// Junta tudo que precisa de uma decisão da equipe num só lugar, em vez de
// espalhado pelas telas de Clientes/Cobranças/Intensidade.
function buildAcoesPendentes(clients) {
  const acoes = [];

  for (const c of clients) {
    for (const boleto of c.boletos || []) {
      const stage = alertStage(boleto);
      if (stage && !boleto.alertaEnviadoEm) {
        acoes.push({
          id: `${c.id}-boleto-${boleto.id}`,
          cliente: c,
          tab: "cobranca",
          icon: ReceiptText,
          tone: stage === "depois" ? "text-flame" : "text-emerald-brand",
          texto: `Boleto: ${ALERT_STAGE_LABELS[stage].toLowerCase()} — R$ ${boleto.valor.toFixed(2)}, sem alerta enviado`,
          prioridade: 1,
        });
      }
    }
    if (c.canceladoEm) continue;
    if (c.contrato.status === "pendente") {
      acoes.push({
        id: `${c.id}-contrato`,
        cliente: c,
        tab: "contrato",
        icon: FileSignature,
        tone: "text-emerald-brand",
        texto: "Contrato pendente de assinatura",
        prioridade: 2,
      });
    }
    if (c.intensidade.status !== "ativo") {
      acoes.push({
        id: `${c.id}-intensidade`,
        cliente: c,
        tab: "intensidade",
        icon: TrendingDown,
        tone: "text-emerald-brand",
        texto: c.intensidade.status === "inativo" ? "Intensidade inativa" : "Intensidade em queda",
        prioridade: 4,
      });
    }
  }

  return acoes.sort((a, b) => a.prioridade - b.prioridade);
}

export default function AdminDashboard({ clients, leads, onNavigate, onOpenClient }) {
  const clientesAtivos = clients.filter((c) => !c.canceladoEm);
  const contratosPendentes = clientesAtivos.filter((c) => c.contrato.status === "pendente").length;
  const boletosAtrasados = clients.filter((c) => currentInvoice(c.boletos)?.status === "atrasado").length;
  const baixaIntensidade = clientesAtivos.filter((c) => c.intensidade.status !== "ativo").length;
  const leadsNovosSemana = leads.filter((l) => isThisWeek(l.criadoEm)).length;
  const acoesPendentes = buildAcoesPendentes(clients);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-wide text-ink">Visão geral</h1>
        <p className="mt-1 text-sm text-ink-muted">Resumo do que precisa de atenção hoje.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Clientes ativos" value={clientesAtivos.length} />
        <KpiCard label="Boletos atrasados" value={boletosAtrasados} tone={boletosAtrasados ? "danger" : "default"} />
        <KpiCard label="Contratos pendentes" value={contratosPendentes} tone={contratosPendentes ? "warning" : "default"} />
        <KpiCard label="Leads novos" value={leadsNovosSemana} nota="últimos 7 dias" />
        <KpiCard label="Baixa intensidade" value={baixaIntensidade} tone={baixaIntensidade ? "warning" : "default"} />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Activity size={15} className="text-emerald-bright" />
          Ações pendentes hoje ({acoesPendentes.length})
          <Dica>
            Contrato, cobrança e intensidade que precisam de uma decisão da equipe. Clicar num item abre direto a aba certa
            do cliente.
          </Dica>
        </h2>
        <p className="mt-1 text-xs text-ink-dim">Cada item leva pra aba certa do cliente.</p>

        <div className="mt-5 overflow-hidden rounded-xl border border-line/60">
          {acoesPendentes.map(({ id, cliente, tab, icon: Icon, tone, texto }) => (
            <button
              key={id}
              onClick={() => onOpenClient(cliente.id, tab)}
              className="flex w-full items-center justify-between gap-3 border-b border-line/40 bg-surface-raised px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-surface"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Icon size={16} className={`shrink-0 ${tone}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{cliente.empresa || cliente.nome}</p>
                  <p className="truncate text-xs text-ink-dim">{texto}</p>
                </div>
              </div>
              <ChevronRight size={15} className="shrink-0 text-ink-dim" />
            </button>
          ))}
          {acoesPendentes.length === 0 && (
            <p className="flex items-center justify-center gap-2 px-4 py-8 text-center text-sm text-ink-dim">
              <PartyPopper size={16} /> Tudo em dia — nenhuma ação pendente agora.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Activity size={15} className="text-emerald-bright" />
            Saúde das campanhas
            <Dica>
              <strong className="font-medium text-ink">Verde</strong>: rodando e dando resultado.{" "}
              <strong className="font-medium text-ink">Amarelo</strong>: rodando, ainda sem resultado.{" "}
              <strong className="font-medium text-ink">Laranja</strong>: tráfego ainda não iniciado.
            </Dica>
          </h2>
          <button onClick={() => onNavigate("clientes")} className="text-xs font-medium text-emerald-bright hover:underline">
            Ver todos
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SAUDE_ORDER.map((cor) => {
            const clientesDaCor = clientesAtivos.filter((c) => c.saude === cor);
            return (
              <div key={cor} className="rounded-xl border border-line/60 bg-surface-raised p-4 sm:p-5">
                <StatusBadge status={`saude_${cor}`} />
                <p className="mt-3 font-display text-xl tracking-wide text-ink">{clientesDaCor.length}</p>
                <ul className="mt-2 space-y-1">
                  {clientesDaCor.slice(0, 4).map((c) => (
                    <li key={c.id} className="truncate text-xs text-ink-muted">
                      {c.empresa || c.nome}
                    </li>
                  ))}
                  {clientesDaCor.length === 0 && <li className="text-xs text-ink-dim">Nenhum cliente</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
