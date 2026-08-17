import { Megaphone, UtensilsCrossed, Filter, LineChart, MessageCircle, Camera } from "lucide-react";

const FEATURES = [
  {
    icon: Megaphone,
    title: "Gestão de Tráfego",
    description:
      "Criamos e otimizamos os anúncios que trazem pedido pra sua casa — sem achismo, com dados reais de cada campanha.",
  },
  {
    icon: UtensilsCrossed,
    title: "Cardápio de Delivery",
    description:
      "Implementação de um cardápio pensado pra delivery: precificação, fotos e posicionamento dos pratos que mais vendem.",
  },
  {
    icon: Filter,
    title: "Funis Validados para Escala",
    description:
      "Estratégias já testadas nos nossos próprios negócios, prontas pra replicar no seu, sem reinventar a roda.",
  },
  {
    icon: LineChart,
    title: "Métricas e Otimizações Semanais",
    description:
      "Acompanhamento constante dos números, com ajustes semana a semana pra manter o resultado subindo.",
  },
  {
    icon: MessageCircle,
    title: "Grupo no WhatsApp",
    description:
      "Canal direto com o time de mentoria, pra tirar dúvidas e ajustar o que for preciso, sem burocracia.",
  },
  {
    icon: Camera,
    title: "Direcionamento de conteúdo",
    description:
      "Direcionamentos do que postar nas redes, pra manter a presença ativa entre uma campanha e outra.",
  },
];

export default function Features() {
  return (
    <section id="recursos" className="border-t border-line/60 bg-surface/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl tracking-wide text-ink md:text-4xl">
            Uma parceria completa, da estratégia ao pedido
          </h2>
          <p className="mt-4 text-ink-muted">
            Tudo que entra na Aceleração de Delivery — integrado, sem planilhas soltas ou ferramentas desconectadas.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-emerald-brand/50"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-brand/10 text-emerald-bright transition-colors group-hover:bg-emerald-brand/20">
                <Icon size={20} strokeWidth={2} />
              </span>
              <h3 className="mt-5 font-display text-lg tracking-wide text-ink">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
