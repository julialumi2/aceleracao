import { Flame, ArrowLeft, ShieldCheck, Users, FileSignature, Wallet } from "lucide-react";
import Sparks from "../components/shared/Sparks.jsx";

const HIGHLIGHTS = [
  { icon: Users, label: "CRM de clientes ativos" },
  { icon: FileSignature, label: "Contratos e assinaturas" },
  { icon: Wallet, label: "Cobranças e alertas" },
];

export default function AdminLanding({ onEnter, onBackToSite }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-base px-6 text-ink">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 animate-ring-pulse ring-motif" />
      <Sparks />

      <button
        onClick={onBackToSite}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Voltar ao site
      </button>

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-brand/15 text-emerald-bright">
          <ShieldCheck size={26} />
        </span>

        <h1 className="mt-6 font-display text-3xl font-bold tracking-wide text-ink md:text-4xl">
          Painel Interno <span className="text-emerald-bright">Sala Cheia</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Acesso restrito à equipe administrativa: acompanhamento de clientes, contratos,
          cobranças e intensidade de cada restaurante mentorado.
        </p>

        <button
          onClick={onEnter}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-brand px-7 py-3.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          <Flame size={16} />
          Acessar painel da equipe
        </button>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-line/60 pt-8 text-xs text-ink-dim">
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
