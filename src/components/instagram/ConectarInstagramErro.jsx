import { AlertTriangle } from "lucide-react";

const MENSAGENS = {
  "link-invalido": "Esse link não é válido. Pede pra equipe te mandar o link de novo.",
  "nao-configurado": "Essa conexão ainda não está disponível. Tenta de novo mais tarde.",
  cancelado: "A conexão foi cancelada — nenhum acesso foi concedido.",
  "falha-conexao": "Não conseguimos conectar sua conta. Confere se ela é Comercial/Criador de Conteúdo e vinculada a uma Página do Facebook, e tenta de novo.",
};

export default function ConectarInstagramErro() {
  const params = new URLSearchParams(window.location.search);
  const motivo = params.get("motivo");
  const mensagem = MENSAGENS[motivo] || "Não foi possível concluir a conexão. Tenta de novo em instantes.";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-6">
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" />
      <div className="relative w-full max-w-md rounded-2xl border border-flame/40 bg-surface p-8 text-center">
        <AlertTriangle size={40} className="mx-auto text-flame" />
        <h1 className="mt-5 font-display text-2xl tracking-wide text-ink">Não deu certo</h1>
        <p className="mt-3 text-sm text-ink-muted">{mensagem}</p>
      </div>
    </div>
  );
}
