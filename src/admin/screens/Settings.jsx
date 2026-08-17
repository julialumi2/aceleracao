import { useState } from "react";
import { MessageSquareText, Users, Plug, Check, KeyRound, Eye, EyeOff } from "lucide-react";
import { signInWithEmail, updatePassword } from "../../lib/supabase.js";

const DEFAULT_TEMPLATES = {
  boleto: "Olá, {nome}! Notamos que o boleto no valor de R$ {valor}, com vencimento em {vencimento}, ainda está em aberto. Pode verificar e regularizar quando possível? Qualquer dúvida, estamos à disposição 🙏",
  intensidade: "Olá, {nome}! Passando para saber como está o movimento da loja essa semana. Nosso time notou uma queda no engajamento das redes sociais — vamos marcar uma call rápida para ajustar a estratégia juntos?",
};

const TEAM = [
  { name: "Guilherme Araújo", email: "guilherme.araujo@artesanos.adm.br", role: "Admin" },
  { name: "Kevyn", email: "kevynadm02artesanos@gmail.com", role: "Adm" },
  { name: "Kethllyn", email: "kethllynadmartesanos@outlook.com", role: "Adm" },
  { name: "Julia", email: "julia.suzuki@artesanos.adm.br", role: "TI" },
];

const INTEGRATIONS = [
  { name: "Asaas", description: "Emissão e status de boletos", connected: true },
  { name: "Clicksign", description: "Assinatura de contratos", connected: true },
  { name: "WhatsApp (Meta Cloud API)", description: "Envio automático de alertas", connected: false },
  { name: "Instagram Graph API", description: "Verificação automática de intensidade", connected: false },
];

export default function Settings({ session }) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl tracking-wide text-ink">Configurações</h1>
        <p className="mt-1 text-sm text-ink-muted">Modelos de mensagem, equipe e integrações.</p>
      </div>

      <PasswordSection session={session} />

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <MessageSquareText size={15} className="text-emerald-bright" />
          Modelos de mensagem (WhatsApp)
        </h2>
        <p className="mt-1 text-xs text-ink-dim">
          Use {"{nome}"}, {"{valor}"} e {"{vencimento}"} como marcadores — eles são substituídos automaticamente ao gerar o link de envio.
        </p>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Alerta de boleto atrasado</span>
            <textarea
              value={templates.boleto}
              onChange={(e) => setTemplates((t) => ({ ...t, boleto: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Alerta de queda de intensidade</span>
            <textarea
              value={templates.intensidade}
              onChange={(e) => setTemplates((t) => ({ ...t, intensidade: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="rounded-full bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
          >
            Salvar modelos
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-bright">
              <Check size={15} /> Salvo
            </span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Users size={15} className="text-emerald-bright" />
          Equipe
        </h2>
        <ul className="mt-4 space-y-3">
          {TEAM.map((member) => (
            <li key={member.email} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-ink">{member.name}</p>
                <p className="text-xs text-ink-dim">{member.email}</p>
              </div>
              <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-muted">{member.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Plug size={15} className="text-emerald-bright" />
          Integrações
        </h2>
        <ul className="mt-4 space-y-3">
          {INTEGRATIONS.map((integration) => (
            <li key={integration.name} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-ink">{integration.name}</p>
                <p className="text-xs text-ink-dim">{integration.description}</p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  integration.connected
                    ? "border-emerald-brand/30 bg-emerald-brand/10 text-emerald-bright"
                    : "border-line text-ink-dim"
                }`}
              >
                {integration.connected ? "Conectado" : "Em breve"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PasswordSection({ session }) {
  const [form, setForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function trocarSenha() {
    setErro("");
    setSucesso(false);
    if (!form.atual || !form.nova || !form.confirmar) return;
    if (form.nova.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (form.nova !== form.confirmar) {
      setErro("A confirmação não bate com a nova senha.");
      return;
    }
    setSalvando(true);
    try {
      // Reconfirma a senha atual antes de trocar — evita que alguém na
      // frente do computador destravado mude a senha sem saber a atual.
      await signInWithEmail({ email: session?.email, password: form.atual });
      await updatePassword(form.nova);
      setSucesso(true);
      setForm({ atual: "", nova: "", confirmar: "" });
    } catch (err) {
      setErro("Senha atual incorreta.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <KeyRound size={15} className="text-emerald-bright" />
        Trocar senha
      </h2>
      <p className="mt-1 text-xs text-ink-dim">Altera a senha de acesso da sua conta ({session?.email || "conta atual"}).</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <PasswordField label="Senha atual" value={form.atual} onChange={(v) => setForm((f) => ({ ...f, atual: v }))} />
        <PasswordField label="Nova senha" value={form.nova} onChange={(v) => setForm((f) => ({ ...f, nova: v }))} />
        <PasswordField label="Confirmar nova senha" value={form.confirmar} onChange={(v) => setForm((f) => ({ ...f, confirmar: v }))} />
      </div>

      {erro && <p className="mt-3 text-sm text-flame">{erro}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={trocarSenha}
          disabled={salvando}
          className="rounded-full bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
        >
          Salvar nova senha
        </button>
        {sucesso && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-bright">
            <Check size={15} /> Senha alterada
          </span>
        )}
      </div>
    </section>
  );
}

function PasswordField({ label, value, onChange }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-raised px-3.5 py-2.5 focus-within:border-emerald-brand/60">
        <input
          type={visivel ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="shrink-0 text-ink-dim transition-colors hover:text-ink"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        >
          {visivel ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </label>
  );
}
