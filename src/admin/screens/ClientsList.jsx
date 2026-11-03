import { useState } from "react";
import { Search, ChevronRight, UserPlus, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import StatusBadge, { NextBillingBadge } from "../components/StatusBadge.jsx";
import Botao from "../components/Botao.jsx";
import { classeCampo, RotuloCampo } from "../components/Campo.jsx";
import { currentInvoice, billingSummary, formatDateAbrev } from "../lib/invoices.js";

const FILTERS = {
  contrato: ["todos", "pendente", "assinado"],
  boleto: ["todos", "pendente", "atrasado", "pago"],
  intensidade: ["todos", "ativo", "em_queda", "inativo"],
};

const CAMPOS_NOVO_CLIENTE = [
  { key: "empresa", label: "Empresa" },
  { key: "nome", label: "Nome do responsável" },
  { key: "cnpj", label: "CNPJ" },
  { key: "telefone", label: "Telefone (WhatsApp)" },
  { key: "email", label: "E-mail" },
  { key: "cep", label: "CEP" },
];

function formatArchivedDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function ClientsList({
  clients,
  onOpenClient,
  onCreateClient,
  archivedClients,
  loadingArchived,
  onLoadArchived,
  onRestoreClient,
  onDeleteClient,
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ contrato: "todos", boleto: "todos", intensidade: "todos" });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ empresa: "", nome: "", cnpj: "", telefone: "", email: "", cep: "" });
  const [salvando, setSalvando] = useState(false);
  const [verArquivados, setVerArquivados] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmarExclusao(client) {
    if (excluindo) return;
    setExcluindo(true);
    try {
      await onDeleteClient(client);
      setConfirmDeleteId(null);
    } finally {
      setExcluindo(false);
    }
  }

  const filtered = clients.filter((c) => {
    const boleto = currentInvoice(c.boletos);
    const matchesQuery =
      c.nome.toLowerCase().includes(query.toLowerCase()) || (c.empresa || "").toLowerCase().includes(query.toLowerCase());
    const matchesContrato = filters.contrato === "todos" || c.contrato.status === filters.contrato;
    const matchesBoleto = filters.boleto === "todos" || boleto?.status === filters.boleto;
    const matchesIntensidade = filters.intensidade === "todos" || c.intensidade.status === filters.intensidade;
    return matchesQuery && matchesContrato && matchesBoleto && matchesIntensidade;
  });
  const filteredAtivos = filtered.filter((c) => !c.canceladoEm);
  const filteredCancelados = filtered.filter((c) => c.canceladoEm);

  async function salvarNovoCliente() {
    if (!novo.nome.trim() || salvando) return;
    setSalvando(true);
    try {
      await onCreateClient(novo);
      setNovo({ empresa: "", nome: "", cnpj: "", telefone: "", email: "", cep: "" });
      setMostrarForm(false);
    } finally {
      setSalvando(false);
    }
  }

  function toggleArquivados() {
    const next = !verArquivados;
    setVerArquivados(next);
    if (next) onLoadArchived();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-ink">Clientes (CRM)</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {verArquivados ? `${archivedClients.length} cliente(s) arquivado(s)` : `${filtered.length} de ${clients.length} clientes`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!verArquivados && (
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-colors focus-within:border-emerald-brand/70 focus-within:ring-2 focus-within:ring-emerald-brand/25 sm:w-64">
              <Search size={15} className="text-ink-dim" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
              />
            </div>
          )}
          <Botao
            variante="secundario"
            icone={Archive}
            onClick={toggleArquivados}
            className={verArquivados ? "border-emerald-brand/40 text-emerald-bright" : ""}
          >
            {verArquivados ? "Ver ativos" : "Ver arquivados"}
          </Botao>
          {!verArquivados && (
            <Botao variante="primario" icone={UserPlus} onClick={() => setMostrarForm((v) => !v)}>
              Adicionar cliente
            </Botao>
          )}
        </div>
      </div>

      {verArquivados ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="hidden grid-cols-[1.3fr_1fr_auto] gap-4 border-b border-line/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-dim sm:grid">
            <span>Cliente</span>
            <span>Arquivado em</span>
            <span />
          </div>

          {loadingArchived && <p className="px-5 py-8 text-center text-sm text-ink-dim">Carregando...</p>}

          {!loadingArchived &&
            archivedClients.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-1 items-center gap-3 border-b border-line/40 px-5 py-4 last:border-b-0 sm:grid-cols-[1.3fr_1fr_auto]"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{c.nome}</p>
                  <p className="text-xs text-ink-dim">{c.cnpj || "CNPJ não informado"}</p>
                </div>
                <p className="text-xs text-ink-dim">{formatArchivedDate(c.arquivadoEm)}</p>
                <div className="flex items-center gap-2 justify-self-start sm:justify-self-end">
                  <Botao
                    variante="secundario"
                    tamanho="sm"
                    icone={ArchiveRestore}
                    onClick={() => onRestoreClient(c)}
                    className="border-emerald-brand/40 text-emerald-bright hover:bg-emerald-brand/10"
                  >
                    Restaurar
                  </Botao>
                  {confirmDeleteId === c.id ? (
                    <>
                      <Botao variante="perigoFirme" tamanho="sm" onClick={() => confirmarExclusao(c)} disabled={excluindo}>
                        {excluindo ? "Excluindo..." : "Confirmar"}
                      </Botao>
                      <Botao variante="fantasma" tamanho="sm" onClick={() => setConfirmDeleteId(null)}>
                        Voltar
                      </Botao>
                    </>
                  ) : (
                    <Botao variante="perigo" tamanho="sm" icone={Trash2} onClick={() => setConfirmDeleteId(c.id)}>
                      Excluir
                    </Botao>
                  )}
                </div>
              </div>
            ))}

          {!loadingArchived && archivedClients.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-dim">Nenhum cliente arquivado.</p>
          )}
        </div>
      ) : (
        <>
          {mostrarForm && (
            <div className="mb-6 rounded-2xl border border-line bg-surface p-5 sm:p-7">
              <p className="text-sm font-medium text-ink">Novo cliente</p>
              <p className="mt-1 text-xs text-ink-dim">Cliente que fechou por fora do formulário.</p>

              <div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                {CAMPOS_NOVO_CLIENTE.map(({ key, label }) => (
                  <label key={key} className="block">
                    <RotuloCampo>{label}</RotuloCampo>
                    <input
                      value={novo[key]}
                      onChange={(e) => setNovo((n) => ({ ...n, [key]: e.target.value }))}
                      className={classeCampo()}
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Botao variante="primario" onClick={salvarNovoCliente} disabled={!novo.nome.trim() || salvando}>
                  Salvar e abrir cadastro
                </Botao>
                <Botao variante="fantasma" onClick={() => setMostrarForm(false)}>
                  Cancelar
                </Botao>
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-3">
            <FilterSelect label="Contrato" value={filters.contrato} options={FILTERS.contrato} onChange={(v) => setFilters((f) => ({ ...f, contrato: v }))} />
            <FilterSelect label="Boleto" value={filters.boleto} options={FILTERS.boleto} onChange={(v) => setFilters((f) => ({ ...f, boleto: v }))} />
            <FilterSelect label="Intensidade" value={filters.intensidade} options={FILTERS.intensidade} onChange={(v) => setFilters((f) => ({ ...f, intensidade: v }))} />
          </div>

          <ClientsTable clients={filteredAtivos} onOpenClient={onOpenClient} />
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-dim">Nenhum cliente encontrado com esses filtros.</p>
          )}

          {filteredCancelados.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-ink-muted">Cancelados ({filteredCancelados.length})</h2>
              <ClientsTable clients={filteredCancelados} onOpenClient={onOpenClient} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ClientsTable({ clients, onOpenClient }) {
  if (clients.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="hidden grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr_auto] gap-4 border-b border-line/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-ink-dim sm:grid">
        <span>Cliente</span>
        <span>Contrato</span>
        <span>Boleto</span>
        <span>Intensidade</span>
        <span>Saúde</span>
        <span />
      </div>

      {clients.map((c) => {
        const resumo = billingSummary(c);
        return (
          <button
            key={c.id}
            onClick={() => onOpenClient(c.id)}
            className={`grid w-full grid-cols-2 items-center gap-4 border-b border-line/40 px-5 py-4 text-left sm:py-5 transition-colors last:border-b-0 sm:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr_auto] ${
              c.canceladoEm ? "bg-flame/5 hover:bg-flame/10" : "hover:bg-surface-raised"
            }`}
          >
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm font-medium text-ink">{c.empresa || c.nome}</p>
              <p className="text-xs text-ink-dim">
                {c.empresa ? `${c.nome} · ` : ""}
                {c.cnpj || "CNPJ não informado"}
              </p>
            </div>
            <span className="justify-self-start"><StatusBadge status={c.contrato.status} context="contrato" /></span>
            <span className="justify-self-start">
              {resumo?.tipo === "boleto" && <StatusBadge status={resumo.boleto.status} />}
              {resumo?.tipo === "previsao" && <NextBillingBadge label={formatDateAbrev(resumo.data)} />}
              {!resumo && <span className="text-xs text-ink-dim">—</span>}
            </span>
            <span className="justify-self-start"><StatusBadge status={c.intensidade.status} /></span>
            <span className="justify-self-start"><StatusBadge status={`saude_${c.saude}`} /></span>
            <ChevronRight size={16} className="hidden text-ink-dim sm:block" />
          </button>
        );
      })}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-xs transition-colors focus-within:border-emerald-brand/70 focus-within:ring-2 focus-within:ring-emerald-brand/25">
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
