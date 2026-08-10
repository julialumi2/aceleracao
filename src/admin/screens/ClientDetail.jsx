import { useState } from "react";
import { ArrowLeft, Building2, FileSignature, Wallet, TrendingUp, MessageCircle, Plus, UtensilsCrossed } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { billingAlertMessage, intensityAlertMessage } from "../lib/messageTemplates.js";
import { updateContractStatus, updateInvoiceStatus, saveIntensityCheck } from "../lib/adminApi.js";
import { sortByVencimento, currentInvoice } from "../lib/invoices.js";

const TABS = [
  { key: "dados", label: "Dados", icon: Building2 },
  { key: "contrato", label: "Contrato", icon: FileSignature },
  { key: "cobranca", label: "Cobrança", icon: Wallet },
  { key: "intensidade", label: "Intensidade", icon: TrendingUp },
];

const SAUDE_OPTIONS = [
  { value: "verde", label: "Rodando c/ resultado" },
  { value: "amarelo", label: "Rodando, sem resultado" },
  { value: "laranja", label: "Não iniciado" },
];

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function ClientDetail({ client, onUpdate, onBack }) {
  const [tab, setTab] = useState("dados");
  const boletoAtual = currentInvoice(client.boletos);

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> Voltar para Clientes
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">{client.nome}</h1>
          <p className="mt-1 text-sm text-ink-dim">{client.cnpj || "CNPJ não informado"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={client.contrato.status} />
          {boletoAtual && <StatusBadge status={boletoAtual.status} />}
          <StatusBadge status={client.intensidade.status} />
          <StatusBadge status={`saude_${client.saude}`} />
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
              tab === key ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {tab === "dados" && <DadosTab client={client} onUpdate={onUpdate} />}
      {tab === "contrato" && <ContratoTab client={client} onUpdate={onUpdate} />}
      {tab === "cobranca" && <CobrancaTab client={client} onUpdate={onUpdate} />}
      {tab === "intensidade" && <IntensidadeTab client={client} onUpdate={onUpdate} />}
    </div>
  );
}

function Panel({ children }) {
  return <div className="rounded-2xl border border-line bg-surface p-6">{children}</div>;
}

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
      />
    </label>
  );
}

function DadosTab({ client, onUpdate }) {
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nome" value={client.nome} onChange={(v) => onUpdate(client.id, { nome: v })} />
        <TextField label="CNPJ" value={client.cnpj} onChange={(v) => onUpdate(client.id, { cnpj: v })} />
        <TextField label="Telefone (WhatsApp)" value={client.telefone} onChange={(v) => onUpdate(client.id, { telefone: v })} />
        <TextField label="E-mail" value={client.email} onChange={(v) => onUpdate(client.id, { email: v })} />
        <TextField label="Endereço" value={client.endereco} onChange={(v) => onUpdate(client.id, { endereco: v })} />
        <TextField
          label="Link do cardápio"
          value={client.cardapioUrl}
          onChange={(v) => onUpdate(client.id, { cardapioUrl: v })}
        />
      </div>

      <div className="mt-6 border-t border-line/60 pt-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
          <UtensilsCrossed size={13} />
          Saúde da campanha
        </p>
        <div className="flex flex-wrap gap-2">
          {SAUDE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate(client.id, { saude: opt.value })}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                client.saude === opt.value ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ContratoTab({ client, onUpdate }) {
  async function setStatus(status) {
    const historico = [
      ...(client.contrato.historico || []),
      { id: `h-${Date.now()}`, data: new Date().toISOString().slice(0, 10), evento: status === "assinado" ? "Contrato assinado pelo cliente" : "Status marcado como pendente" },
    ];
    onUpdate(client.id, {
      contrato: { ...client.contrato, status, assinadoEm: status === "assinado" ? new Date().toISOString().slice(0, 10) : null, historico },
    });
    await updateContractStatus(client.id, status).catch(() => null);
  }

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Status do contrato (Clicksign)</p>
          <p className="mt-1 text-xs text-ink-dim">
            {client.contrato.status === "assinado" ? `Assinado em ${formatDate(client.contrato.assinadoEm)}` : "Aguardando assinatura do cliente"}
          </p>
        </div>
        <StatusBadge status={client.contrato.status} />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setStatus("pendente")}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            client.contrato.status === "pendente" ? "bg-amber-400/15 text-amber-300" : "border border-line text-ink-muted hover:text-ink"
          }`}
        >
          Marcar como pendente
        </button>
        <button
          onClick={() => setStatus("assinado")}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            client.contrato.status === "assinado" ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
          }`}
        >
          Marcar como assinado
        </button>
      </div>

      <div className="mt-5">
        <TextField
          label="Link do documento (Clicksign)"
          value={client.contrato.documentoUrl}
          onChange={(v) => onUpdate(client.id, { contrato: { ...client.contrato, documentoUrl: v } })}
        />
      </div>

      <div className="mt-6 border-t border-line/60 pt-5">
        <p className="mb-3 text-xs font-medium text-ink-muted">Histórico</p>
        <ul className="space-y-2">
          {[...(client.contrato.historico || [])].reverse().map((h) => (
            <li key={h.id} className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">{h.evento}</span>
              <span className="text-xs text-ink-dim">{formatDate(h.data)}</span>
            </li>
          ))}
          {(!client.contrato.historico || client.contrato.historico.length === 0) && (
            <li className="text-sm text-ink-dim">Sem eventos registrados.</li>
          )}
        </ul>
      </div>
    </Panel>
  );
}

