import { MessageCircle, ChevronRight, History } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildWhatsAppLink } from "../lib/waLink.js";
import { intensityAlertMessage } from "../lib/messageTemplates.js";

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function Intensity({ clients, onMarkMessageSent, onOpenClient }) {
  const precisaAtencao = clients.filter((c) => c.intensidade.status !== "ativo");
  const ativos = clients.filter((c) => c.intensidade.status === "ativo");

  const mensagensEnviadas = clients
    .flatMap((c) => (c.intensidade.historico || []).map((h) => ({ ...h, cliente: c.empresa || c.nome })))
    .filter((h) => h.mensagemEnviada)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-wide text-ink">Monitoramento de Intensidade</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Fila de verificação (manual por enquanto), resultado da última análise e mensagens enviadas.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Precisa de atenção ({precisaAtencao.length})</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {precisaAtencao.map((c) => {
            const waLink = buildWhatsAppLink(c.telefone, intensityAlertMessage(c));
            const ultimaChecagem = c.intensidade.historico?.[c.intensidade.historico.length - 1];
            return (
              <div key={c.id} className="flex flex-col gap-3 border-b border-line/40 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <button onClick={() => onOpenClient(c.id)} className="flex flex-1 items-center justify-between text-left">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.empresa || c.nome}</p>
                    <p className="text-xs text-ink-dim">
                      Última checagem: {formatDate(ultimaChecagem?.data || c.intensidade.atualizadoEm)} — {c.intensidade.observacao}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    <StatusBadge status={c.intensidade.status} />
                    <ChevronRight size={15} className="hidden text-ink-dim sm:block" />
                  </div>
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onMarkMessageSent(c)}
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-brand px-3 py-2 text-xs font-medium text-base transition-colors hover:bg-emerald-bright"
                >
                  <MessageCircle size={13} />
                  Enviar mensagem
                </a>
              </div>
            );
          })}
          {precisaAtencao.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-dim">Nenhum cliente precisando de atenção agora.</p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Ativos ({ativos.length})</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {ativos.map((c) => (
            <button
              key={c.id}
              onClick={() => onOpenClient(c.id)}
              className="flex w-full items-center justify-between border-b border-line/40 px-5 py-4 text-left last:border-b-0 hover:bg-surface-raised"
            >
              <div>
                <p className="text-sm font-medium text-ink">{c.empresa || c.nome}</p>
                <p className="text-xs text-ink-dim">{c.intensidade.observacao}</p>
              </div>
              <StatusBadge status={c.intensidade.status} />
            </button>
          ))}
          {ativos.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-dim">Nenhum cliente ativo.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <History size={15} className="text-emerald-bright" />
          Mensagens enviadas
        </h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {mensagensEnviadas.map((h) => (
            <div key={h.id} className="flex items-center justify-between border-b border-line/40 px-5 py-3 text-sm last:border-b-0">
              <span className="text-ink">{h.cliente}</span>
              <span className="text-xs text-ink-dim">{formatDate(h.data)}</span>
            </div>
          ))}
          {mensagensEnviadas.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-dim">Nenhuma mensagem enviada ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
