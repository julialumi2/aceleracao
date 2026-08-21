export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base px-6 py-16 text-ink">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-ink-muted hover:text-ink">
          ← Voltar
        </a>

        <h1 className="mt-6 font-display text-3xl tracking-wide text-ink">Termos de Uso</h1>
        <p className="mt-2 text-sm text-ink-dim">Última atualização: 21 de agosto de 2026</p>

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink-muted">
          <p>
            Este site e o serviço de mentoria são operados pela GSA Consultoria em Vendas Ltda (CNPJ
            65.200.736/0001-59). Ao preencher o formulário de interesse ou contratar a mentoria, você concorda com os
            termos abaixo.
          </p>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">Sobre o serviço</h2>
            <p className="mt-2">
              A Aceleração Delivery presta serviços de mentoria e consultoria empresarial com foco em aceleração de
              delivery e gestão de tráfego pago, conforme condições combinadas no contrato assinado com cada cliente.
              Este site não realiza venda direta de produtos — o formulário de interesse é o primeiro passo de um
              processo comercial que só se torna vinculante mediante contrato assinado.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">Uso do site</h2>
            <p className="mt-2">
              O conteúdo deste site é de uso exclusivo dos visitantes e clientes para fins de conhecer e contratar o
              serviço. É proibida a reprodução do conteúdo sem autorização.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">Privacidade</h2>
            <p className="mt-2">
              O uso dos seus dados é regido pela nossa{" "}
              <a href="/privacidade" className="text-emerald-bright hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">Contato</h2>
            <p className="mt-2">
              Dúvidas sobre estes termos? Fale pelo e-mail{" "}
              <a href="mailto:contato@resultadocontabilidade.com.br" className="text-emerald-bright hover:underline">
                contato@resultadocontabilidade.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
