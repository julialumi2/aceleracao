import { useState } from "react";
import { Search, ChevronRight, UserPlus } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { currentInvoice } from "../lib/invoices.js";

const FILTERS = {
  contrato: ["todos", "pendente", "assinado"],
  boleto: ["todos", "pendente", "atrasado", "pago"],
  intensidade: ["todos", "ativo", "em_queda", "inativo"],
};

const CAMPOS_NOVO_CLIENTE = [
  { key: "nome", label: "Nome" },
  { key: "cnpj", label: "CNPJ" },
  { key: "telefone", label: "Telefone (WhatsApp)" },
  { key: "email", label: "E-mail" },
  { key: "endereco", label: "Endereço" },
];

export default function ClientsList({ clients, onOpenClient, onCreateClient }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ contrato: "todos", boleto: "todos", intensidade: "todos" });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ nome: "", cnpj: "", telefone: "", email: "", endereco: "" });
  const [salvando, setSalvando] = useState(false);

  const filtered = clients.filter((c) => {
    const boleto = currentInvoice(c.boletos);
    const matchesQuery = c.nome.toLowerCase().includes(query.toLowerCase());
    const matchesContrato = filters.contrato === "todos" || c.contrato.status === filters.contrato;
    const matchesBoleto = filters.boleto === "todos" || boleto?.status === filters.boleto;
    const matchesIntensidade = filters.intensidade === "todos" || c.intensidade.status === filters.intensidade;
    return matchesQuery && matchesContrato && matchesBoleto && matchesIntensidade;
  });

  async function salvarNovoCliente() {
    if (!novo.nome.trim() || salvando) return;
    setSalvando(true);
    try {
      await onCreateClient(novo);
      setNovo({ nome: "", cnpj: "", telefone: "", email: "", endereco: "" });
      setMostrarForm(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Clientes (CRM)</h1>
          <p className="mt-1 text-sm text-ink-muted">{filtered.length} de {clients.length} clientes</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 sm:w-64">
            <Search size={15} className="text-ink-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
            />
          </div>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-brand px-4 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
          >
            <UserPlus size={15} />
            Adicionar cliente
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm font-medium text-ink">Novo cliente</p>
          <p className="mt-1 text-xs text-ink-dim">Cliente que fechou por fora do formulário — cadastra direto aqui.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CAMPOS_NOVO_CLIENTE.map(({ key, label }) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
                <input
                  value={novo[key]}
                  onChange={(e) => setNovo((n) => ({ ...n, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={salvarNovoCliente}
              disabled={!novo.nome.trim() || salvando}
              className="rounded-xl bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              Salvar e abrir cadastro
            </button>
            <button onClick={() => setMostrarForm(false)} className="text-sm text-ink-muted hover:text-ink">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <FilterSelect label="Contrato" value={filters.contrato} options={FILTERS.contrato} onChange={(v) => setFilters((f) => ({ ...f, contrato: v }))} />
        <FilterSelect label="Boleto" value={filters.boleto} options={FILTERS.boleto} onChange={(v) => setFilters((f) => ({ ...f, boleto: v }))} />
        <FilterSelect label="Intensidade" value={filters.intensidade} options={FILTERS.intensidade} onChange={(v) => setFilters((f) => ({ ...f, intensidade: v }))} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="hidden grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr_auto] gap-4 border-b border-line/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-dim sm:grid">
          <span>Cliente</span>
          <span>Contrato</span>
          <span>Boleto</span>
          <span>Intensidade</span>
          <span>Saúde</span>
          <span />
        </div>

        {filtered.map((c) => {
          const boleto = currentInvoice(c.boletos);
          return (
            <button
              key={c.id}
              onClick={() => onOpenClient(c.id)}
              className="grid w-full grid-cols-2 items-center gap-4 border-b border-line/40 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-raised sm:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr_auto]"
            >
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm font-medium text-ink">{c.nome}</p>
                <p className="text-xs text-ink-dim">{c.cnpj || "CNPJ não informado"}</p>
              </div>
              <StatusBadge status={c.contrato.status} />
              {boleto ? <StatusBadge status={boleto.status} /> : <span className="text-xs text-ink-dim">—</span>}
              <StatusBadge status={c.intensidade.status} />
              <StatusBadge status={`saude_${c.saude}`} />
              <ChevronRight size={16} className="hidden text-ink-dim sm:block" />
            </button>
          );
        })}

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
