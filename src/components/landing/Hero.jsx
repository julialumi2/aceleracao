import { ArrowUpRight, TrendingUp } from "lucide-react";
import Sparks from "../shared/Sparks.jsx";
import mentorPhoto from "../../assets/mentor-cutout.png";

export default function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <Sparks className="h-[500px]" />

      <img
        src={mentorPhoto}
        alt="Mentor responsável pela Aceleração Delivery"
        className="pointer-events-none absolute bottom-0 right-0 w-[85%] object-contain opacity-65 md:w-[75%] lg:right-[1%] lg:w-[62%]"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28 lg:pb-24">
        <div className="flex flex-col items-center text-center lg:max-w-md lg:items-start lg:text-left">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-xs font-medium text-emerald-bright">
            <TrendingUp size={14} />
            Mentoria estruturada, do cardápio ao caixa
          </span>

          <h1 className="text-balance font-display text-4xl leading-[1.08] tracking-wide text-ink md:text-6xl md:leading-[1.15] md:tracking-wider lg:text-5xl">
            Sua casa lotada não é sorte.{" "}
            <span className="text-emerald-bright">É método.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-ink-muted md:text-lg">
            Mentoria para donos de restaurante que querem sair da correria operacional
            e escalar com cardápio otimizado, presença digital ativa e finanças sob controle —
            com acompanhamento próximo, não curso gravado.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/comecar"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-7 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
            >
              Quero Escalar meu Restaurante
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
