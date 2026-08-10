import { useState } from "react";
import { MessageSquareText, Users, Plug, Check } from "lucide-react";

const DEFAULT_TEMPLATES = {
  boleto: "Olá, {nome}! Notamos que o boleto no valor de R$ {valor}, com vencimento em {vencimento}, ainda está em aberto. Pode verificar e regularizar quando possível? Qualquer dúvida, estamos à disposição 🙏",
  intensidade: "Olá, {nome}! Passando para saber como está o movimento da loja essa semana. Nosso time notou uma queda no engajamento das redes sociais — vamos marcar uma call rápida para ajustar a estratégia juntos?",
};

const TEAM = [
  { name: "Guilherme Araújo", email: "guilherme.araujo@artesanos.adm.br", role: "Admin" },
  { name: "Equipe Financeiro", email: "financeiro@salacheia.com.br", role: "Financeiro" },
  { name: "Equipe Mentoria", email: "mentoria@salacheia.com.br", role: "Mentor" },
];

const INTEGRATIONS = [
  { name: "Asaas", description: "Emissão e status de boletos", connected: true },
  { name: "Clicksign", description: "Assinatura de contratos", connected: true },
  { name: "WhatsApp (Meta Cloud API)", description: "Envio automático de alertas", connected: false },
  { name: "Instagram Graph API", description: "Verificação automática de intensidade", connected: false },
];

export default function Settings() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Configurações</h1>
        <p className="mt-1 text-sm text-ink-muted">Modelos de mensagem, equipe e integrações.</p>
      </div>

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
