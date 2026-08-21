import { CheckCircle2 } from "lucide-react";

export default function ConectarInstagramSucesso() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-6">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-brand/40 bg-surface p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-emerald-bright" />
        <h1 className="mt-5 font-display text-2xl tracking-wide text-ink">Conectado!</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Sua conta do Instagram foi conectada com sucesso. A equipe já vai começar a acompanhar seus números por
          aqui. Pode fechar esta janela.
        </p>
      </div>
    </div>
  );
}
