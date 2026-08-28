import printFev1 from "../../assets/landing/print-fev-1.webp";
import printFev2 from "../../assets/landing/print-fev-2.webp";
import printFev3 from "../../assets/landing/print-fev-3.webp";

const PRINTS = [
  {
    src: printFev1,
    alt: "Print do painel de um cliente: R$ 49.418,86 de faturamento em fevereiro de 2026, 720 pedidos, alta de 100 por cento.",
  },
  {
    src: printFev2,
    alt: "Print do painel de um cliente: R$ 131.974,72 de faturamento em fevereiro de 2026, 1.611 pedidos, ticket médio de R$ 81,92.",
  },
  {
    src: printFev3,
    alt: "Print do painel de um cliente: R$ 69.692,95 de faturamento em fevereiro de 2026, 1.405 pedidos, ticket médio de R$ 49,60.",
  },
];

export default function SocialProof() {
  return (
    <section className="border-t border-line/60 bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-2xl tracking-wide text-ink md:text-4xl">
            Mais de 25 donos de delivery já aumentaram o faturamento com a gente
          </h2>
          <p className="mt-4 text-ink-muted">Confira alguns resultados:</p>
        </div>

        <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {PRINTS.map((p) => (
            <figure
              key={p.src}
              className="w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-white shadow-lg shadow-black/20 sm:w-auto sm:shrink"
            >
              <img src={p.src} alt={p.alt} className="w-full" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
