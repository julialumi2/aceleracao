const SITUACOES = [
  "Já vende, mas o lucro não aparece no fim do mês;",
  "Tem margem baixa e não sabe onde está vazando;",
  "Investe em anúncio e não vê o pedido entrar;",
  "Vê o cliente comprar uma vez e nunca mais voltar;",
  "Só consegue vender quando faz promoção;",
  "Depende do aplicativo e quer vender no próprio canal;",
  "Quer abrir mais uma unidade, mas a atual mal se paga;",
  "Quer crescer com número na mão, não no achismo.",
];

export default function ParaVoce() {
  return (
    <section className="border-t border-line/60 py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-balance text-center font-display text-2xl tracking-wide text-ink md:text-4xl">
          A Aceleração de Delivery é para você que...
        </h2>

        <ul className="mt-10 grid gap-x-10 gap-y-1 md:grid-cols-2">
          {SITUACOES.map((s) => (
            <li key={s} className="flex items-start gap-3 border-b border-line/60 py-3 text-[1.0313rem] text-ink">
              <span className="font-bold text-emerald-bright">✓</span>
              {s}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-balance rounded-2xl border border-emerald-brand/40 bg-emerald-brand/10 p-6 text-center font-display text-lg leading-snug tracking-wide text-ink md:text-xl">
          Se você se identifica com ao menos 2 itens acima, a Aceleração de Delivery é para você.
        </p>
      </div>
    </section>
  );
}