function CobrancaTab({ client, onUpdate }) {
  const [novo, setNovo] = useState({ valor: "", vencimento: "" });
  const boletos = sortByVencimento(client.boletos || []);

  async function setStatus(boletoId, status) {
    const novosBoletos = client.boletos.map((b) => (b.id === boletoId ? { ...b, status } : b));
    onUpdate(client.id, { boletos: novosBoletos });
    const alvo = novosBoletos.find((b) => b.id === boletoId);
    await updateInvoiceStatus(client.id, alvo).catch(() => null);
  }

  function adicionarBoleto() {
    if (!novo.valor || !novo.vencimento) return;
    const boleto = { id: `b-${Date.now()}`, valor: Number(novo.valor) || 0, vencimento: novo.vencimento, status: "pendente", alertaEnviadoEm: null };
    onUpdate(client.id, { boletos: [...(client.boletos || []), boleto] });
    setNovo({ valor: "", vencimento: "" });
  }

  return (
    <Panel>
      <p className="mb-4 text-xs font-medium text-ink-muted">Boletos, do vencimento mais próximo ao mais distante</p>

      <div className="space-y-3">
        {boletos.map((b) => {
          const waLink = buildWhatsAppLink(client.telefone, billingAlertMessage(client, b));
          return (
            <div key={b.id} className="rounded-xl border border-line/60 bg-surface-raised p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-sm text-ink">R$ {b.valor.toFixed(2)}</span>
                  <span className="ml-2 text-xs text-ink-dim">vence {formatDate(b.vencimento)}</span>
                  {b.alertaEnviadoEm && <span className="ml-2 text-xs text-ink-dim">· alerta enviado {formatDate(b.alertaEnviadoEm)}</span>}
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {["pendente", "atrasado", "pago"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(b.id, s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      b.status === s ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
                    }`}
                  >
                    {s === "pendente" ? "Pendente" : s === "atrasado" ? "Atrasado" : "Pago"}
                  </button>
                ))}
                {b.status === "atrasado" && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-brand/40 px-3 py-1.5 text-xs font-medium text-emerald-bright transition-colors hover:bg-emerald-brand/10"
                  >
                    <MessageCircle size={12} />
                    Alertar
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {boletos.length === 0 && <p className="text-sm text-ink-dim">Nenhum boleto cadastrado ainda.</p>}
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-line/60 pt-5">
        <div className="min-w-[120px] flex-1">
          <TextField label="Novo boleto — valor (R$)" value={novo.valor} onChange={(v) => setNovo((n) => ({ ...n, valor: v }))} />
        </div>
        <div className="min-w-[140px] flex-1">
          <TextField label="Vencimento" value={novo.vencimento} onChange={(v) => setNovo((n) => ({ ...n, vencimento: v }))} />
        </div>
        <button
          onClick={adicionarBoleto}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-brand px-4 py-2.5 text-sm font-medium text-base transition-colors hover:bg-emerald-bright"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>
    </Panel>
  );
}

function IntensidadeTab({ client, onUpdate }) {
  const [observacaoNova, setObservacaoNova] = useState("");

  async function registrarChecagem(status) {
    const hoje = new Date().toISOString().slice(0, 10);
    const historico = [
      ...(client.intensidade.historico || []),
      { id: `i-${Date.now()}`, data: hoje, status, observacao: observacaoNova || client.intensidade.observacao, mensagemEnviada: false },
    ];
    const intensidade = { status, observacao: observacaoNova || client.intensidade.observacao, atualizadoEm: hoje, historico };
    onUpdate(client.id, { intensidade });
    setObservacaoNova("");
    await saveIntensityCheck(client.id, intensidade).catch(() => null);
  }

  function marcarMensagemEnviada() {
    const historico = [...(client.intensidade.historico || [])];
    if (historico.length > 0) {
      historico[historico.length - 1] = { ...historico[historico.length - 1], mensagemEnviada: true };
    }
    onUpdate(client.id, { intensidade: { ...client.intensidade, historico } });
  }

  const waLink = buildWhatsAppLink(client.telefone, intensityAlertMessage(client));

  return (
    <Panel>
      <p className="text-xs text-ink-dim">
        Verificação manual por enquanto — a análise automática via Instagram entra em uma fase futura.
      </p>

      <div className="mt-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Nova observação (opcional, antes de registrar)</span>
          <textarea
            value={observacaoNova}
            onChange={(e) => setObservacaoNova(e.target.value)}
            rows={2}
            placeholder={client.intensidade.observacao}
            className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {["ativo", "em_queda", "inativo"].map((s) => (
          <button
            key={s}
            onClick={() => registrarChecagem(s)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              client.intensidade.status === s ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
            }`}
          >
            Registrar como {s === "ativo" ? "Ativo" : s === "em_queda" ? "Em queda" : "Inativo"}
          </button>
        ))}
      </div>

      {client.intensidade.status !== "ativo" && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          onClick={marcarMensagemEnviada}
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-5 py-3 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          <MessageCircle size={16} />
          Enviar mensagem via WhatsApp
        </a>
      )}

      <div className="mt-6 border-t border-line/60 pt-5">
        <p className="mb-3 text-xs font-medium text-ink-muted">Histórico de verificações</p>
        <ul className="space-y-2">
          {[...(client.intensidade.historico || [])].reverse().map((h) => (
            <li key={h.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-ink-muted">{h.observacao}</span>
                {h.mensagemEnviada && <span className="ml-2 text-xs text-emerald-bright">· mensagem enviada</span>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={h.status} />
                <span className="text-xs text-ink-dim">{formatDate(h.data)}</span>
              </div>
            </li>
          ))}
          {(!client.intensidade.historico || client.intensidade.historico.length === 0) && (
            <li className="text-sm text-ink-dim">Sem verificações registradas.</li>
          )}
        </ul>
      </div>
    </Panel>
  );
}
