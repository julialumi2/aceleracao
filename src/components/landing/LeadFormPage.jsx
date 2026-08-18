import { useState } from "react";
import { Flame, ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { submitPublicLead } from "../../lib/publicLeads.js";
import StepShell from "../shared/StepShell.jsx";

const WHATSAPP_COMERCIAL = "5515991933737";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(
  "Olá! Vim pelo site e quero saber mais sobre a Aceleração de Delivery."
)}`;

const FATURAMENTO_OPTIONS = [
  "Até R$ 10 mil",
  "R$ 10 mil a R$ 30 mil",
  "R$ 30 mil a R$ 60 mil",
  "Acima de R$ 60 mil",
];

const GARGALO_OPTIONS = [
  "Sinto que poderia escalar mais",
  "Cardápio pouco otimizado",
  "Pouca visibilidade nas redes sociais",
  "Operação do dia a dia (tempo, equipe)",
  "Não sei dizer ao certo",
];

const GESTOR_TRAFEGO_OPTIONS = [
  "Não tenho gestor de tráfego",
  "Tenho, mas não estou satisfeito com o resultado",
  "Tenho e estou satisfeito",
];

const MENSAGEM_MAX = 300;

const CAMPOS_INICIAIS = {
  nome: "",
  telefone: "",
  nomeNegocio: "",
  faturamentoMensal: "",
  maiorGargalo: "",
  gestorTrafego: "",
  mensagem: "",
};

function Field({ label, helper, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-bright">{label}</span>
      {helper && <span className="mb-3 block text-xs text-ink-dim">{helper}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-3 text-sm text-ink placeholder:text-ink-dim focus:border-emerald-brand/60 focus:outline-none"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-bright">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-3 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
      >
        <option value="" className="bg-surface text-ink-dim">Selecione</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface text-ink">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function LeadFormPage() {
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [passo, setPasso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function set(campo, valor) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  async function enviar() {
    setErro("");
    setEnviando(true);
    try {
      const origemParam = new URLSearchParams(window.location.search).get("origem");
      await submitPublicLead({ ...campos, origem: origemParam || "bio_instagram" });
      setEnviado(true);
    } catch (err) {
      setErro("Não foi possível enviar agora. Tenta de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  const passos = [
    {
      categoria: "Sobre você",
      podeContinuar: campos.nome.trim().length > 0,
      campo: (
        <Field label="Nome completo" value={campos.nome} onChange={(v) => set("nome", v)} placeholder="Seu nome" />
      ),
    },
    {
      categoria: "Sobre você",
      podeContinuar: campos.telefone.trim().length > 0,
      campo: (
        <Field
          label="WhatsApp"
          helper="É por aqui que a gente entra em contato"
          type="tel"
          value={campos.telefone}
          onChange={(v) => set("telefone", v)}
          placeholder="(15) 99999-0000"
        />
      ),
    },
    {
      categoria: "Seu negócio",
      podeContinuar: true,
      campo: (
        <Field
          label="Nome do negócio"
          value={campos.nomeNegocio}
          onChange={(v) => set("nomeNegocio", v)}
          placeholder="Ex: Burger do João"
        />
      ),
    },
    {
      categoria: "Seu negócio",
      podeContinuar: true,
      campo: (
        <Select
          label="Faturamento mensal atual"
          value={campos.faturamentoMensal}
          onChange={(v) => set("faturamentoMensal", v)}
          options={FATURAMENTO_OPTIONS}
        />
      ),
    },
    {
      categoria: "Seu negócio",
      podeContinuar: true,
      campo: (
        <Select
          label="Maior gargalo hoje"
          value={campos.maiorGargalo}
          onChange={(v) => set("maiorGargalo", v)}
          options={GARGALO_OPTIONS}
        />
      ),
    },
    {
      categoria: "Seu negócio",
      podeContinuar: true,
      campo: (
        <Select
          label="Já tem um gestor de tráfego? Está contente com o resultado?"
          value={campos.gestorTrafego}
          onChange={(v) => set("gestorTrafego", v)}
          options={GESTOR_TRAFEGO_OPTIONS}
        />
      ),
    },
    {
      categoria: "Mais detalhes",
      podeContinuar: true,
      campo: (
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-emerald-bright">
            Mensagem (opcional)
          </span>
          <textarea
            value={campos.mensagem}
            onChange={(e) => set("mensagem", e.target.value.slice(0, MENSAGEM_MAX))}
            rows={3}
            className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-3 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
          />
          <span className="mt-1.5 block text-right text-xs text-ink-dim">
            {campos.mensagem.length}/{MENSAGEM_MAX}
          </span>
        </label>
      ),
    },
  ];

  const passoAtual = passos[passo];
  const noUltimoPasso = passo === passos.length - 1;

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
        <a href="/" className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
          <ArrowLeft size={16} /> Voltar
        </a>

        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={18} strokeWidth={2} />
          </span>
          <span className="font-display text-lg tracking-wide text-ink">Aceleração Delivery</span>
        </div>

        {enviado ? (
          <div className="rounded-2xl border border-emerald-brand/40 bg-surface p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-bright" />
            <h1 className="mt-4 font-display text-2xl tracking-wide text-ink">Recebemos seu contato!</h1>
            <p className="mt-3 text-sm text-ink-muted">
              Nossa equipe vai chamar você no WhatsApp em breve pra entender melhor o seu momento.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Voltar para o site
            </a>
          </div>
        ) : (
          <>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-bright">Mentoria</span>
            <h1 className="mt-1 text-balance font-display text-2xl leading-tight tracking-wide text-ink md:text-3xl">
              Aceleração de Delivery
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Toda semana um dono de delivery some do próprio faturamento — trabalhando 14h por dia sem saber pra onde
              vai o dinheiro. <span className="font-semibold text-ink">Responda algumas perguntas rápidas</span> e
              entramos em contato pelo WhatsApp pra entender se a mentoria faz sentido pro seu momento.
            </p>

            <div className="mt-7">
              <StepShell
                categoria={passoAtual.categoria}
                passoAtual={passo + 1}
                totalPassos={passos.length}
                podeVoltar={passo > 0}
                onVoltar={() => setPasso((p) => p - 1)}
                podeContinuar={passoAtual.podeContinuar}
                rotuloContinuar={noUltimoPasso ? "Quero acelerar meu delivery" : "Continuar"}
                enviando={enviando}
                erro={erro}
                onSubmit={continuar}
              >
                {passoAtual.campo}
              </StepShell>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-medium text-ink-muted transition-colors hover:border-emerald-brand/40 hover:text-ink"
              >
                <MessageCircle size={16} />
                Prefere falar direto? Chama no WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
