import { ArrowUpRight, Check } from "lucide-react";
import guilhermePalco from "../../assets/landing/guilherme-palco.webp";

export default function SobreAutor() {
  return (
    <section className="border-t border-line/60 py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-[0.82fr_1.18fr] md:gap-14">
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
              Hoje é dono de 3 empresas, Artesanos Burger, Atelier Garden e Tradissa Dog, e está abrindo a segunda
              unidade do Tradissa.
            </p>
            <p>
              Em 2024, descobriu uma estratégia de delivery que fez seu negócio crescer{" "}
              <strong className="font-semibold text-ink">46% em um ano</strong>. Em 2025, mais{" "}
              <strong className="font-semibold text-ink">30%</strong>.
            </p>
            <p>É exatamente isso que a gente coloca na sua operação quando você entra para a aceleração.</p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {["Artesanos Burger", "Atelier Garden", "Tradissa Dog"].map((c) => (
              <li key={c} className="rounded-full border border-line px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide text-ink-muted">
                {c}
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-emerald-brand bg-surface p-7 text-center">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink">
              Concorra a um diagnóstico individual
            </h3>
            <p className="font-display text-4xl font-black uppercase tracking-tighter text-emerald-bright">Sem custo</p>
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-relaxed text-ink-muted">
                Responda o formulário e a gente analisa a sua operação. Se ela tiver perfil, você é chamado para o
                diagnóstico.
              </p>
              <p className="text-sm leading-relaxed text-ink-muted">
                O investimento é definido depois, de acordo com o escopo do seu projeto.
              </p>
            </div>
            <a
              href="/comecar"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-brand px-6 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
            >
              Quero acelerar meu delivery
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
              {["Vagas limitadas", "Resposta em até 24h"].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Check size={13} className="text-[#2FBF63]" strokeWidth={3} />
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
