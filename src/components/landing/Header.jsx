import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header({ onAdminAccess }) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Recursos", href: "#recursos" },
    { label: "Planos", href: "#planos" },
    { label: "Como funciona", href: "#como-funciona" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#topo" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-lg font-semibold tracking-wide text-ink">
            Aceleração Delivery
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <button onClick={onAdminAccess} className="text-sm text-ink-muted transition-colors hover:text-ink">
            Acesso da equipe
          </button>
        </nav>

        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line/60 bg-base px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink-muted" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onAdminAccess?.();
              }}
              className="text-left text-sm text-ink-muted"
            >
              Acesso da equipe
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
