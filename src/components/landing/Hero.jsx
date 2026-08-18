import { ArrowUpRight, TrendingUp } from "lucide-react";
import Sparks from "../shared/Sparks.jsx";
import mentorPhoto from "../../assets/mentor-cutout.png";

export default function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/4 animate-ring-pulse ring-motif" />
      <Sparks className="h-[500px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-20 md:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-24">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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

        <div className="relative mx-auto flex w-full max-w-xs items-end justify-center lg:max-w-none lg:h-[520px]">
          <div className="absolute inset-x-8 bottom-0 -z-10 h-2/3 rounded-[3rem] bg-emerald-brand/20 blur-3xl" />
          <img
            src={mentorPhoto}
            alt="Mentor responsável pela Aceleração Delivery"
            className="max-h-[420px] w-auto object-contain drop-shadow-2xl lg:max-h-[520px]"
          />
        </div>
      </div>
    </section>
  );
}
