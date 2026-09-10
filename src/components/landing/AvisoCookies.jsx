import { useState } from "react";

const CHAVE_AVISO = "aviso-cookies-visto";

function jaViuAviso() {
  try {
    return localStorage.getItem(CHAVE_AVISO) === "1";
  } catch {
    return false;
  }
}

// Aviso simples, sem pedir consentimento: o Pixel da Meta já roda desde a
// abertura da página. Só informa sobre os cookies de medição de anúncio e
// aponta pra Política de Privacidade — some no "Entendi" e não volta.
export default function AvisoCookies() {
  const [visivel, setVisivel] = useState(() => !jaViuAviso());

  if (!visivel) return null;

  function fechar() {
    try {
      localStorage.setItem(CHAVE_AVISO, "1");
    } catch {
      // Navegador sem armazenamento (ex.: aba anônima bloqueada) — fecha só nesta visita.
    }
    setVisivel(false);
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      {/* Só o cartão segura o clique — a faixa em volta dele é transparente e
          cobre a largura toda da tela, então não pode bloquear o que está atrás. */}
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-2.5 rounded-2xl border border-line bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-4">
        <p className="flex-1 text-[13px] leading-snug text-ink-muted sm:text-sm">
          Usamos cookies para medir o resultado dos nossos anúncios. Saiba mais na{" "}
          <a href="/privacidade" className="text-emerald-bright hover:underline">
            Política de Privacidade
          </a>
          .
        </p>
        <button
          onClick={fechar}
          className="shrink-0 rounded-full bg-emerald-brand px-5 py-2 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
