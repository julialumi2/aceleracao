import { ArrowUpRight } from "lucide-react";

export default function StepShell({
  categoria,
  passoAtual,
  totalPassos,
  podeVoltar,
  onVoltar,
  podeContinuar = true,
  rotuloContinuar = "Continuar",
  enviando = false,
  erro = "",
  onSubmit,
  children,
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full bg-emerald-brand transition-all duration-300"
          style={{ width: `${(passoAtual / totalPassos) * 100}%` }}
        />
      </div>

      <div className="mb-6 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-bright">{categoria}</span>
        <span className="text-xs text-ink-dim">
          Pergunta {passoAtual} de {totalPassos}
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!podeContinuar || enviando) return;
          onSubmit();
        }}
      >
        <div key={passoAtual} className="animate-fade-up space-y-2">
          {children}
        </div>

        {erro && <p className="mt-4 text-sm text-flame">{erro}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          {podeVoltar ? (
            <button
              type="button"
              onClick={onVoltar}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Voltar
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!podeContinuar || enviando}
            className="group flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-7 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright disabled:translate-y-0 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : rotuloContinuar}
            {!enviando && (
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
