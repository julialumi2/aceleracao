import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";

const FILTERS = {
  contrato: ["todos", "pendente", "assinado"],
  boleto: ["todos", "pendente", "atrasado", "pago"],
  intensidade: ["todos", "ativo", "em_queda", "inativo"],
};

export default function ClientsList({ clients, onOpenClient }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ contrato: "todos", boleto: "todos", intensidade: "todos" });

  const filtered = clients.filter((c) => {
    const matchesQuery = c.nome.toLowerCase().includes(query.toLowerCase());
    const matchesContrato = filters.contrato === "todos" || c.contrato.status === filters.contrato;
    const matchesBoleto = filters.boleto === "todos" || c.boleto.status === filters.boleto;
    const matchesIntensidade = filters.intensidade === "todos" || c.intensidade.status === filters.intensidade;
    return matchesQuery && matchesContrato && matchesBoleto && matchesIntensidade;
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Clientes (CRM)</h1>
          <p className="mt-1 text-sm text-ink-muted">{filtered.length} de {clients.length} clientes</p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 sm:w-64">
          <Search size={15} className="text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <FilterSelect label="Contrato" value={filters.contrato} options={FILTERS.contrato} onChange={(v) => setFilters((f) => ({ ...f, contrato: v }))} />
        <FilterSelect label="Boleto" value={filters.boleto} options={FILTERS.boleto} onChange={(v) => setFilters((f) => ({ ...f, boleto: v }))} />
        <FilterSelect label="Intensidade" value={filters.intensidade} options={FILTERS.intensidade} onChange={(v) => setFilters((f) => ({ ...f, intensidade: v }))} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-line/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-dim sm:grid">
          <span>Cliente</span>
          <span>Contrato</span>
          <span>Boleto</span>
          <span>Intensidade</span>
          <span />
        </div>

        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenClient(c.id)}
            className="grid w-full grid-cols-2 items-center gap-4 border-b border-line/40 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-raised sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
          >
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm font-medium text-ink">{c.nome}</p>
              <p className="text-xs text-ink-dim">{c.cnpj || "CNPJ não informado"}</p>
            </div>
            <StatusBadge status={c.contrato.status} />
            <StatusBadge status={c.boleto.status} />
            <StatusBadge status={c.intensidade.status} />
            <ChevronRight size={16} className="hidden text-ink-dim sm:block" />
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-ink-dim">Nenhum cliente encontrado com esses filtros.</p>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs">
      <span className="text-ink-dim">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface text-ink">
            {o === "todos" ? "Todos" : o.replace("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
