import { useState } from "react";
import { ArrowLeft, Building2, FileSignature, Wallet, TrendingUp, MessageCircle, Plus, UtensilsCrossed, CalendarClock, CheckCircle2, Archive, Pencil, Trash2 } from "lucide-react";
import StatusBadge, { NextBillingBadge } from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { billingAlertMessage, intensityAlertMessage } from "../lib/messageTemplates.js";
import { sortByVencimento, alertStage, ALERT_STAGE_LABELS, billingSummary } from "../lib/invoices.js";
import { calcularProximaCobranca, diaDoVencimento } from "../lib/recurringBilling.js";

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

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${MESES_ABREV[Number(m) - 1]}/${y}`;
}

export default function ClientDetail({ client, onBack, initialTab = "dados", ...handlers }) {
  const [tab, setTab] = useState(initialTab);
  const resumoCobranca = billingSummary(client);

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
          <StatusBadge status={client.contrato.status} context="contrato" />
          {resumoCobranca?.tipo === "boleto" && <StatusBadge status={resumoCobranca.boleto.status} />}
          {resumoCobranca?.tipo === "previsao" && <NextBillingBadge label={`Próximo boleto: ${formatDate(resumoCobranca.data)}`} />}
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

      {tab === "dados" && <DadosTab client={client} onUpdate={handlers.onUpdate} onArchiveClient={handlers.onArchiveClient} />}
      {tab === "contrato" && <ContratoTab client={client} {...handlers} />}
      {tab === "cobranca" && <CobrancaTab client={client} {...handlers} />}
      {tab === "intensidade" && <IntensidadeTab client={client} {...handlers} />}
    </div>
  );
}

function Panel({ children }) {
  return <div className="rounded-2xl border border-line bg-surface p-6">{children}</div>;
}

function TextField({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none ${
          type === "date" ? "[color-scheme:dark]" : ""
        }`}
      />
    </label>
  );
}

function DadosTab({ client, onUpdate, onArchiveClient }) {
  const [confirmArquivar, setConfirmArquivar] = useState(false);
  const [arquivando, setArquivando] = useState(false);

  async function arquivar() {
    if (arquivando) return;
    setArquivando(true);
    try {
      await onArchiveClient(client);
    } finally {
      setArquivando(false);
    }
  }

  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nome" value={client.nome} onChange={(v) => onUpdate(client.id, { nome: v })} />
        <TextField label="CNPJ" value={client.cnpj} onChange={(v) => onUpdate(client.id, { cnpj: v })} />
        <TextField label="Telefone (WhatsApp)" value={client.telefone} onChange={(v) => onUpdate(client.id, { telefone: v })} />
        <TextField label="E-mail" value={client.email} onChange={(v) => onUpdate(client.id, { email: v })} />
        <TextField label="CEP" value={client.cep} onChange={(v) => onUpdate(client.id, { cep: v })} />
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

      <div className="mt-6 border-t border-line/60 pt-5">
        <p className="mb-1 text-xs font-medium text-ink-muted">Arquivar cliente</p>
        <p className="mb-3 text-xs text-ink-dim">
          Remove esse cliente das listas ativas (Dashboard, Cobranças, Intensidade). O cadastro e todo o histórico continuam
          guardados e podem ser restaurados a qualquer momento em Clientes → Ver arquivados.
        </p>
        {confirmArquivar ? (
          <div className="flex items-center gap-3">
            <button
              onClick={arquivar}
              disabled={arquivando}
              className="rounded-xl bg-flame/15 px-4 py-2 text-xs font-semibold text-flame transition-colors hover:bg-flame/25 disabled:opacity-60"
            >
              Confirmar arquivamento
            </button>
            <button onClick={() => setConfirmArquivar(false)} className="text-xs text-ink-muted hover:text-ink">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmArquivar(true)}
            className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-flame/40 hover:text-flame"
          >
            <Archive size={13} /> Arquivar cliente
          </button>
        )}
      </div>
    </Panel>
  );
}

