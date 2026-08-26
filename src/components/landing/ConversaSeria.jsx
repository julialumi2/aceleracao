import { ArrowUpRight } from "lucide-react";

export default function ConversaSeria() {
  return (
    <section className="border-t border-line/60 bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="font-display text-2xl tracking-wide text-ink md:text-4xl">Agora uma conversa séria.</h2>

        <div className="mt-6 flex flex-col gap-4 text-[1.0313rem] leading-relaxed text-ink-muted md:text-lg">
          <p>A aceleração não é pra todo mundo.</p>
          <p>
            Se você quer resultado sem mudar nada na sua operação, não vai funcionar. A gente entra junto, mas quem toca
            o delivery é você.
          </p>
          <p>
            Em <strong className="font-semibold text-ink">15 dias</strong> você já vê o número mudar. Em{" "}
            <strong className="font-semibold text-ink">30 dias</strong> a operação é outra: margem no lugar, tráfego
            trazendo pedido e cliente voltando sem precisar de cupom.
          </p>
          <p>Só que isso não acontece sozinho. Acontece porque alguém executou.</p>
          <p>
            Por isso a gente analisa cada formulário antes de chamar alguém para o diagnóstico. Não é frescura: a gente
            atende um número limitado de operações por vez e não quer tomar uma hora do seu dia com uma conversa que não
            vai te levar a lugar nenhum.
          </p>
          <p>
            <strong className="font-semibold text-ink">Se você está pronto pra isso, a próxima vaga pode ser a sua.</strong>
          </p>
        </div>

        <a
          href="/comecar"
          className="group mt-8 inline-flex w-full max-w-[420px] items-center justify-center gap-2 rounded-full bg-emerald-brand px-6 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
        >
          Quero acelerar meu delivery
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
