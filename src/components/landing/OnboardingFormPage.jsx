import { useState } from "react";
import { Flame, ArrowLeft, CheckCircle2 } from "lucide-react";
import { maskCNPJ, maskCEP, maskPhone } from "../../lib/masks.js";
import { submitPublicOnboarding } from "../../lib/publicOnboarding.js";
import StepShell from "../shared/StepShell.jsx";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const CAMPOS_INICIAIS = {
  nome: "",
  empresa: "",
  telefone: "",
  email: "",
  cnpj: "",
  endereco: "",
  cidade: "",
  cep: "",
  banco: "",
  agencia: "",
  conta: "",
  diasFuncionamento: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  horarioAbertura: "18:00",
  horarioFechamento: "23:00",
  horarioAberturaFds: "18:00",
  horarioFechamentoFds: "23:00",
};

function Field({ label, helper, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-bright">{label}</span>
      {helper && <span className="mb-3 block text-xs text-ink-dim">{helper}</span>}
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

export default function OnboardingFormPage({ onBack }) {
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [horarioDiferenteFds, setHorarioDiferenteFds] = useState(false);
  const [passo, setPasso] = useState(0);
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
    setErro("");
    setEnviando(true);
    try {
      await submitPublicOnboarding({
        ...campos,
        horarioAberturaFds: horarioDiferenteFds ? campos.horarioAberturaFds : "",
        horarioFechamentoFds: horarioDiferenteFds ? campos.horarioFechamentoFds : "",
      });
      setEnviado(true);
    } catch (err) {
      setErro("Não foi possível enviar agora. Tenta de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const passos = [
    {
      categoria: "Responsável",
      podeContinuar: campos.nome.trim().length > 0,
      campo: <Field label="Nome do responsável" value={campos.nome} onChange={(v) => set("nome", v)} placeholder="Seu nome" />,
    },
    {
      categoria: "Responsável",
      podeContinuar: true,
      campo: (
        <Field
          label="WhatsApp (com DDD)"
          type="tel"
          value={campos.telefone}
          onChange={(v) => set("telefone", maskPhone(v))}
          placeholder="(15) 99999-0000"
        />
      ),
    },
    {
      categoria: "Responsável",
      podeContinuar: true,
      campo: <Field label="E-mail" type="email" value={campos.email} onChange={(v) => set("email", v)} placeholder="voce@email.com" />,
    },
    {
      categoria: "Empresa",
      podeContinuar: campos.empresa.trim().length > 0,
      campo: <Field label="Nome da empresa" value={campos.empresa} onChange={(v) => set("empresa", v)} placeholder="Ex: Burger do João" />,
    },
    {
      categoria: "Empresa",
      podeContinuar: true,
      campo: <Field label="CNPJ" value={campos.cnpj} onChange={(v) => set("cnpj", maskCNPJ(v))} placeholder="00.000.000/0000-00" />,
    },
    {
      categoria: "Empresa",
      podeContinuar: true,
      campo: <Field label="Endereço" value={campos.endereco} onChange={(v) => set("endereco", v)} placeholder="Rua, número, bairro" />,
    },
    {
      categoria: "Empresa",
      podeContinuar: true,
      campo: <Field label="Cidade" value={campos.cidade} onChange={(v) => set("cidade", v)} placeholder="Sua cidade" />,
    },
    {
      categoria: "Empresa",
      podeContinuar: true,
      campo: <Field label="CEP" value={campos.cep} onChange={(v) => set("cep", maskCEP(v))} placeholder="00000-000" />,
    },
    {
      categoria: "Dados bancários",
      podeContinuar: true,
      campo: <Field label="Banco" value={campos.banco} onChange={(v) => set("banco", v)} placeholder="Ex: Nubank" />,
    },
    {
      categoria: "Dados bancários",
      podeContinuar: true,
      campo: <Field label="Agência" value={campos.agencia} onChange={(v) => set("agencia", v)} placeholder="0000" />,
    },
    {
      categoria: "Dados bancários",
      podeContinuar: true,
      campo: (
        <Field
          label="Conta / Chave PIX"
          value={campos.conta}
          onChange={(v) => set("conta", v)}
          placeholder="CPF, e-mail, telefone..."
        />
      ),
    },
    {
      categoria: "Funcionamento",
      podeContinuar: campos.diasFuncionamento.length > 0,
      campo: (
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
      ),
    },
    {
      categoria: "Funcionamento",
      podeContinuar: true,
      campo: (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Horário de abertura" type="time" value={campos.horarioAbertura} onChange={(v) => set("horarioAbertura", v)} />
          <Field label="Horário de fechamento" type="time" value={campos.horarioFechamento} onChange={(v) => set("horarioFechamento", v)} />
        </div>
      ),
    },
    {
      categoria: "Funcionamento",
      podeContinuar: true,
      campo: (
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={horarioDiferenteFds}
            onChange={(e) => setHorarioDiferenteFds(e.target.checked)}
            className="h-4 w-4 rounded border-line bg-surface-raised accent-emerald-brand"
          />
          <span className="text-sm text-ink-muted">Funciona em horário diferente no fim de semana?</span>
        </label>
      ),
    },
    ...(horarioDiferenteFds
      ? [
          {
            categoria: "Funcionamento",
            podeContinuar: true,
            campo: (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Abertura (fim de semana)"
                  type="time"
                  value={campos.horarioAberturaFds}
                  onChange={(v) => set("horarioAberturaFds", v)}
                />
                <Field
                  label="Fechamento (fim de semana)"
                  type="time"
                  value={campos.horarioFechamentoFds}
                  onChange={(v) => set("horarioFechamentoFds", v)}
                />
              </div>
            ),
          },
        ]
      : []),
  ];

  const passoSeguro = Math.min(passo, passos.length - 1);
  const passoAtual = passos[passoSeguro];
  const noUltimoPasso = passoSeguro === passos.length - 1;

  function continuar() {
    if (noUltimoPasso) {
      enviar();
    } else {
      setPasso((p) => p + 1);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />

      <div className="relative mx-auto flex max-w-xl flex-col px-6 py-12 md:py-20">
        <div className="mb-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
              <Flame size={18} strokeWidth={2} />
            </span>
            <span className="font-display text-lg tracking-wide text-ink">Aceleração Delivery</span>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}
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
          <>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-bright">Bem-vindo(a)</span>
            <h1 className="mt-1 text-balance font-display text-2xl tracking-wide text-ink md:text-3xl">
              Vamos configurar sua conta
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Que bom ter você com a gente! Responda as perguntas abaixo pra já deixarmos tudo pronto — contrato,
              cobrança e o resto do acompanhamento.
            </p>

            <div className="mt-7">
              <StepShell
                categoria={passoAtual.categoria}
                passoAtual={passoSeguro + 1}
                totalPassos={passos.length}
                podeVoltar={passoSeguro > 0}
                onVoltar={() => setPasso((p) => p - 1)}
                podeContinuar={passoAtual.podeContinuar}
                rotuloContinuar={noUltimoPasso ? "Concluir cadastro" : "Continuar"}
                enviando={enviando}
                erro={erro}
                onSubmit={continuar}
              >
                {passoAtual.campo}
              </StepShell>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
