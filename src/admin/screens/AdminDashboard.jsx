import { Users, FileWarning, ReceiptText, TrendingDown, Contact, Activity, FileSignature, ChevronRight, PartyPopper } from "lucide-react";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
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
          tone: stage === "depois" ? "text-flame" : "text-amber-300",
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
        tone: "text-amber-300",
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
        tone: "text-amber-300",
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <KpiCard icon={Users} label="Clientes ativos" value={clientesAtivos.length} />
        <KpiCard icon={ReceiptText} label="Boletos atrasados" value={boletosAtrasados} tone={boletosAtrasados ? "danger" : "default"} />
        <KpiCard icon={FileWarning} label="Contratos pendentes" value={contratosPendentes} tone={contratosPendentes ? "warning" : "default"} />
        <KpiCard icon={Contact} label="Leads novos (7 dias)" value={leadsNovosSemana} />
        <KpiCard icon={TrendingDown} label="Baixa intensidade" value={baixaIntensidade} tone={baixaIntensidade ? "warning" : "default"} />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Activity size={15} className="text-emerald-bright" />
          Ações pendentes hoje ({acoesPendentes.length})
        </h2>
        <p className="mt-1 text-xs text-ink-dim">Contrato, cobrança e intensidade que precisam de uma decisão — cada item já leva pra aba certa do cliente.</p>

        <div className="mt-4 overflow-hidden rounded-xl border border-line/60">
          {acoesPendentes.map(({ id, cliente, tab, icon: Icon, tone, texto }) => (
            <button
              key={id}
              onClick={() => onOpenClient(cliente.id, tab)}
              className="flex w-full items-center justify-between gap-3 border-b border-line/40 bg-surface-raised px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface"
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

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Activity size={15} className="text-emerald-bright" />
            Saúde das campanhas
          </h2>
          <button onClick={() => onNavigate("clientes")} className="text-xs font-medium text-emerald-bright hover:underline">
            Ver todos
          </button>
        </div>
        <p className="mt-1 text-xs text-ink-dim">
          Verde = rodando e dando resultado · Amarelo = rodando, ainda sem resultado · Laranja = tráfego ainda não iniciado
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SAUDE_ORDER.map((cor) => {
            const clientesDaCor = clientesAtivos.filter((c) => c.saude === cor);
            return (
              <div key={cor} className="rounded-xl border border-line/60 bg-surface-raised p-4">
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
