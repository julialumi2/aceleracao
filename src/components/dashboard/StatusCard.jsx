import { CheckCircle2, Clock, FileSignature, CreditCard } from "lucide-react";

const ICONS = { contract: FileSignature, billing: CreditCard };

const STATUS_STYLES = {
  pending: {
    label: "Pendente",
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    icon: Clock,
  },
  active: {
    label: "Assinado",
    dot: "bg-emerald-bright",
    badge: "bg-emerald-brand/10 text-emerald-bright border-emerald-brand/30",
    icon: CheckCircle2,
  },
};

export default function StatusCard({ type, title, subtitle, status }) {
  const Icon = ICONS[type];
  const s = STATUS_STYLES[status];
  const StatusIcon = s.icon;

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-ink-muted">
        <Icon size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">{title}</p>
          <span className={`relative flex h-2 w-2 shrink-0 rounded-full ${s.dot}`}>
            {status === "pending" && (
              <span className={`absolute inset-0 animate-ping rounded-full ${s.dot} opacity-60`} />
            )}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-dim">{subtitle}</p>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${s.badge}`}
        >
          <StatusIcon size={12} />
          {s.label}
        </span>
      </div>
    </div>
  );
}
