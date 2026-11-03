// Quatro famílias de estado, nada além disso: verde = resolvido,
// brasa = precisa de você, chama = risco, neutro = sem carga.
const OK = "border-ok/30 bg-ok/10 text-ok";
const ATENCAO = "border-emerald-brand/30 bg-emerald-brand/10 text-emerald-brand";
const RISCO = "border-flame/30 bg-flame/10 text-flame";
const NEUTRO = "border-line-forte bg-surface-raised text-ink-muted";
const INFO = "border-info/30 bg-info/10 text-info";

const STYLES = {
  // contrato
  assinado: OK,
  pendente: ATENCAO,
  contrato_pendente: RISCO,
  // boleto
  pago: OK,
  atrasado: RISCO,
  // intensidade
  ativo: OK,
  em_queda: ATENCAO,
  inativo: RISCO,
  // leads
  novo: INFO,
  contatado: ATENCAO,
  qualificado: INFO,
  reuniao_agendada: INFO,
  follow_up: ATENCAO,
  convertido: OK,
  descartado: NEUTRO,
  // cliente que cancelou a mentoria
  cancelado: RISCO,
  // saúde da campanha (independente da intensidade de redes sociais)
  saude_verde: OK,
  saude_amarelo: ATENCAO,
  saude_laranja: ATENCAO,
  saude_inativo: RISCO,
  // temperatura do lead
  temp_frio: INFO,
  temp_morno: ATENCAO,
  temp_quente: RISCO,
  // prioridade de tarefa
  prioridade_urgente: RISCO,
  prioridade_alta: ATENCAO,
  prioridade_media: ATENCAO,
  prioridade_baixa: OK,
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
  contatado: "Em contato",
  qualificado: "Qualificado",
  reuniao_agendada: "Reunião agendada",
  follow_up: "Follow up",
  convertido: "Fechado",
  descartado: "Desqualificado",
  cancelado: "Cancelado",
  saude_verde: "Rodando com resultado",
  saude_amarelo: "Rodando, sem resultado",
  saude_laranja: "Tráfego não iniciado",
  saude_inativo: "Inativo",
  temp_frio: "Frio",
  temp_morno: "Morno",
  temp_quente: "Quente",
  prioridade_urgente: "Urgente",
  prioridade_alta: "Alta",
  prioridade_media: "Média",
  prioridade_baixa: "Baixa",
};

export default function StatusBadge({ status, context }) {
  const key = context ? `${context}_${status}` : status;
  const style = STYLES[key] || STYLES[status] || "border-line text-ink-muted";
  const label = LABELS[key] || LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-[3px] text-[11.5px] font-medium ${style}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {label}
    </span>
  );
}

// Não é bem um "status" (pago/pendente/atrasado) — é uma previsão, sem
// boleto correspondente ainda. Cor neutra (sky) pra não confundir com
// os badges de verdade.
export function NextBillingBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-info/30 bg-info/10 px-2 py-[3px] text-[11.5px] font-medium text-info">
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {label}
    </span>
  );
}
