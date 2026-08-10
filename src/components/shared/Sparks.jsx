// Faíscas subindo — assinatura visual do material de vendas (capa/fechamento
// com fogo e partículas). Uso pontual em seções "hero", não em telas de dados.
const SPARKS = [
  { left: "8%", delay: "0s", duration: "3.2s" },
  { left: "22%", delay: "1.1s", duration: "4s" },
  { left: "35%", delay: "0.4s", duration: "3.6s" },
  { left: "51%", delay: "2s", duration: "3s" },
  { left: "64%", delay: "0.8s", duration: "4.4s" },
  { left: "78%", delay: "1.6s", duration: "3.4s" },
  { left: "90%", delay: "0.2s", duration: "3.8s" },
];

export default function Sparks({ className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="spark-dot animate-spark"
          style={{ left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
        />
      ))}
    </div>
  );
}
