import { useState } from "react";
import { Flame, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { maskCNPJ, maskCEP, maskPhone } from "../../lib/masks.js";
import { submitPublicOnboarding } from "../../lib/publicOnboarding.js";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const CAMPOS_INICIAIS = {
  nome: "",
  empresa: "",
  telefone: "",
  email: "",
  cnpj: "",
  endereco: "",
  cep: "",
  banco: "",
  agencia: "",
  conta: "",
  diasFuncionamento: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  horarioAbertura: "18:00",
  horarioFechamento: "23:00",
};

function Field({ label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-bright">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-3 text-sm text-ink placeholder:text-ink-dim [color-scheme:dark] focus:border-emerald-brand/60 focus:outline-none"
      />
    </label>
  );
}

export default function OnboardingFormPage() {
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function set(campo, valor) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  function toggleDay(day) {
    setCampos((c) => ({
      ...c,
      diasFuncionamento: c.diasFuncionamento.includes(day)
        ? c.diasFuncionamento.filter((d) => d !== day)
        : [...c.diasFuncionamento, day],
    }));
  }

  async function enviar() {
    if (!campos.nome.trim() || !campos.empresa.trim() || enviando) return;
    setErro("");
    setEnviando(true);
    try {
      await submitPublicOnboarding(campos);
      setEnviado(true);
    } catch (err) {
      setErro("Não foi possível enviar agora. Tenta de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />

      <div className="relative mx-auto flex max-w-xl flex-col px-6 py-12 md:py-20">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-lg tracking-wide text-ink">Aceleração Delivery</span>
        </div>

        {enviado ? (
          <div className="rounded-2xl border border-emerald-brand/40 bg-surface p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-bright" />
            <h1 className="mt-4 font-display text-2xl tracking-wide text-ink">Bem-vindo(a) à Aceleração Delivery!</h1>
            <p className="mt-3 text-sm text-ink-muted">
              Recebemos seus dados. Nossa equipe já vai dar sequência ao contrato e à configuração da sua conta.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-bright">Bem-vindo(a)</span>
            <h1 className="mt-1 text-balance font-display text-2xl tracking-wide text-ink md:text-3xl">
              Vamos configurar sua conta
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Que bom ter você com a gente! Preencha os dados abaixo pra já deixarmos tudo pronto — contrato, cobrança
              e o resto do acompanhamento.
            </p>

            <div className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nome do responsável" value={campos.nome} onChange={(v) => set("nome", v)} placeholder="Seu nome" />
                <Field label="Nome da empresa" value={campos.empresa} onChange={(v) => set("empresa", v)} placeholder="Ex: Burger do João" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="WhatsApp (com DDD)"
                  value={campos.telefone}
                  onChange={(v) => set("telefone", maskPhone(v))}
                  placeholder="(15) 99999-0000"
                />
                <Field label="E-mail" type="email" value={campos.email} onChange={(v) => set("email", v)} placeholder="voce@email.com" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="CNPJ" value={campos.cnpj} onChange={(v) => set("cnpj", maskCNPJ(v))} placeholder="00.000.000/0000-00" />
                <Field label="CEP" value={campos.cep} onChange={(v) => set("cep", maskCEP(v))} placeholder="00000-000" />
              </div>

              <Field label="Endereço" value={campos.endereco} onChange={(v) => set("endereco", v)} placeholder="Rua, número, bairro, cidade" />

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Banco" value={campos.banco} onChange={(v) => set("banco", v)} placeholder="Ex: Nubank" />
                <Field label="Agência" value={campos.agencia} onChange={(v) => set("agencia", v)} placeholder="0000" />
                <Field label="Conta / Chave PIX" value={campos.conta} onChange={(v) => set("conta", v)} placeholder="CPF, e-mail, telefone..." />
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-bright">
                  Dias de funcionamento
                </span>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const isActive = campos.diasFuncionamento.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`h-10 w-12 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? "bg-emerald-brand text-base" : "border border-line text-ink-muted hover:border-emerald-brand/50"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Horário de abertura" type="time" value={campos.horarioAbertura} onChange={(v) => set("horarioAbertura", v)} />
                <Field label="Horário de fechamento" type="time" value={campos.horarioFechamento} onChange={(v) => set("horarioFechamento", v)} />
              </div>

              {erro && <p className="text-sm text-flame">{erro}</p>}

              <button
                onClick={enviar}
                disabled={!campos.nome.trim() || !campos.empresa.trim() || enviando}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-emerald-brand px-7 py-3.5 text-sm font-semibold text-base shadow-lg shadow-emerald-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-bright disabled:translate-y-0 disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Concluir cadastro"}
                {!enviando && (
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
