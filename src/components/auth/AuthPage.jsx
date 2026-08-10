import { useState } from "react";
import { Flame, ArrowLeft, Mail, Lock, User, Loader2, Building2, Landmark, Clock3 } from "lucide-react";
import { signInWithEmail, signUpWithEmail, saveRestaurantProfile } from "../../lib/supabase.js";
import { maskCNPJ, maskCEP } from "../../lib/masks.js";
import Sparks from "../shared/Sparks.jsx";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
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

export default function AuthPage({ initialMode = "login", onAuthenticated, onBackToLanding }) {
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      diasFuncionamento: f.diasFuncionamento.includes(day)
        ? f.diasFuncionamento.filter((d) => d !== day)
        : [...f.diasFuncionamento, day],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Chamadas prontas para o Supabase local (http://localhost:54321).
      // Sem instância rodando, cai no fallback simulado abaixo.
      if (isLogin) {
        await signInWithEmail({ email: form.email, password: form.password }).catch(() => null);
      } else {
        await signUpWithEmail(form).catch(() => null);
        // Grava os dados do restaurante já na criação da conta, para
        // deixar tudo pronto quando formos ajustar o cardápio depois.
        await saveRestaurantProfile({
          nome: form.name,
          cnpj: form.cnpj,
          endereco: form.endereco,
          cep: form.cep,
          banco: form.banco,
          agencia: form.agencia,
          conta: form.conta,
          diasFuncionamento: form.diasFuncionamento,
          horarioAbertura: form.horarioAbertura,
          horarioFechamento: form.horarioFechamento,
        }).catch(() => null);
      }
      onAuthenticated({ name: form.name || form.email.split("@")[0], email: form.email });
    } catch (err) {
      setError(err.message || "Não foi possível concluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-base text-ink lg:grid-cols-2">
      {/* Lado visual */}
      <div className="relative hidden overflow-hidden border-r border-line/60 bg-surface/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 animate-ring-pulse ring-motif" />
        <Sparks />

        <button
          onClick={onBackToLanding}
          className="relative z-10 flex w-fit items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} /> Voltar ao site
        </button>

        <div className="relative z-10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={22} />
          </span>
          <h2 className="mt-8 max-w-sm text-balance font-display text-3xl font-bold leading-tight tracking-wide text-ink">
            Cada mesa cheia começa com um plano no papel.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            Acesse sua área do cliente para acompanhar cardápio, indicadores e contratos
            em um só lugar.
          </p>
        </div>

        <p className="relative z-10 text-xs text-ink-dim">Aceleração Delivery © {new Date().getFullYear()}</p>
      </div>

      {/* Formulário */}
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className={`w-full ${isLogin ? "max-w-sm" : "max-w-lg"}`}>
          <button
            onClick={onBackToLanding}
            className="mb-8 flex items-center gap-2 text-sm text-ink-muted hover:text-ink lg:hidden"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          {/* Toggle */}
          <div className="mb-8 flex rounded-full border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                isLogin ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                !isLogin ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
              }`}
            >
              Criar conta
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {isLogin
              ? "Acesse sua área do cliente para continuar a mentoria."
              : "Cadastre seu restaurante agora para agilizarmos os ajustes de cardápio depois."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isLogin ? (
              <>
                <Field
                  icon={Mail}
                  label="E-mail"
                  type="email"
                  placeholder="voce@restaurante.com"
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  required
                />
                <Field
                  icon={Lock}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(v) => updateField("password", v)}
                  required
                />
              </>
            ) : (
              <>
                <SectionLabel icon={User}>Acesso</SectionLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    icon={User}
                    label="Nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={(v) => updateField("name", v)}
                    required
                  />
                  <Field
                    icon={Mail}
                    label="E-mail"
                    type="email"
                    placeholder="voce@restaurante.com"
                    value={form.email}
                    onChange={(v) => updateField("email", v)}
                    required
                  />
                </div>
                <Field
                  icon={Lock}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(v) => updateField("password", v)}
                  required
                />

                <SectionLabel icon={Building2}>Dados do restaurante</SectionLabel>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    icon={Building2}
                    label="CNPJ"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(v) => updateField("cnpj", maskCNPJ(v))}
                    mono
                    required
                  />
                  <Field
                    icon={Building2}
                    label="CEP"
                    type="text"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(v) => updateField("cep", maskCEP(v))}
                    mono
                    required
                  />
                </div>
                <Field
                  icon={Building2}
                  label="Endereço"
                  type="text"
                  placeholder="Rua, número, bairro, cidade"
                  value={form.endereco}
                  onChange={(v) => updateField("endereco", v)}
                  required
                />

                <SectionLabel icon={Landmark}>
                  Conta bancária <span className="font-normal text-ink-dim">(para agilizar os ajustes de cardápio)</span>
                </SectionLabel>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    icon={Landmark}
                    label="Banco"
                    type="text"
                    placeholder="Ex: Nubank"
                    value={form.banco}
                    onChange={(v) => updateField("banco", v)}
                  />
                  <Field
                    icon={Landmark}
                    label="Agência"
                    type="text"
                    placeholder="0000"
                    value={form.agencia}
                    onChange={(v) => updateField("agencia", v)}
                    mono
                  />
                  <Field
                    icon={Landmark}
                    label="Conta"
                    type="text"
                    placeholder="00000-0"
                    value={form.conta}
                    onChange={(v) => updateField("conta", v)}
                    mono
                  />
                </div>

                <SectionLabel icon={Clock3}>Dias e horário de funcionamento</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = form.diasFuncionamento.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`h-9 w-11 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? "bg-emerald-brand text-base"
                            : "border border-line text-ink-muted hover:border-emerald-brand/50"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    icon={Clock3}
                    label="Abertura"
                    type="time"
                    value={form.horarioAbertura}
                    onChange={(v) => updateField("horarioAbertura", v)}
                    mono
                  />
                  <Field
                    icon={Clock3}
                    label="Fechamento"
                    type="time"
                    value={form.horarioFechamento}
                    onChange={(v) => updateField("horarioFechamento", v)}
                    mono
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-flame">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-brand px-5 py-3.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? "Entrar" : "Criar conta e continuar"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-dim">
            {isLogin ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => setMode(isLogin ? "signup" : "login")}
              className="font-medium text-emerald-bright hover:underline"
            >
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-dim">
      <Icon size={13} className="text-emerald-bright" />
      {children}
    </div>
  );
}

function Field({ icon: Icon, label, type, placeholder, value, onChange, required, mono = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 transition-colors focus-within:border-emerald-brand/60">
        <Icon size={16} className="shrink-0 text-ink-dim" />
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none ${
            mono ? "font-mono" : ""
          }`}
        />
      </div>
    </label>
  );
}
