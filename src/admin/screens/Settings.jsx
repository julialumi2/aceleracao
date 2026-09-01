import { useState, useEffect } from "react";
import { MessageSquareText, Users, Plug, Check, KeyRound, Eye, EyeOff, UserPlus, X, Copy, Workflow, ExternalLink } from "lucide-react";
import { signInWithEmail, updatePassword } from "../../lib/supabase.js";
import { criarMembroEquipe, fetchMembrosEquipe } from "../lib/teamApi.js";

const DEFAULT_TEMPLATES = {
  boleto: "Olá, {nome}! Notamos que o boleto no valor de R$ {valor}, com vencimento em {vencimento}, ainda está em aberto. Pode verificar e regularizar quando possível? Qualquer dúvida, estamos à disposição 🙏",
  intensidade: "Olá, {nome}! Passando para saber como está o movimento da loja essa semana. Nosso time notou uma queda no engajamento das redes sociais — vamos marcar uma call rápida para ajustar a estratégia juntos?",
};

const INTEGRATIONS = [
  { name: "Asaas", description: "Cria cliente + assinatura recorrente e recebe status de boleto por webhook", connected: true },
  { name: "Clicksign", description: "Gera e envia o contrato, recebe confirmação de assinatura por webhook", connected: true },
  { name: "WhatsApp (Meta Cloud API)", description: "Envio automático de alertas", connected: false },
  { name: "Instagram Graph API", description: "Verificação automática de intensidade", connected: false },
];

const FLUXO_SISTEMA_URL = "https://claude.ai/code/artifact/18da37e0-8039-43b2-9407-784e4ec64aac";

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

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Workflow size={15} className="text-emerald-bright" />
          Como o sistema funciona
        </h2>
        <p className="mt-1 text-xs text-ink-dim">
          Fluxo completo, do formulário público até o boleto pago — inclui os diagramas de como o Clicksign e o Asaas
          avisam o painel quando o cliente assina ou paga.
        </p>
        <a
          href={FLUXO_SISTEMA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-brand px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright"
        >
          Ver fluxo do sistema
          <ExternalLink size={14} />
        </a>
      </section>

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

      <TeamSection />

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

function TeamSection() {
  const [team, setTeam] = useState([]);
  const [carregandoTeam, setCarregandoTeam] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", cargo: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState(null);

  useEffect(() => {
    fetchMembrosEquipe()
      .then(setTeam)
      .catch((err) => setErro(err.message))
      .finally(() => setCarregandoTeam(false));
  }, []);

  function fecharForm() {
    setShowForm(false);
    setForm({ nome: "", email: "", cargo: "" });
    setErro("");
  }

  async function adicionarMembro(e) {
    e.preventDefault();
    setErro("");
    if (!form.nome.trim() || !form.email.trim()) return;

    setSalvando(true);
    try {
      const resultado = await criarMembroEquipe({
        nome: form.nome.trim(),
        email: form.email.trim(),
        cargo: form.cargo.trim() || undefined,
      });
      setTeam((t) => [...t, { name: form.nome.trim(), email: resultado.email, role: form.cargo.trim() || "Equipe" }]);
      setCriado({ email: resultado.email, senha: resultado.senhaTemporaria });
      fecharForm();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Users size={15} className="text-emerald-bright" />
          Equipe
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-emerald-brand/60 hover:text-ink"
          >
            <UserPlus size={13} /> Adicionar membro
          </button>
        )}
      </div>

      {criado && (
        <div className="mt-4 rounded-xl border border-emerald-brand/30 bg-emerald-brand/10 p-4 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-emerald-bright">
            <Check size={15} /> Acesso criado para {criado.email}
          </p>
          <p className="mt-2 text-xs text-ink-dim">
            Senha temporária (mostrada só agora — copie e repasse por um canal seguro). A pessoa pode trocá-la depois em "Trocar senha".
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs text-ink">{criado.senha}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(criado.senha)}
              className="shrink-0 rounded-lg border border-line p-2 text-ink-dim transition-colors hover:text-ink"
              aria-label="Copiar senha"
            >
              <Copy size={14} />
            </button>
          </div>
          <button onClick={() => setCriado(null)} className="mt-3 text-xs font-medium text-ink-muted hover:text-ink">
            Fechar
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={adicionarMembro} className="mt-4 space-y-3 rounded-xl border border-line bg-surface-raised p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-ink-muted">Novo integrante</p>
            <button type="button" onClick={fecharForm} className="text-ink-dim hover:text-ink" aria-label="Cancelar">
              <X size={14} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
            />
            <input
              placeholder="Cargo (opcional)"
              value={form.cargo}
              onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
            />
          </div>
          {erro && <p className="text-sm text-flame">{erro}</p>}
          <button
            type="submit"
            disabled={salvando}
            className="rounded-full bg-emerald-brand px-5 py-2 text-sm font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-60"
          >
            {salvando ? "Criando..." : "Criar acesso"}
          </button>
        </form>
      )}

      {carregandoTeam && <p className="mt-4 text-xs text-ink-dim">Carregando equipe...</p>}

      <ul className="mt-4 space-y-3">
        {team.map((member) => (
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
