const RAZOES = [
  {
    titulo: "Seu preço foi montado no chute",
    texto: "Você precifica olhando o concorrente, não o seu custo real. Tem prato que vende muito e tira dinheiro do seu bolso a cada pedido.",
  },
  {
    titulo: "Seu tráfego não tem pra onde converter",
    texto: "O anúncio até traz gente. Mas o cardápio, a foto e a oferta não fecham a venda. Você paga por visita, não por pedido.",
  },
  {
    titulo: "Você conquista o cliente e perde ele no dia seguinte",
    texto: "Nada acontece depois do primeiro pedido. Aí você paga caro de novo pra trazer um cliente que já era seu.",
  },
  {
    titulo: "Desconto virou a sua única arma",
    texto: "Quando o preço é o único motivo da compra, todo mês você precisa dar mais pra vender igual.",
  },
];

export default function Razoes() {
  return (
    <section className="border-t border-line/60 bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance font-display text-2xl leading-tight tracking-wide text-ink md:text-4xl">
            O problema não está no seu produto.
            <br />
            Está na falta de controle sobre a sua operação.
          </h2>
          <p className="mt-4 text-ink-muted">As principais razões pelas quais o seu delivery vende e não lucra:</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {RAZOES.map((r) => (
            <article key={r.titulo} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="font-display text-lg tracking-wide text-ink">{r.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{r.texto}</p>
            </article>
          ))}
        </div>

        <p className="mt-12 text-balance text-center font-display text-xl tracking-wide text-emerald-bright md:text-2xl">
          É por isso que você precisa da Aceleração de Delivery agora!
        </p>
      </div>
    </section>
  );
}
