import guilhermePalco from "../../assets/landing/guilherme-palco.webp";

export default function SobreAutor() {
  return (
    <section className="border-t border-line/60 py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl items-start gap-8 px-6 md:grid-cols-[0.82fr_1.18fr] md:gap-14">
        <h2 className="text-balance font-display text-2xl tracking-wide text-ink md:col-span-2 md:text-4xl">
          Guilherme Araújo é quem criou a Aceleração de Delivery.
        </h2>

        <figure className="overflow-hidden rounded-2xl border border-line">
          <img src={guilhermePalco} alt="Guilherme Araújo no palco de um evento, falando ao microfone para uma plateia." className="w-full" />
        </figure>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3.5 text-[1.0313rem] leading-relaxed text-ink-muted">
            <p className="font-display text-lg tracking-wide text-ink">Guilherme Artesanos</p>
            <p>Começou aos 17 anos vendendo lanche no fundo da casa dos pais em Sorocaba.</p>
            <p>
              Hoje é dono de 3 empresas, Artesanos Burger, Autêlie Garden e Tradiça Dog, e está abrindo a segunda
              unidade do Tradiça.
            </p>
            <p>
              Em 2024, descobriu uma estratégia de delivery que fez seu negócio crescer{" "}
              <strong className="font-semibold text-ink">46% em um ano</strong>. Em 2025, mais{" "}
              <strong className="font-semibold text-ink">30%</strong>.
            </p>
            <p>É exatamente isso que a gente coloca na sua operação quando você entra para a aceleração.</p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {["Artesanos Burger", "Autêlie Garden", "Tradiça Dog"].map((c) => (
              <li key={c} className="rounded-full border border-line px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide text-ink-muted">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
