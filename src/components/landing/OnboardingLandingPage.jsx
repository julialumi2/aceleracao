import { useState } from "react";
import { Flame, ArrowUpRight, Building2, Landmark, Clock3 } from "lucide-react";
import Sparks from "../shared/Sparks.jsx";
import OnboardingFormPage from "./OnboardingFormPage.jsx";

const HIGHLIGHTS = [
  { icon: Building2, label: "Dados da empresa" },
  { icon: Landmark, label: "Informações bancárias" },
  { icon: Clock3, label: "Horário de funcionamento" },
];

export default function OnboardingLandingPage() {
  const [mostrarForm, setMostrarForm] = useState(false);

  if (mostrarForm) {
    return <OnboardingFormPage />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base text-ink">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/4 animate-ring-pulse ring-motif" />
      <Sparks className="h-[500px]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-20 text-center md:pt-28">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-lg tracking-wide text-ink">Aceleração Delivery</span>
        </div>

        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-xs font-medium text-emerald-bright">
          Bem-vindo(a) à mentoria
        </span>

        <h1 className="text-balance font-display text-4xl tracking-wide text-ink md:text-5xl">
          Falta pouco pra <span className="text-emerald-bright">começarmos.</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-ink-muted md:text-lg">
          Que bom ter você com a gente! Antes de liberarmos o contrato e a cobrança, precisamos de alguns dados do seu
          restaurante — leva só alguns minutos pra preencher.
        </p>

        <button
          onClick={() => setMostrarForm(true)}
          className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-7 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
        >
          Completar meu cadastro
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-line/60 pt-8 text-xs text-ink-dim">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2">
              <Icon size={14} className="text-emerald-bright" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
