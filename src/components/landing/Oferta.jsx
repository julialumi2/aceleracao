import { ArrowUpRight, Check } from "lucide-react";

const COMO = [
  "Você responde o formulário, leva 2 minutos.",
  "Nosso time analisa a sua operação e vê se ela tem perfil para a aceleração.",
  "Se fizer sentido, você é chamado para o diagnóstico individual e sai com o seu plano de ação.",
];

export default function Oferta() {
  return (
    <section id="oferta" className="border-t border-line/60 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="mx-auto max-w-[20ch] text-balance font-display text-2xl tracking-wide text-ink md:text-4xl">
            Montar essa estrutura por fora passa de R$ 10.000 por mês.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
            Na aceleração você tem tudo isso em um lugar só, e o investimento é montado de acordo com o tamanho da sua
            operação.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-5 rounded-2xl border-2 border-emerald-brand bg-gradient-to-b from-surface-raised to-surface p-8 text-center shadow-2xl shadow-emerald-brand/20 sm:p-11">
          <h3 className="font-display text-lg uppercase tracking-wide text-ink">
            Concorra a um diagnóstico individual
          </h3>
          <p className="font-display text-5xl uppercase tracking-tight text-emerald-bright md:text-6xl">
            Sem custo
          </p>
          <div className="flex flex-col gap-2.5">
            <p className="max-w-[44ch] text-sm leading-relaxed text-ink-muted">
              A aceleração não é para todo delivery. Você responde o formulário, a gente analisa a sua operação e, se
              fizer sentido, chama você para o diagnóstico.
            </p>
            <p className="max-w-[44ch] text-sm leading-relaxed text-ink-muted">
              Quem é chamado sai do diagnóstico com um plano de ação, entrando ou não para a aceleração.
            </p>
          </div>
          <a
            href="/comecar"
            className="group inline-flex w-full max-w-[420px] items-center justify-center gap-2 rounded-full bg-emerald-brand px-6 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
          >
            Quero acelerar meu delivery
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
            {["Diagnóstico sem custo", "Vagas limitadas", "Resposta em até 24h"].map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Check size={13} className="text-[#2FBF63]" strokeWidth={3} />
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-dim">Como funciona</span>
          <ol className="grid gap-3 sm:grid-cols-3">
            {COMO.map((passo, i) => (
              <li key={passo} className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-ink-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-emerald-brand/32 font-mono text-xs font-bold text-emerald-bright">
                  {i + 1}
                </span>
                {passo}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
