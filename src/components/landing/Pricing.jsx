import { Check, ArrowUpRight, ShieldCheck } from "lucide-react";

const DELIVERABLES = [
  "Gestão de tráfego",
  "Implementação do cardápio de delivery",
  "Funis validados para escala",
  "Métricas e otimizações mensais",
  "Grupo no WhatsApp",
  "Direcionamentos de conteúdos orgânicos",
];

const EXTRAS = [
  { label: "Cardápio", value: "R$ 200 / mês" },
  { label: "Investimento em tráfego", value: "a partir de R$ 1.400 / mês" },
];

export default function Pricing() {
  return (
    <section id="planos" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl tracking-wide text-ink md:text-4xl">
            Planos de mentoria
          </h2>
          <p className="mt-4 text-ink-muted">Uma parceria completa, da estratégia ao pedido.</p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-emerald-brand bg-surface-raised shadow-xl shadow-emerald-brand/10 md:grid md:grid-cols-2">
          <div className="p-8 md:p-10">
            <h3 className="font-display text-lg tracking-wide text-ink">Aceleração de Delivery</h3>
            <p className="mt-1 text-sm text-ink-muted">Acompanhamento próximo, não curso gravado.</p>

            <ul className="mt-6 space-y-3">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-bright" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="/comecar"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-brand px-6 py-3 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
            >
              Quero Escalar meu Restaurante
              <ArrowUpRight size={16} />
            </a>

            <p className="mt-4 flex items-start gap-1.5 text-xs text-ink-dim">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-bright" />
              Sem multa de cancelamento — só aviso com 30 dias de antecedência.
            </p>
          </div>

          <div className="border-t border-line/60 bg-surface p-8 md:border-l md:border-t-0 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-dim">Custos variáveis à parte</p>
            <p className="mt-2 text-sm text-ink-muted">
              Repassados direto aos fornecedores — cardápio e tráfego pago não fazem parte da mensalidade da mentoria.
            </p>
            <ul className="mt-6 space-y-4">
              {EXTRAS.map((extra) => (
                <li key={extra.label} className="flex items-center justify-between border-b border-line/60 pb-3 text-sm">
                  <span className="text-ink-muted">{extra.label}</span>
                  <span className="font-mono text-ink">{extra.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
