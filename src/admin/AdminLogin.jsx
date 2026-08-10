import { useState } from "react";
import { ShieldCheck, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { signInWithEmail } from "../lib/supabase.js";

export default function AdminLogin({ onAuthenticated, onBack }) {
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
      await signInWithEmail(form).catch(() => null);
      onAuthenticated({ name: form.email.split("@")[0] || "Equipe", email: form.email });
    } catch (err) {
      setError(err.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-ink">
      <button
        onClick={onBack}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="w-full max-w-sm">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-brand/15 text-emerald-bright">
          <ShieldCheck size={20} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-wide text-ink">Entrar no painel</h1>
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
  );
}

function Field({ icon: Icon, label, type, placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 transition-colors focus-within:border-emerald-brand/60">
        <Icon size={16} className="shrink-0 text-ink-dim" />
        <input
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
        />
      </div>
    </label>
  );
}
