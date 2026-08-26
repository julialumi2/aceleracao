const ENTREGAS = [
  {
    titulo: "Estratégia de Delivery",
    texto: "Precificação, cardápio e oferta ajustados pra vender com margem.",
  },
  {
    titulo: "Acesso aos Fornecedores Parceiros",
    texto: "Condições de compra que você não consegue sozinho.",
  },
  {
    titulo: "Gestão de Tráfego",
    texto: "Campanhas criadas e gerenciadas pelo nosso time.",
  },
  {
    titulo: "Estratégia de Conteúdo Orgânico",
    texto: "O roteiro do que postar e como postar. A postagem continua sendo sua.",
  },
  {
    titulo: "Relatórios Semanais",
    texto: "Os números na sua mão toda semana, pra decidir com dado e não com achismo.",
  },
];

export default function Entregas() {
  return (
    <section className="border-t border-line/60 bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <h2 className="font-display text-2xl tracking-wide text-ink md:text-4xl">Tudo que você vai receber</h2>
          <p className="mt-4 text-ink-muted">
            Para você seguir esses passos e ter um delivery que vende todo dia e ainda dá lucro:
          </p>
        </div>

        <div className="mt-10 flex flex-col">
          {ENTREGAS.map((e, i) => (
            <div
              key={e.titulo}
              className={`flex items-start gap-4 py-5 ${i === 0 ? "border-t border-line" : ""} border-b border-line`}
            >
              <span className="mt-0.5 text-lg font-bold leading-none text-emerald-bright">✓</span>
              <div>
                <h3 className="font-display text-base tracking-wide text-ink">{e.titulo}</h3>
                <p className="mt-1 text-sm text-ink-muted">{e.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
