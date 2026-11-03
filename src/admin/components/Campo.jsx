import Dica from "./Dica.jsx";

// Visual único de input/select/textarea do painel. No foco, a borda vira
// brasa e um halo fino aparece em volta — no escuro, só a troca de borda
// quase não se enxergava.
export function classeCampo(extra = "") {
  return `w-full rounded-[10px] border border-line-forte bg-surface-raised px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-dim transition-colors focus:border-emerald-brand focus:outline-none focus:ring-[3px] focus:ring-emerald-brand/15 ${extra}`;
}

export function RotuloCampo({ children, dica }) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted">
      {children}
      {dica && <Dica>{dica}</Dica>}
    </span>
  );
}

export function CampoTexto({ label, dica, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <RotuloCampo dica={dica}>{label}</RotuloCampo>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={classeCampo(type === "date" ? "[color-scheme:dark]" : "")}
        {...props}
      />
    </label>
  );
}

export function CampoTextarea({ label, dica, value, onChange, rows = 2, ...props }) {
  return (
    <label className="block">
      <RotuloCampo dica={dica}>{label}</RotuloCampo>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={classeCampo()}
        {...props}
      />
    </label>
  );
}
