export default function KpiCard({ icon: Icon, label, value, tone = "default" }) {
  const toneStyles = {
    default: "text-emerald-bright bg-emerald-brand/10",
    warning: "text-amber-300 bg-amber-400/10",
    danger: "text-rose-300 bg-rose-400/10",
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
        <Icon size={18} />
      </span>
      <p className="mt-4 font-display text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-dim">{label}</p>
    </div>
  );
}
