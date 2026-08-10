import { useState } from "react";
import { ArrowLeft, Building2, FileSignature, Wallet, TrendingUp, MessageCircle } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { billingAlertMessage, intensityAlertMessage } from "../lib/messageTemplates.js";
import { updateContractStatus, updateInvoiceStatus, saveIntensityCheck } from "../lib/adminApi.js";

const TABS = [
  { key: "dados", label: "Dados", icon: Building2 },
  { key: "contrato", label: "Contrato", icon: FileSignature },
  { key: "cobranca", label: "Cobrança", icon: Wallet },
  { key: "intensidade", label: "Intensidade", icon: TrendingUp },
];

export default function ClientDetail({ client, onUpdate, onBack }) {
  const [tab, setTab] = useState("dados");

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={16} /> Voltar para Clientes
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{client.nome}</h1>
          <p className="mt-1 text-sm text-ink-dim">{client.cnpj || "CNPJ não informado"}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={client.contrato.status} />
          <StatusBadge status={client.boleto.status} />
          <StatusBadge status={client.intensidade.status} />
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
      </div>
    </Panel>
  );
}

function ContratoTab({ client, onUpdate }) {
  async function setStatus(status) {
    onUpdate(client.id, { contrato: { ...client.contrato, status, assinadoEm: status === "assinado" ? new Date().toISOString().slice(0, 10) : null } });
    await updateContractStatus(client.id, status).catch(() => null);
  }

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Status do contrato (Clicksign)</p>
          <p className="mt-1 text-xs text-ink-dim">
            {client.contrato.status === "assinado" ? `Assinado em ${client.contrato.assinadoEm}` : "Aguardando assinatura do cliente"}
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
    </Panel>
  );
}

function CobrancaTab({ client, onUpdate }) {
  async function setStatus(status) {
    const boleto = { ...client.boleto, status };
    onUpdate(client.id, { boleto });
    await updateInvoiceStatus(client.id, boleto).catch(() => null);
  }

  const waLink = buildWhatsAppLink(client.telefone, billingAlertMessage(client, client.boleto));

  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Valor (R$)"
          value={client.boleto.valor}
          onChange={(v) => onUpdate(client.id, { boleto: { ...client.boleto, valor: Number(v) || 0 } })}
        />
        <TextField
          label="Vencimento"
          value={client.boleto.vencimento}
          onChange={(v) => onUpdate(client.id, { boleto: { ...client.boleto, vencimento: v } })}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["pendente", "atrasado", "pago"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              client.boleto.status === s ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
            }`}
          >
            {s === "pendente" ? "Pendente" : s === "atrasado" ? "Atrasado" : "Pago"}
          </button>
        ))}
      </div>

      {client.boleto.status === "atrasado" && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-5 py-3 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          <MessageCircle size={16} />
          Enviar alerta de boleto via WhatsApp
        </a>
      )}
    </Panel>
  );
}

function IntensidadeTab({ client, onUpdate }) {
  async function setStatus(status) {
    const intensidade = { ...client.intensidade, status, atualizadoEm: new Date().toISOString().slice(0, 10) };
    onUpdate(client.id, { intensidade });
    await saveIntensityCheck(client.id, intensidade).catch(() => null);
  }

  const waLink = buildWhatsAppLink(client.telefone, intensityAlertMessage(client));

  return (
    <Panel>
      <p className="text-xs text-ink-dim">
        Verificação manual por enquanto — a análise automática via Instagram entra em uma fase futura.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["ativo", "em_queda", "inativo"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              client.intensidade.status === s ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
            }`}
          >
            {s === "ativo" ? "Ativo" : s === "em_queda" ? "Em queda" : "Inativo"}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Observação da equipe</span>
          <textarea
            value={client.intensidade.observacao || ""}
            onChange={(e) => onUpdate(client.id, { intensidade: { ...client.intensidade, observacao: e.target.value } })}
            rows={3}
            className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
          />
        </label>
        <p className="mt-1.5 text-xs text-ink-dim">Última atualização: {client.intensidade.atualizadoEm}</p>
      </div>

      {client.intensidade.status !== "ativo" && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-brand px-5 py-3 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          <MessageCircle size={16} />
          Enviar mensagem via WhatsApp
        </a>
      )}
    </Panel>
  );
}
