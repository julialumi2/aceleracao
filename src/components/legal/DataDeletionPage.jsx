export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-base px-6 py-16 text-ink">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-ink-muted hover:text-ink">
          ← Voltar
        </a>

        <h1 className="mt-6 font-display text-3xl tracking-wide text-ink">Exclusão de dados</h1>
        <p className="mt-2 text-sm text-ink-dim">Última atualização: 21 de agosto de 2026</p>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink-muted">
          <p>
            Se você é um lead, cliente da mentoria, ou conectou uma conta do Instagram à Aceleração Delivery e deseja
            que seus dados sejam apagados dos nossos sistemas, siga um dos passos abaixo.
          </p>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">Solicitar exclusão</h2>
            <p className="mt-2">
              Mande um e-mail para{" "}
              <a href="mailto:contato@resultadocontabilidade.com.br?subject=Exclus%C3%A3o%20de%20dados" className="text-emerald-bright hover:underline">
                contato@resultadocontabilidade.com.br
              </a>{" "}
              com o assunto "Exclusão de dados", informando seu nome e o telefone ou e-mail usado no cadastro.
              Confirmamos o pedido e apagamos os dados em até 15 dias úteis, exceto informações que sejamos
              obrigados a manter por exigência legal ou fiscal (ex: histórico de cobrança já emitida).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">Revogar acesso à conta do Instagram</h2>
            <p className="mt-2">
              Se você conectou sua conta do Instagram/Facebook à mentoria e quer revogar esse acesso a qualquer
              momento, você pode fazer isso direto pelo Facebook, sem precisar da gente:
            </p>
            <p className="mt-2">
              Configurações do Facebook → Aplicativos e sites → localize "Aceleração Delivery" → Remover. Isso
              invalida imediatamente o acesso que tínhamos à sua conta. Depois disso, pode nos avisar pelo e-mail
              acima pra também apagarmos as métricas já coletadas dos nossos sistemas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
