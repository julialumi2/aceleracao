import { ArrowUpRight } from "lucide-react";
import Sparks from "../shared/Sparks.jsx";
import heroDashboard from "../../assets/landing/hero-dashboard.webp";

export default function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <Sparks className="h-[560px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-24">
        <div className="text-center lg:text-left">
          <div className="font-display text-2xl uppercase leading-[0.92] tracking-wide text-ink md:text-3xl">
            <span className="block">Aceleração</span>
            <span className="block text-emerald-bright">de Delivery</span>
          </div>

          <h1 className="mt-5 text-balance font-display text-3xl leading-[1.1] tracking-wide text-ink md:text-5xl lg:max-w-[19ch]">
            Mais pedidos e mais lucro no seu delivery em 30 dias, sem viver de promoção pra vender.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-muted md:text-lg lg:mx-0">
            A gente entra na sua operação, corrige o que está comendo a sua margem e escala suas vendas com previsibilidade.
          </p>

          <div className="mt-9 flex justify-center lg:justify-start">
            <a
              href="/comecar"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-6 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
            >
              Quero acelerar meu delivery
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <figure className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-black/40">
          <img
            src={heroDashboard}
            width={1163}
            height={468}
            alt="Painel de um cliente da aceleração: R$ 138.461,45 de faturamento, 2.189 pedidos e ticket médio de R$ 63,25, com o faturamento mensal subindo de março a julho de 2026."
            className="w-full"
          />
          <figcaption className="border-t border-line bg-surface-raised px-4 py-3 font-mono text-[11px] leading-relaxed text-ink-dim">
            Cliente da aceleração, faturamento mensal de março a julho de 2026
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
