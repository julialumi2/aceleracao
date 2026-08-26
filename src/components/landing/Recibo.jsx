const ITENS = [
  { valor: "R$ 2.500,00", item: "Estratégia de Delivery" },
  { valor: "R$ 1.800,00", item: "Acesso aos Fornecedores Parceiros" },
  { valor: "R$ 3.000,00", item: "Gestão de Tráfego" },
  { valor: "R$ 1.500,00", item: "Estratégia de Conteúdo Orgânico" },
  { valor: "R$ 1.200,00", item: "Relatórios Semanais" },
];

export default function Recibo() {
  return (
    <section className="border-t border-line/60 bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-balance text-center font-display text-2xl tracking-wide text-ink md:text-4xl">
          Recapitulando tudo que entra na aceleração:
        </h2>

        <div className="relative mx-auto mt-12 max-w-xl rounded-xl border border-line bg-surface p-6 font-mono shadow-2xl shadow-black/40 sm:p-8">
          <p className="border-b border-dashed border-line pb-5 text-center text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Custo avulso por mês
          </p>

          {ITENS.map((row, i) => (
            <div
              key={row.item}
              className={`flex items-baseline justify-between gap-4 py-4 text-sm ${
                i < ITENS.length - 1 ? "border-b border-dashed border-line" : ""
              }`}
            >
              <span className="whitespace-nowrap text-ink-dim line-through">{row.valor}</span>
              <span className="text-right font-body text-[0.9375rem] text-ink-muted">{row.item}</span>
            </div>
          ))}

          <div className="relative mt-1.5">
            <span className="absolute -left-[27px] -top-[13px] h-6 w-6 rounded-full border border-line bg-base sm:-left-[35px]" />
            <span className="absolute -right-[27px] -top-[13px] h-6 w-6 rounded-full border border-line bg-base sm:-right-[35px]" />
            <div className="flex items-center justify-between rounded-lg border border-emerald-brand/32 bg-base p-5">
              <span className="font-display text-2xl tracking-tight text-emerald-bright md:text-3xl">
                R$ 10.000,00
              </span>
              <span className="font-display text-xs uppercase tracking-wide text-ink">Total por mês</span>
            </div>
          </div>

          <p className="mt-5 text-center font-body text-sm leading-relaxed text-ink-dim">
            Esse é o custo de montar tudo isso por fora: consultor, gestor de tráfego, estrategista e analista, cada um
            cobrando o seu.
          </p>
        </div>
      </div>
    </section>
  );
}
