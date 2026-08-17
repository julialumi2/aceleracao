import StatusCard from "./StatusCard.jsx";
import { ArrowRight } from "lucide-react";

export default function DashboardHome({ session, onNavigate, onlyStatus = false }) {
  return (
    <div className="mx-auto max-w-4xl">
      {!onlyStatus && (
        <div className="mb-8">
          <h1 className="font-display text-2xl tracking-wide text-ink">
            Olá, {session?.name || "por aí"} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Aqui está o status atual da sua mentoria e integrações.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatusCard
          type="contract"
          title="Contrato Clicksign"
          subtitle="Assinatura do contrato de mentoria"
          status="pending"
        />
        <StatusCard
          type="billing"
          title="Cobrança Asaas"
          subtitle="Assinatura mensal do plano Escala"
          status="active"
        />
      </div>

      {!onlyStatus && (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface/40 p-6">
          <p className="text-sm font-medium text-ink">Complete seu cadastro</p>
          <p className="mt-1 text-sm text-ink-muted">
            Finalize os dados do restaurante e do cardápio para liberarmos o diagnóstico inicial.
          </p>
          <button
            onClick={() => onNavigate?.("restaurante")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-bright hover:underline"
          >
            Ir para Dados do Restaurante <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
