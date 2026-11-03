// Número grande em mono (alinha coluna e não "dança" quando o valor
// muda) com o rótulo em caixa alta pequena. Tom "danger"/"warning"
// acende a borda e o número em brasa, pra puxar o olho sem gritar.
const TONS = {
  default: "border-line",
  warning: "border-emerald-brand/35",
  danger: "border-emerald-brand/35",
};

const TONS_VALOR = {
  default: "text-ink",
  warning: "text-emerald-brand",
  danger: "text-emerald-brand",
};

export default function KpiCard({ label, value, nota, tone = "default" }) {
  return (
    <div className={`rounded-[14px] border bg-surface p-4 sm:p-[18px] ${TONS[tone]}`}>
      <p className="font-mono text-[10px] uppercase leading-snug tracking-[0.14em] text-ink-muted">{label}</p>
      <p className={`mt-2.5 font-mono text-[26px] font-medium leading-none tabular-nums ${TONS_VALOR[tone]}`}>{value}</p>
      {nota && <p className="mt-2 text-[11.5px] text-ink-dim">{nota}</p>}
    </div>
  );
}
