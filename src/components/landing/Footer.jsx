import { Flame } from "lucide-react";

export default function Footer({ onAdminAccess }) {
  return (
    <footer className="border-t border-line/60 bg-surface/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
        <a href="#topo" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={15} />
          </span>
          <span className="font-display text-sm font-semibold tracking-wide text-ink">Sala Cheia</span>
        </a>
        <p className="text-xs text-ink-dim">© {new Date().getFullYear()} Sala Cheia Mentoria. Todos os direitos reservados.</p>
        <div className="flex gap-6 text-xs text-ink-muted">
          <a href="#" className="hover:text-ink">Termos</a>
          <a href="#" className="hover:text-ink">Privacidade</a>
          <a href="#" className="hover:text-ink">Contato</a>
          <button onClick={onAdminAccess} className="hover:text-ink">Acesso da equipe</button>
        </div>
      </div>
    </footer>
  );
}
