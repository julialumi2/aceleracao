import { Users, FileWarning, ReceiptText, TrendingDown, Contact } from "lucide-react";
import KpiCard from "../components/KpiCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AdminDashboard({ clients, leads, onNavigate }) {
  const contratosPendentes = clients.filter((c) => c.contrato.status === "pendente").length;
  const boletosAtrasados = clients.filter((c) => c.boleto.status === "atrasado").length;
  const baixaIntensidade = clients.filter((c) => c.intensidade.status !== "ativo").length;
  const leadsNovos = leads.filter((l) => l.status === "novo").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Visão geral</h1>
        <p className="mt-1 text-sm text-ink-muted">Resumo do que precisa de atenção hoje.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Clientes ativos" value={clients.length} />
        <KpiCard icon={FileWarning} label="Contratos pendentes" value={contratosPendentes} tone={contratosPendentes ? "warning" : "default"} />
        <KpiCard icon={ReceiptText} label="Boletos atrasados" value={boletosAtrasados} tone={boletosAtrasados ? "danger" : "default"} />
        <KpiCard icon={Contact} label="Leads novos" value={leadsNovos} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <TrendingDown size={15} className="text-amber-300" />
              Clientes em queda de intensidade
            </h2>
            <button onClick={() => onNavigate("clientes")} className="text-xs font-medium text-emerald-bright hover:underline">
              Ver todos
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {clients
              .filter((c) => c.intensidade.status !== "ativo")
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{c.nome}</span>
                  <StatusBadge status={c.intensidade.status} />
                </li>
              ))}
            {baixaIntensidade === 0 && <p className="text-sm text-ink-dim">Nenhum cliente em queda no momento.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ReceiptText size={15} className="text-flame" />
              Boletos em atraso
            </h2>
            <button onClick={() => onNavigate("cobrancas")} className="text-xs font-medium text-emerald-bright hover:underline">
              Ver cobranças
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {clients
              .filter((c) => c.boleto.status === "atrasado")
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{c.nome}</span>
                  <span className="font-mono text-xs text-ink-dim">R$ {c.boleto.valor.toFixed(2)}</span>
                </li>
              ))}
            {boletosAtrasados === 0 && <p className="text-sm text-ink-dim">Nenhum boleto atrasado no momento.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
