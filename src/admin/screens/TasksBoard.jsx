import { useState } from "react";
import { Plus, Circle, Clock, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";

const COLUNAS = [
  { status: "a_fazer", label: "A Fazer", icon: Circle, accent: "text-sky-300 border-sky-400/40" },
  { status: "em_andamento", label: "Em Andamento", icon: Clock, accent: "text-amber-300 border-amber-400/40" },
  { status: "feito", label: "Feito", icon: CheckCircle2, accent: "text-green-300 border-green-400/40" },
];

const PRIORIDADES = ["urgente", "alta", "media", "baixa"];

const PRIORIDADE_LABELS = { urgente: "Urgente", alta: "Alta", media: "Média", baixa: "Baixa" };

function formatPrazo(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function TasksBoard({ tasks, clients, leads, onCreateTask, onUpdateTaskStatus, onDeleteTask, onOpenClient }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    prioridade: "media",
    prazo: "",
    vinculoTipo: "nenhum",
    vinculoId: "",
  });

  async function salvarNovaTarefa() {
    if (!novo.titulo.trim() || salvando) return;
    setSalvando(true);
    try {
      await onCreateTask({
        titulo: novo.titulo,
        descricao: novo.descricao,
        categoria: novo.categoria,
        prioridade: novo.prioridade,
        prazo: novo.prazo || null,
        restaurantId: novo.vinculoTipo === "cliente" ? novo.vinculoId || null : null,
        leadId: novo.vinculoTipo === "lead" ? novo.vinculoId || null : null,
      });
      setNovo({ titulo: "", descricao: "", categoria: "", prioridade: "media", prazo: "", vinculoTipo: "nenhum", vinculoId: "" });
      setMostrarForm(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">Tarefas</h1>
          <p className="mt-1 text-sm text-ink-muted">Quadro de tarefas da equipe, organizado por status.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-brand px-4 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          <Plus size={15} />
          Nova Tarefa
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm font-medium text-ink">Nova tarefa</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Título</span>
              <input
                value={novo.titulo}
                onChange={(e) => setNovo((n) => ({ ...n, titulo: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Descrição</span>
              <textarea
                value={novo.descricao}
                onChange={(e) => setNovo((n) => ({ ...n, descricao: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Categoria</span>
              <input
                value={novo.categoria}
                onChange={(e) => setNovo((n) => ({ ...n, categoria: e.target.value }))}
                placeholder="Ex: Cardápio, Limpeza..."
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Prazo</span>
              <input
                type="date"
                value={novo.prazo}
                onChange={(e) => setNovo((n) => ({ ...n, prazo: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink [color-scheme:dark] focus:border-emerald-brand/60 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Prioridade</span>
            <div className="flex flex-wrap gap-2">
              {PRIORIDADES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNovo((n) => ({ ...n, prioridade: p }))}
                  className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                    novo.prioridade === p ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
                  }`}
                >
                  {PRIORIDADE_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Vincular a</span>
              <select
                value={novo.vinculoTipo}
                onChange={(e) => setNovo((n) => ({ ...n, vinculoTipo: e.target.value, vinculoId: "" }))}
                className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
              >
                <option value="nenhum" className="bg-surface text-ink">Nenhum</option>
                <option value="cliente" className="bg-surface text-ink">Cliente</option>
                <option value="lead" className="bg-surface text-ink">Lead</option>
              </select>
            </label>
            {novo.vinculoTipo !== "nenhum" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                  {novo.vinculoTipo === "cliente" ? "Cliente" : "Lead"}
                </span>
                <select
                  value={novo.vinculoId}
                  onChange={(e) => setNovo((n) => ({ ...n, vinculoId: e.target.value }))}
                  className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
                >
                  <option value="" className="bg-surface text-ink">Selecione...</option>
                  {(novo.vinculoTipo === "cliente" ? clients : leads).map((item) => (
                    <option key={item.id} value={item.id} className="bg-surface text-ink">
                      {item.empresa || item.nome}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={salvarNovaTarefa}
              disabled={!novo.titulo.trim() || salvando}
              className="rounded-xl bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              Salvar tarefa
            </button>
            <button onClick={() => setMostrarForm(false)} className="text-sm text-ink-muted hover:text-ink">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {COLUNAS.map((coluna) => {
          const tarefasColuna = tasks.filter((t) => t.status === coluna.status);
          return (
            <div key={coluna.status} className="rounded-2xl border border-line bg-surface p-4">
              <div className={`mb-4 flex items-center justify-between border-b pb-3 ${coluna.accent}`}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <coluna.icon size={15} />
                  {coluna.label}
                </span>
                <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-ink-dim">{tarefasColuna.length}</span>
              </div>

              <div className="space-y-3">
                {tarefasColuna.map((t) => (
                  <TaskCard key={t.id} task={t} onUpdateTaskStatus={onUpdateTaskStatus} onDeleteTask={onDeleteTask} onOpenClient={onOpenClient} />
                ))}
                {tarefasColuna.length === 0 && <p className="text-xs text-ink-dim">Nenhuma tarefa aqui.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdateTaskStatus, onDeleteTask, onOpenClient }) {
  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const outrasColunas = COLUNAS.filter((c) => c.status !== task.status);
  const prazoFormatado = formatPrazo(task.prazo);
  const vinculo = task.cliente || task.lead;

  return (
    <div className="rounded-xl border border-line/60 bg-surface-raised p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink">{task.titulo}</p>
        <StatusBadge status={task.prioridade} context="prioridade" />
      </div>

      {task.descricao && <p className="mt-1.5 text-xs text-ink-muted">{task.descricao}</p>}

      {(task.categoria || prazoFormatado || vinculo) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-dim">
          {task.categoria && <span>{task.categoria}</span>}
          {task.categoria && prazoFormatado && <span>·</span>}
          {prazoFormatado && <span>{prazoFormatado}</span>}
          {vinculo && (
            <button
              onClick={() => task.cliente && onOpenClient(task.cliente.id)}
              className={`rounded-full border border-line px-2 py-0.5 ${task.cliente ? "hover:border-emerald-brand/40 hover:text-emerald-bright" : ""}`}
            >
              {vinculo.nome}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/40 pt-2.5">
        <div className="flex flex-wrap gap-1.5">
          {outrasColunas.map((c) => (
            <button
              key={c.status}
              onClick={() => onUpdateTaskStatus(task, c.status)}
              className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowRight size={10} />
              {c.label}
            </button>
          ))}
        </div>
        {confirmExcluir ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteTask(task)}
              className="rounded-full bg-flame/15 px-2.5 py-1 text-[11px] font-semibold text-flame transition-colors hover:bg-flame/25"
            >
              Confirmar
            </button>
            <button onClick={() => setConfirmExcluir(false)} className="text-[11px] text-ink-muted hover:text-ink">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmExcluir(true)} className="text-ink-dim transition-colors hover:text-flame">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
