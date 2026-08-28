import { Flame, ArrowUpRight } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="#topo" className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-base tracking-wide text-ink sm:text-lg">
            <span className="hidden sm:inline">Aceleração </span>de Delivery
          </span>
        </a>

        <a
          href="/comecar"
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-brand px-4 py-2.5 text-xs font-semibold text-base transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright sm:gap-2 sm:px-5 sm:text-sm"
        >
          <span className="hidden sm:inline">Quero acelerar meu delivery</span>
          <span className="sm:hidden">Acelerar delivery</span>
          <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </header>
  );
}
