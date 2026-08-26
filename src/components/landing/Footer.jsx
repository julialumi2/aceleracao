import { Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 bg-surface/30">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 px-6 py-14 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">Criado por</span>
          <a href="#topo" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
              <Flame size={15} />
            </span>
            <span className="font-display text-lg tracking-wide text-ink">Aceleração de Delivery</span>
          </a>
          <p className="max-w-sm text-sm text-ink-muted">
            Aceleradora de delivery. A gente entra na operação, ajusta a margem e escala as vendas.
          </p>
        </div>

        <p className="text-sm leading-relaxed text-ink-dim">
          Artesanos Burger LTDA | CNPJ 65.200.736/0001-59
          <br />
          Sorocaba/SP
        </p>

        <div className="flex gap-6 text-xs text-ink-muted">
          <a href="/termos" className="hover:text-ink">Termos</a>
          <a href="/privacidade" className="hover:text-ink">Privacidade</a>
          <a href="/exclusao-de-dados" className="hover:text-ink">Exclusão de dados</a>
        </div>

        <p className="text-xs text-ink-dim">© {new Date().getFullYear()} Aceleração de Delivery. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
