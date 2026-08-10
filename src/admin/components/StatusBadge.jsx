const STYLES = {
  // contrato
  assinado: "bg-emerald-brand/10 text-emerald-bright border-emerald-brand/30",
  pendente: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  // boleto
  pago: "bg-emerald-brand/10 text-emerald-bright border-emerald-brand/30",
  atrasado: "bg-rose-400/10 text-rose-300 border-rose-400/30",
  // intensidade
  ativo: "bg-emerald-brand/10 text-emerald-bright border-emerald-brand/30",
  em_queda: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  inativo: "bg-rose-400/10 text-rose-300 border-rose-400/30",
  // leads
  novo: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  contatado: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  convertido: "bg-emerald-brand/10 text-emerald-bright border-emerald-brand/30",
  descartado: "bg-ink-dim/10 text-ink-dim border-line",
};

const LABELS = {
  assinado: "Assinado",
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  ativo: "Ativo",
  em_queda: "Em queda",
  inativo: "Inativo",
  novo: "Novo",
  contatado: "Contatado",
  convertido: "Convertido",
  descartado: "Descartado",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        STYLES[status] || "border-line text-ink-muted"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  );
}
