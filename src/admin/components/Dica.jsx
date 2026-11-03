import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

// Explicação longa que antes ficava solta embaixo do título. Fica num
// ícone de informação: quem já sabe usar o painel não lê de novo todo dia,
// e quem precisa abre. Abre no clique (não só no hover) pra funcionar no
// celular; fecha com Esc ou clique fora.
export default function Dica({ children, rotulo = "O que é isso?" }) {
  const [aberta, setAberta] = useState(false);
  const caixaRef = useRef(null);

  useEffect(() => {
    if (!aberta) return;

    function aoClicarFora(evento) {
      if (!caixaRef.current?.contains(evento.target)) setAberta(false);
    }
    function aoTeclar(evento) {
      if (evento.key === "Escape") setAberta(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberta]);

  return (
    <span ref={caixaRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={rotulo}
        aria-expanded={aberta}
        onClick={() => setAberta((v) => !v)}
        className={`rounded-full transition-colors ${aberta ? "text-emerald-bright" : "text-ink-dim hover:text-ink-muted"}`}
      >
        <Info size={14} />
      </button>

      {aberta && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-2 w-[min(18rem,72vw)] -translate-x-1/2 rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-xs font-normal leading-relaxed text-ink-muted shadow-2xl"
        >
          {children}
        </span>
      )}
    </span>
  );
}
