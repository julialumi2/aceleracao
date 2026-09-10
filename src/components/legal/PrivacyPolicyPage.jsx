export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-base px-6 py-16 text-ink">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-ink-muted hover:text-ink">
          ← Voltar
        </a>

        <h1 className="mt-6 font-display text-3xl tracking-wide text-ink">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-ink-dim">Última atualização: 10 de setembro de 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-muted">
          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">1. Quem somos</h2>
            <p className="mt-2">
              A Aceleração Delivery é um serviço de mentoria para donos de restaurante, operado pela GSA Consultoria em
              Vendas Ltda (CNPJ 65.200.736/0001-59). Esta política explica quais dados coletamos, como usamos e como
              você pode exercer seus direitos sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">2. Quais dados coletamos</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Formulário de interesse:</strong> nome, WhatsApp, nome do negócio, cidade/estado,
                faturamento mensal e respostas às demais perguntas do formulário.
              </li>
              <li>
                <strong className="text-ink">Navegação no site:</strong> páginas visitadas, endereço IP, tipo de navegador e
                cookies de medição de anúncios (ver seção 5).
              </li>
              <li>
                <strong className="text-ink">Cadastro de cliente:</strong> nome, CNPJ, endereço, dados bancários,
                horário de funcionamento e informações necessárias pra emissão de cobrança e contrato.
              </li>
              <li>
                <strong className="text-ink">Conta Instagram (clientes que autorizarem a conexão):</strong> métricas
                públicas de desempenho da conta conectada — número de publicações, alcance e visualizações — usadas
                exclusivamente para acompanhar a execução da estratégia de conteúdo combinada na mentoria. Não
                acessamos mensagens diretas, contatos ou dados pessoais dos seguidores da conta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">3. Como usamos os dados</h2>
            <p className="mt-2">Usamos os dados coletados para:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Entrar em contato sobre a mentoria e prestar o serviço contratado;</li>
              <li>Gerar cobranças recorrentes via Asaas;</li>
              <li>Gerar e enviar contratos para assinatura via Clicksign;</li>
              <li>Acompanhar a intensidade de execução da estratégia de conteúdo nas redes sociais do cliente;</li>
              <li>Enviar comunicações operacionais por WhatsApp relacionadas à mentoria;</li>
              <li>Medir o resultado dos nossos anúncios no Facebook e no Instagram.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">4. Com quem compartilhamos</h2>
            <p className="mt-2">
              Não vendemos dados a terceiros. Compartilhamos apenas com prestadores necessários à operação do serviço:
              Asaas (emissão de cobrança), Clicksign (assinatura de contrato) e Meta — tanto para leitura de métricas da
              conta Instagram conectada (mediante sua autorização explícita via login) quanto para medição de anúncios
              (ver seção 5).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">5. Cookies e medição de anúncios</h2>
            <p className="mt-2">
              Este site usa o Pixel da Meta e a API de Conversões da Meta para saber quantas pessoas chegaram pelos
              nossos anúncios e quantas preencheram o formulário. Para isso, o Pixel grava cookies no seu navegador
              (<code>_fbp</code> e <code>_fbc</code>) e, quando você envia o formulário, compartilhamos com a Meta seu
              nome e WhatsApp em forma criptografada (hash SHA-256 — a Meta nunca recebe o dado em texto aberto), junto
              com o endereço IP e o tipo de navegador. A Meta usa essas informações para medir e melhorar a entrega
              dos anúncios.
            </p>
            <p className="mt-2">
              Você pode bloquear ou apagar esses cookies nas configurações do seu navegador e ajustar como a Meta usa
              seus dados para anúncios em Configurações do Facebook/Instagram → Preferências de anúncios.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">6. Armazenamento e segurança</h2>
            <p className="mt-2">
              Os dados ficam armazenados em banco de dados próprio, com acesso restrito à equipe da Aceleração
              Delivery. Tokens de acesso a contas conectadas (como o Instagram) ficam acessíveis somente pelos
              sistemas internos, nunca expostos publicamente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">7. Seus direitos</h2>
            <p className="mt-2">
              Você pode solicitar a qualquer momento a exclusão dos seus dados, a revogação do acesso à sua conta do
              Instagram, ou esclarecimentos sobre o uso das suas informações. Veja{" "}
              <a href="/exclusao-de-dados" className="text-emerald-bright hover:underline">
                como solicitar exclusão de dados
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg tracking-wide text-ink">8. Contato</h2>
            <p className="mt-2">
              Dúvidas sobre privacidade? Fale com a gente pelo WhatsApp indicado no site ou pelo e-mail{" "}
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
