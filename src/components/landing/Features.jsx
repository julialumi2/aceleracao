import { UtensilsCrossed, LineChart, Wallet } from "lucide-react";

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "Otimização de Cardápio",
    description:
      "Engenharia de cardápio baseada em margem e giro: identificamos pratos-estrela, ajustamos precificação e reposicionamos itens para aumentar o ticket médio.",
  },
  {
    icon: LineChart,
    title: "Monitoramento de Redes Sociais",
    description:
      "Acompanhamento de presença digital e reputação — alcance, engajamento e avaliações — com relatórios claros sobre o que está funcionando.",
  },
  {
    icon: Wallet,
    title: "Gestão Financeira",
    description:
      "Organização de fluxo de caixa, CMV e ponto de equilíbrio, com contratos e cobranças integrados para você acompanhar tudo em um só lugar.",
  },
];

export default function Features() {
  return (
    <section id="recursos" className="border-t border-line/60 bg-surface/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Três frentes, um único acompanhamento
          </h2>
          <p className="mt-4 text-ink-muted">
            Cada mentoria combina essas três frentes de forma integrada — sem planilhas soltas
            ou ferramentas desconectadas.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-emerald-brand/50"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-brand/10 text-emerald-bright transition-colors group-hover:bg-emerald-brand/20">
                <Icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
