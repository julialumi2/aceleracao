export default function KpiCard({ icon: Icon, label, value, tone = "default" }) {
  const toneStyles = {
    default: "text-emerald-bright bg-emerald-brand/10",
    warning: "text-amber-300 bg-amber-400/10",
    danger: "text-flame bg-flame/10",
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${toneStyles[tone]}`}>
        <Icon size={17} className="sm:hidden" />
        <Icon size={18} className="hidden sm:block" />
      </span>
      <p className="mt-3 font-display text-xl font-bold tracking-wide text-ink sm:mt-4 sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-ink-dim">{label}</p>
    </div>
  );
}
