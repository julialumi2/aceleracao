const VOZES = [
  "Eu vendo bem, mas no fim do mês não sobra dinheiro.",
  "Minha margem é tão baixa que quase não vale a pena.",
  "Coloco dinheiro em tráfego e não volta em pedido.",
  "O cliente compra uma vez e some.",
  "Se eu não fizer promoção, não vende nada.",
  "Trabalho o mês inteiro e o lucro fica todo com o aplicativo.",
];

export default function PainPoints() {
  return (
    <section className="border-t border-line/60 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-balance font-display text-2xl tracking-wide text-ink md:text-4xl">
          A cada dia que passa você vende mais e lucra menos...
        </h2>

        <div className="mt-10 flex flex-col gap-3">
          {VOZES.map((voz) => (
            <p
              key={voz}
              className="rounded-r-lg border-l-[3px] border-emerald-brand bg-surface px-5 py-4 text-base italic leading-relaxed text-ink"
            >
              "{voz}"
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