function ContratoTab({ client, onSetContractStatus, onSetContractDocumentUrl }) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">Status do contrato (Clicksign)</p>
          <p className="mt-1 text-xs text-ink-dim">
            {client.contrato.status === "assinado" ? `Assinado em ${formatDate(client.contrato.assinadoEm)}` : "Aguardando assinatura do cliente"}
          </p>
        </div>
        <StatusBadge status={client.contrato.status} context="contrato" />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => onSetContractStatus(client, "pendente")}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            client.contrato.status === "pendente" ? "bg-flame/15 text-flame" : "border border-line text-ink-muted hover:text-ink"
          }`}
        >
          Marcar como pendente
        </button>
        <button
          onClick={() => onSetContractStatus(client, "assinado")}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
            client.contrato.status === "assinado" ? "bg-green-400/15 text-green-300" : "border border-line text-ink-muted hover:text-ink"
          }`}
        >
          Marcar como assinado
        </button>
      </div>

      <div className="mt-5">
        <TextField
          label="Link do documento (Clicksign)"
          value={client.contrato.documentoUrl}
          onChange={(v) => onSetContractDocumentUrl(client, v)}
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

function CobrancaTab({ client, onAddInvoice, onSetInvoiceStatus, onMarkInvoiceAlertSent, onUpdateInvoice, onDeleteInvoice, onSetRecurringBilling }) {
  const [novo, setNovo] = useState({ valor: "", vencimento: "", asaasId: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const boletos = [...sortByVencimento(client.boletos || [])].reverse();

  async function adicionarBoleto() {
    if (!novo.valor || !novo.vencimento || salvando) return;
    setErro("");
    setSalvando(true);
    try {
      await onAddInvoice(client, { valor: Number(novo.valor) || 0, vencimento: novo.vencimento, asaasId: novo.asaasId || undefined });
      setNovo({ valor: "", vencimento: "", asaasId: "" });
    } catch (err) {
      setErro(err.message?.includes("duplicate") ? "Já existe um boleto com esse ID do Asaas." : err.message || "Não foi possível registrar. Tenta de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <RecurringBillingSetup client={client} onSetRecurringBilling={onSetRecurringBilling} />
    <Panel>
      <p className="mb-1 text-xs font-medium text-ink-muted">Histórico de boletos registrados, do vencimento mais recente ao mais antigo</p>
      <p className="mb-4 text-xs text-ink-dim">
        Só aparece aqui o que já foi registrado (pago manualmente ou sincronizado do Asaas) — a previsão da próxima cobrança, lá em cima, não conta como um boleto até ele existir de verdade.
      </p>

      <div className="space-y-3">
        {boletos.map((b) => (
          <BoletoCard
            key={b.id}
            client={client}
            boleto={b}
            onSetInvoiceStatus={onSetInvoiceStatus}
            onMarkInvoiceAlertSent={onMarkInvoiceAlertSent}
            onUpdateInvoice={onUpdateInvoice}
            onDeleteInvoice={onDeleteInvoice}
          />
        ))}
        {boletos.length === 0 && <p className="text-sm text-ink-dim">Nenhum boleto cadastrado ainda.</p>}
      </div>

      <div className="mt-5 border-t border-line/60 pt-5">
        <p className="mb-3 text-xs font-medium text-ink-muted">Registrar boleto já emitido no Asaas</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[120px] flex-1">
            <TextField label="Valor (R$)" value={novo.valor} onChange={(v) => setNovo((n) => ({ ...n, valor: v }))} />
          </div>
          <div className="min-w-[140px] flex-1">
            <TextField label="Vencimento" type="date" value={novo.vencimento} onChange={(v) => setNovo((n) => ({ ...n, vencimento: v }))} />
          </div>
          <button
            onClick={adicionarBoleto}
            disabled={salvando}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-brand px-4 py-2.5 text-sm font-medium text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
          >
            <Plus size={14} /> Registrar
          </button>
        </div>
        <div className="mt-3">
          <TextField
            label="ID do boleto no Asaas (opcional)"
            value={novo.asaasId}
            onChange={(v) => setNovo((n) => ({ ...n, asaasId: v }))}
          />
          <p className="mt-1 text-xs text-ink-dim">
            Se preencher, esse boleto atualiza sozinho quando o Asaas avisar que ele mudou de status — sem isso, um evento futuro
            pode criar uma linha duplicada em vez de atualizar essa aqui.
          </p>
        </div>
        <p className="mt-2 text-xs text-ink-dim">
          Só copia o valor e vencimento que já existem no Asaas — não gera boleto novo nem cobra o cliente.
        </p>
        {erro && <p className="mt-2 text-sm text-flame">{erro}</p>}
      </div>
    </Panel>
    </>
  );
}

function BoletoCard({ client, boleto: b, onSetInvoiceStatus, onMarkInvoiceAlertSent, onUpdateInvoice, onDeleteInvoice }) {
  const [editando, setEditando] = useState(false);
  const [confirmExcluir, setConfirmExcluir] = useState(false);
  const [form, setForm] = useState({ valor: String(b.valor), vencimento: b.vencimento, asaasId: b.asaasId || "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const stage = alertStage(b);
  const waLink = buildWhatsAppLink(client.telefone, billingAlertMessage(client, b, stage));

  async function salvarEdicao() {
    if (!form.valor || !form.vencimento || salvando) return;
    setErro("");
    setSalvando(true);
    try {
      await onUpdateInvoice(client, b.id, { valor: Number(form.valor) || 0, vencimento: form.vencimento, asaasId: form.asaasId || null });
      setEditando(false);
    } catch (err) {
      setErro(err.message?.includes("duplicate") ? "Já existe um boleto com esse ID do Asaas." : err.message || "Não foi possível salvar. Tenta de novo.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (salvando) return;
    setSalvando(true);
    try {
      await onDeleteInvoice(client, b.id);
    } finally {
      setSalvando(false);
    }
  }

  if (editando) {
    return (
      <div className="rounded-xl border border-line/60 bg-surface-raised p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Valor (R$)" value={form.valor} onChange={(v) => setForm((f) => ({ ...f, valor: v }))} />
          <TextField label="Vencimento" type="date" value={form.vencimento} onChange={(v) => setForm((f) => ({ ...f, vencimento: v }))} />
        </div>
        <div className="mt-3">
          <TextField label="ID do boleto no Asaas (opcional)" value={form.asaasId} onChange={(v) => setForm((f) => ({ ...f, asaasId: v }))} />
        </div>
        {erro && <p className="mt-2 text-sm text-flame">{erro}</p>}
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={salvarEdicao}
            disabled={salvando}
            className="rounded-full bg-emerald-brand px-4 py-1.5 text-xs font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
          >
            Salvar
          </button>
          <button onClick={() => setEditando(false)} className="text-xs text-ink-muted hover:text-ink">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line/60 bg-surface-raised p-4">
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
            onClick={() => onSetInvoiceStatus(client, b.id, s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              b.status === s ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
            }`}
          >
            {s === "pendente" ? "Pendente" : s === "atrasado" ? "Atrasado" : "Pago"}
          </button>
        ))}
        {stage && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => onMarkInvoiceAlertSent(client, b.id)}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-brand/40 px-3 py-1.5 text-xs font-medium text-emerald-bright transition-colors hover:bg-emerald-brand/10"
          >
            <MessageCircle size={12} />
            Alertar ({ALERT_STAGE_LABELS[stage].toLowerCase()})
          </a>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 border-t border-line/40 pt-2">
        <button
          onClick={() => setEditando(true)}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <Pencil size={12} /> Editar
        </button>
        {confirmExcluir ? (
          <div className="flex items-center gap-2">
            <button
              onClick={excluir}
              disabled={salvando}
              className="rounded-full bg-flame/15 px-3 py-1.5 text-xs font-semibold text-flame transition-colors hover:bg-flame/25 disabled:opacity-60"
            >
              Confirmar exclusão
            </button>
            <button onClick={() => setConfirmExcluir(false)} className="text-xs text-ink-muted hover:text-ink">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmExcluir(true)}
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-flame/40 hover:text-flame"
          >
            <Trash2 size={12} /> Excluir
          </button>
        )}
      </div>
    </div>
  );
}

function RecurringBillingSetup({ client, onSetRecurringBilling }) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modo, setModo] = useState("existente"); // "novo" | "existente"
  const [formNovo, setFormNovo] = useState({ valor: "", jaPago: "sim", data: new Date().toISOString().slice(0, 10) });
  const [formExistente, setFormExistente] = useState({ valor: "", diaVencimento: "", proximaCobrancaEm: "", asaasCustomerId: "", asaasSubscriptionId: "" });
  const [erro, setErro] = useState("");

  const configurado = client.cobrancaRecorrente?.valor != null;
  const preview = formNovo.data ? calcularProximaCobranca(formNovo.data, formNovo.jaPago === "sim") : null;

  async function salvarNovo() {
    if (!formNovo.valor || !formNovo.data || salvando) return;
    setErro("");
    setSalvando(true);
    try {
      const proximaCobrancaEm = calcularProximaCobranca(formNovo.data, formNovo.jaPago === "sim");
      await onSetRecurringBilling(client, {
        valor: Number(formNovo.valor) || 0,
        diaVencimento: diaDoVencimento(formNovo.data),
        proximaCobrancaEm,
      });
      setAberto(false);
    } catch (err) {
      setErro(err.message || "Não foi possível salvar. Tenta de novo.");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarExistente() {
    if (!formExistente.valor || !formExistente.diaVencimento || !formExistente.proximaCobrancaEm || salvando) return;
    setErro("");
    setSalvando(true);
    try {
      await onSetRecurringBilling(client, {
        valor: Number(formExistente.valor) || 0,
        diaVencimento: Number(formExistente.diaVencimento),
        proximaCobrancaEm: formExistente.proximaCobrancaEm,
        asaasCustomerId: formExistente.asaasCustomerId || undefined,
        asaasSubscriptionId: formExistente.asaasSubscriptionId || undefined,
      });
      setAberto(false);
    } catch (err) {
      setErro(err.message || "Não foi possível salvar. Tenta de novo.");
    } finally {
      setSalvando(false);
    }
  }

  if (configurado && !aberto) {
    return (
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <CheckCircle2 size={15} className="text-emerald-bright" />
              Cobrança recorrente configurada
            </p>
            <p className="mt-1 text-xs text-ink-dim">
              R$ {client.cobrancaRecorrente.valor.toFixed(2)}/mês, todo dia {client.cobrancaRecorrente.diaVencimento}
            </p>
            <p className="mt-2 text-xs text-ink-dim">
              <span className="font-medium text-ink-muted">Previsão</span> da próxima cobrança:{" "}
              <span className="text-ink">{formatDate(client.cobrancaRecorrente.proximaCobrancaEm)}</span>
              {(client.boletos || []).some((b) => b.vencimento === client.cobrancaRecorrente.proximaCobrancaEm) ? (
                " — já tem um boleto registrado pra essa data, veja na lista abaixo."
              ) : (
                <> — ainda <span className="font-medium">sem boleto registrado</span> pra essa data. Isto é só uma estimativa; não é um boleto de verdade.</>
              )}
            </p>
            <p className="mt-2 text-xs text-ink-dim">
              {client.cobrancaRecorrente.asaasSubscriptionId
                ? `Vinculada à assinatura ${client.cobrancaRecorrente.asaasSubscriptionId} no Asaas.`
                : "Aguardando integração com o Asaas — assinatura ainda não foi criada lá."}
            </p>
          </div>
          <button onClick={() => setAberto(true)} className="shrink-0 text-xs font-medium text-emerald-bright hover:underline">
            Editar
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
        <CalendarClock size={15} className="text-emerald-bright" />
        Configurar cobrança recorrente
      </p>

      <div className="mt-3 flex gap-1 rounded-xl border border-line bg-surface-raised p-1">
        <button
          type="button"
          onClick={() => setModo("existente")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
            modo === "existente" ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
          }`}
        >
          Já tem assinatura no Asaas
        </button>
        <button
          type="button"
          onClick={() => setModo("novo")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
            modo === "novo" ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
          }`}
        >
          Cliente novo
        </button>
      </div>

      {modo === "existente" ? (
        <>
          <p className="mt-3 text-xs text-ink-dim">
            Cliente que já paga vocês — só registra o que já existe no Asaas, sem criar nada novo (evita duplicar a cobrança).
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Valor recorrente (R$)" value={formExistente.valor} onChange={(v) => setFormExistente((f) => ({ ...f, valor: v }))} />
            <TextField label="Dia de vencimento (1–31)" value={formExistente.diaVencimento} onChange={(v) => setFormExistente((f) => ({ ...f, diaVencimento: v }))} />
          </div>
          <div className="mt-4">
            <TextField
              label="Próxima cobrança prevista"
              type="date"
              value={formExistente.proximaCobrancaEm}
              onChange={(v) => setFormExistente((f) => ({ ...f, proximaCobrancaEm: v }))}
            />
            <p className="mt-1 text-xs text-ink-dim">Confere no painel do Asaas — "Data do próximo vencimento" da assinatura.</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="ID do cliente no Asaas" value={formExistente.asaasCustomerId} onChange={(v) => setFormExistente((f) => ({ ...f, asaasCustomerId: v }))} />
            <TextField label="ID da assinatura no Asaas" value={formExistente.asaasSubscriptionId} onChange={(v) => setFormExistente((f) => ({ ...f, asaasSubscriptionId: v }))} />
          </div>

          {erro && <p className="mt-3 text-sm text-flame">{erro}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={salvarExistente}
              disabled={salvando || !formExistente.valor || !formExistente.diaVencimento || !formExistente.proximaCobrancaEm}
              className="rounded-xl bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              Salvar
            </button>
            {configurado && (
              <button onClick={() => setAberto(false)} className="text-sm text-ink-muted hover:text-ink">
                Cancelar
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-xs text-ink-dim">
            Preço combinado com esse cliente — define o valor e o dia de vencimento da mensalidade.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Valor recorrente (R$)" value={formNovo.valor} onChange={(v) => setFormNovo((f) => ({ ...f, valor: v }))} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Já pagou a 1ª parcela?</span>
              <div className="flex gap-2">
                {[
                  ["sim", "Sim"],
                  ["nao", "Não"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormNovo((f) => ({ ...f, jaPago: value }))}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                      formNovo.jaPago === value ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="mt-4">
            <TextField
              label={formNovo.jaPago === "sim" ? "Data em que pagou" : "Data prevista pra pagar"}
              type="date"
              value={formNovo.data}
              onChange={(v) => setFormNovo((f) => ({ ...f, data: v }))}
            />
          </div>

          {preview && (
            <p className="mt-3 text-xs text-ink-dim">
              Próxima cobrança da recorrência: <span className="text-ink">{formatDate(preview)}</span>, todo dia {diaDoVencimento(formNovo.data)}
            </p>
          )}

          {erro && <p className="mt-3 text-sm text-flame">{erro}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={salvarNovo}
              disabled={salvando || !formNovo.valor || !formNovo.data}
              className="rounded-xl bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              Salvar
            </button>
            {configurado && (
              <button onClick={() => setAberto(false)} className="text-sm text-ink-muted hover:text-ink">
                Cancelar
              </button>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

function IntensidadeTab({ client, onAddIntensityCheck, onMarkIntensityMessageSent }) {
  const [observacaoNova, setObservacaoNova] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function registrarChecagem(status) {
    if (salvando) return;
    setSalvando(true);
    try {
      await onAddIntensityCheck(client, { status, observacao: observacaoNova || client.intensidade.observacao });
      setObservacaoNova("");
    } finally {
      setSalvando(false);
    }
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
            disabled={salvando}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
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
          onClick={() => onMarkIntensityMessageSent(client)}
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
