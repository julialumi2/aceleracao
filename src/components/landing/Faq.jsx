import { ChevronDown } from "lucide-react";

const PERGUNTAS = [
  {
    pergunta: "Quanto custa a aceleração?",
    resposta:
      "O investimento é definido de acordo com o escopo do seu projeto. No diagnóstico a gente entende o tamanho da sua operação e monta a proposta. O diagnóstico é sem custo.",
  },
  {
    pergunta: "Em quanto tempo eu vejo resultado?",
    resposta: "Em 15 dias os primeiros números já mudam. Em 30 dias a operação está em outro patamar.",
  },
  {
    pergunta: "Preciso já vender em aplicativo?",
    resposta: "Não. A gente trabalha tanto com quem depende dos aplicativos quanto com quem quer construir o próprio canal de venda.",
  },
  {
    pergunta: "Vocês fazem as minhas postagens?",
    resposta: "Não. A gente entrega a estratégia e o roteiro de conteúdo, ou seja, o que postar e como postar. A execução das postagens fica com o seu time.",
  },
  {
    pergunta: "Todo mundo que preenche consegue o diagnóstico?",
    resposta:
      "Não. A gente atende um número limitado de operações por vez, então analisa cada formulário antes de chamar. Isso também é bom para você: não faz sentido gastar uma hora num diagnóstico se a aceleração não é o que o seu delivery precisa agora. Se não for a hora, a gente diz.",
  },
  {
    pergunta: "Vocês atendem delivery de qualquer cidade?",
    resposta: "Sim. O atendimento é 100% remoto, então não importa onde fica o seu delivery.",
  },
  {
    pergunta: "Como funciona o diagnóstico?",
    resposta:
      "Você responde um formulário com algumas perguntas sobre a sua operação. Nosso time analisa e retorna em até 24h. Se o seu delivery tiver perfil, a gente marca o diagnóstico individual. Se não tiver, a gente fala com franqueza e explica o porquê.",
  },
];

export default function Faq() {
  return (
    <section className="border-t border-line/60 bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center font-display text-2xl tracking-wide text-ink md:text-4xl">Perguntas frequentes</h2>

        <div className="mt-10 flex flex-col gap-2.5">
          {PERGUNTAS.map((f) => (
            <details key={f.pergunta} className="group overflow-hidden rounded-lg border border-line bg-surface-raised">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-display text-base tracking-wide text-ink [&::-webkit-details-marker]:hidden">
                {f.pergunta}
                <ChevronDown size={14} className="shrink-0 text-emerald-bright transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-muted">{f.resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
