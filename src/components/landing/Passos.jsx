const PASSOS = [
  {
    numero: "01",
    titulo: "Agendamento",
    descricao: "Você responde o formulário e agenda uma reunião com o nosso time.",
  },
  {
    numero: "02",
    titulo: "Plano de ação",
    descricao: "A gente analisa a sua operação e monta o plano do que precisa mudar.",
  },
  {
    numero: "03",
    titulo: "Aceleração",
    descricao: "Você entra para a aceleração e a gente executa junto com você.",
  },
  {
    numero: "04",
    titulo: "Escala",
    descricao: "Escalamos as suas vendas com tráfego, recompra e margem no lugar.",
  },
];

export default function Passos() {
  return (
    <section className="border-t border-line/60 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mx-auto max-w-2xl text-balance text-center font-display text-2xl tracking-wide text-ink md:text-4xl">
          Estes são os 4 passos para o seu delivery vender mais e lucrar mais:
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map(({ numero, titulo, descricao }) => (
            <article key={numero} className="rounded-2xl border border-line bg-surface p-6">
              <span className="font-display text-3xl tracking-wide text-emerald-bright">{numero}</span>
              <h3 className="mt-3 font-display text-sm uppercase tracking-wide text-ink">{titulo}</h3>
              <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
                <span className="text-emerald-bright">➡</span>
                {descricao}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
