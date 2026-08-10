import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Cardápio",
    price: "R$ 497",
    period: "/mês",
    description: "Para quem quer começar a organizar a casa.",
    features: ["Diagnóstico inicial", "Otimização de cardápio", "Relatório mensal"],
    highlight: false,
  },
  {
    name: "Escala",
    price: "R$ 997",
    period: "/mês",
    description: "O mais escolhido por quem quer crescer com previsibilidade.",
    features: [
      "Tudo do plano Cardápio",
      "Monitoramento de redes sociais",
      "Gestão financeira completa",
      "Mentoria quinzenal ao vivo",
    ],
    highlight: true,
  },
  {
    name: "Rede",
    price: "Sob consulta",
    period: "",
    description: "Para grupos com mais de uma unidade.",
    features: ["Tudo do plano Escala", "Gestão multi-unidade", "Gerente de conta dedicado"],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-wide text-ink md:text-4xl">
            Planos de mentoria
          </h2>
          <p className="mt-4 text-ink-muted">Escolha o ritmo de acompanhamento que faz sentido para o seu momento.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-emerald-brand bg-surface-raised shadow-xl shadow-emerald-brand/10"
                  : "border-line bg-surface"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-emerald-brand px-3 py-1 text-xs font-semibold text-base">
                  Mais escolhido
                </span>
              )}

              <h3 className="font-display text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-ink">{plan.price}</span>
                <span className="text-sm text-ink-dim">{plan.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-bright" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-emerald-brand text-base hover:bg-emerald-bright"
                    : "border border-line text-ink hover:border-emerald-brand/60 hover:text-emerald-bright"
                }`}
              >
                Falar com um mentor
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
