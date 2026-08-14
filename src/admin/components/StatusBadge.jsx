const STYLES = {
  // contrato
  assinado: "bg-green-400/10 text-green-300 border-green-400/30",
  pendente: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  contrato_pendente: "bg-flame/10 text-flame border-flame/30",
  // boleto
  pago: "bg-green-400/10 text-green-300 border-green-400/30",
  atrasado: "bg-flame/10 text-flame border-flame/30",
  // intensidade
  ativo: "bg-green-400/10 text-green-300 border-green-400/30",
  em_queda: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  inativo: "bg-flame/10 text-flame border-flame/30",
  // leads
  novo: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  contatado: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  convertido: "bg-emerald-brand/10 text-emerald-bright border-emerald-brand/30",
  descartado: "bg-ink-dim/10 text-ink-dim border-line",
  // cliente que cancelou a mentoria — preenchido sólido de propósito, pra
  // se destacar dos outros badges (translúcidos) e não passar despercebido.
  cancelado: "bg-flame text-base border-flame font-semibold",
  // saúde da campanha (independente da intensidade de redes sociais)
  saude_verde: "bg-green-400/10 text-green-300 border-green-400/30",
  saude_amarelo: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  saude_laranja: "bg-orange-400/10 text-orange-300 border-orange-400/30",
  saude_inativo: "bg-flame/10 text-flame border-flame/30",
  // temperatura do lead
  temp_frio: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  temp_morno: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  temp_quente: "bg-flame/10 text-flame border-flame/30",
};

const LABELS = {
  assinado: "Assinado",
  pendente: "A pagar",
  contrato_pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  ativo: "Ativo",
  em_queda: "Em queda",
  inativo: "Inativo",
  novo: "Novo",
  contatado: "Contatado",
  convertido: "Convertido",
  descartado: "Descartado",
  cancelado: "Cancelado",
  saude_verde: "Rodando com resultado",
  saude_amarelo: "Rodando, sem resultado",
  saude_laranja: "Tráfego não iniciado",
  saude_inativo: "Inativo",
  temp_frio: "Frio",
  temp_morno: "Morno",
  temp_quente: "Quente",
};

export default function StatusBadge({ status, context, size = "md" }) {
  const key = context ? `${context}_${status}` : status;
  const style = STYLES[key] || STYLES[status] || "border-line text-ink-muted";
  const label = LABELS[key] || LABELS[status] || status;
  const sizeClasses = size === "sm" ? "gap-1 px-1.5 py-0.5 text-[10px] leading-none" : "gap-1.5 px-2.5 py-1 text-[11px]";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${style}`}
    >
      <span className={`rounded-full bg-current ${size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5"}`} />
      {label}
    </span>
  );
}

// Não é bem um "status" (pago/pendente/atrasado) — é uma previsão, sem
// boleto correspondente ainda. Cor neutra (sky) pra não confundir com
// os badges de verdade.
export function NextBillingBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium bg-sky-400/10 text-sky-300 border-sky-400/30">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
