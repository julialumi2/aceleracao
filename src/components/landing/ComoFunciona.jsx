const PASSOS = [
  {
    numero: "01",
    titulo: "Aprovação e contrato",
    descricao: "Alinhamos os detalhes da proposta e formalizamos a parceria.",
  },
  {
    numero: "02",
    titulo: "Onboarding",
    descricao: "Reunião de briefing pra pegar os acessos e entender o negócio.",
  },
  {
    numero: "03",
    titulo: "Implementação do cardápio",
    descricao: "Ajustamos precificação, fotos e posicionamento pensados pra delivery.",
  },
  {
    numero: "04",
    titulo: "Entrega dos vídeos",
    descricao: "Você grava os vídeos simples que pedimos, prontos pra virar anúncio.",
  },
  {
    numero: "05",
    titulo: "Execução e relatório mensal",
    descricao: "Tráfego rodando, com ajustes semana a semana e relatório de resultado todo mês.",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="border-t border-line/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl tracking-wide text-ink md:text-4xl">Como funciona</h2>
          <p className="mt-4 text-ink-muted">Da assinatura ao resultado, passo a passo — sem mistério.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {PASSOS.map(({ numero, titulo, descricao }) => (
            <div
              key={numero}
              className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-emerald-brand/50"
            >
              <span className="font-display text-3xl tracking-wide text-emerald-bright/70 transition-colors group-hover:text-emerald-bright">
                {numero}
              </span>
              <h3 className="mt-3 font-display text-base tracking-wide text-ink">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
