import { Instagram } from "lucide-react";

const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

export default function ConectarInstagramPage() {
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get("c");

  const semLink = !restaurantId;
  const urlAutorizar = restaurantId
    ? `${ASAAS_PROXY_URL}/instagram/autorizar?restaurantId=${encodeURIComponent(restaurantId)}`
    : "#";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-6">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
          <Instagram size={22} />
        </span>
        <h1 className="mt-5 font-display text-2xl tracking-wide text-ink">Conectar seu Instagram</h1>

        {semLink ? (
          <p className="mt-4 text-sm text-ink-muted">
            Esse link está incompleto. Pede pra equipe da Aceleração Delivery te mandar o link certo de novo.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Pra gente acompanhar os números da sua conta (quantidade de posts e alcance) e te ajudar a ajustar a
              estratégia, precisamos que você autorize o acesso pelo Facebook. Só lemos métricas públicas de
              desempenho — nada de mensagens, contatos ou dados dos seus seguidores.
            </p>
            <a
              href={urlAutorizar}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-brand px-6 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright"
            >
              Continuar com o Facebook
            </a>
            <p className="mt-4 text-xs text-ink-dim">
              Sua conta do Instagram precisa ser Comercial ou Criador de Conteúdo, e estar vinculada a uma Página do
              Facebook.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
