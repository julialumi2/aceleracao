import { useState } from "react";
import { ShieldCheck, Flame, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { signInWithEmail } from "../lib/supabase.js";
import Sparks from "../components/shared/Sparks.jsx";

export default function AdminLogin({ onAuthenticated }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Login da equipe usa o mesmo Supabase Auth; a distinção de papel
      // (admin/mentor/financeiro) deve vir de uma tabela `staff_members`
      // consultada após o login, quando isso entrar em produção.
      // Precisa ter sucesso de verdade: as tabelas do painel são protegidas
      // por RLS (só usuário autenticado lê/escreve), então sem sessão válida
      // o painel abriria vazio.
      await signInWithEmail(form);
      onAuthenticated({ name: form.email.split("@")[0] || "Equipe", email: form.email });
    } catch (err) {
      setError("E-mail ou senha incorretos.");
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

        <div className="relative z-10 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
            <Flame size={18} />
          </span>
          <span className="font-display text-lg tracking-wide text-ink">Aceleração Delivery</span>
        </div>

        <div className="relative z-10">
          <h2 className="max-w-sm text-balance font-display text-3xl leading-tight tracking-wide text-ink">
            O painel interno da equipe.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            Clientes, contratos, cobranças e intensidade de cada restaurante mentorado, em um só lugar.
          </p>
        </div>

        <p className="relative z-10 text-xs text-ink-dim">Aceleração Delivery © {new Date().getFullYear()}</p>
      </div>

      {/* Formulário */}
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright lg:hidden">
            <ShieldCheck size={20} />
          </span>
          <h1 className="mt-6 font-display text-2xl tracking-wide text-ink lg:mt-0">Entrar no painel</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Use suas credenciais de acesso da equipe.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field
              icon={Mail}
              label="E-mail"
              type="email"
              placeholder="equipe@salacheia.com.br"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <Field
              icon={Lock}
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            />

            {error && <p className="text-sm text-flame">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-brand px-5 py-3.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type, placeholder, value, onChange }) {
  const [visivel, setVisivel] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 transition-colors focus-within:border-emerald-brand/60">
        <Icon size={16} className="shrink-0 text-ink-dim" />
        <input
          type={isPassword && visivel ? "text" : type}
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            className="shrink-0 text-ink-dim transition-colors hover:text-ink"
            aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          >
            {visivel ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </label>
  );
}
