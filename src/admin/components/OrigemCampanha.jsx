// Os anúncios da Meta preenchem utm_source com códigos curtos ({{site_source_name}}).
const PLATAFORMAS = {
  ig: "Instagram",
  instagram: "Instagram",
  fb: "Facebook",
  facebook: "Facebook",
  msg: "Messenger",
  an: "Audience Network",
  google: "Google",
};

export function nomePlataforma(source) {
  return PLATAFORMAS[source?.toLowerCase()] || source;
}

export function temCampanha(utm) {
  return Boolean(utm?.source || utm?.medium || utm?.campaign || utm?.content);
}

// Mostra de onde o lead/cliente veio, a partir dos parâmetros do link da
// campanha. Some quando ele chegou sem nenhum (bio, link direto, indicação).
export default function OrigemCampanha({ utm, className = "" }) {
  if (!temCampanha(utm)) return null;

  const itens = [
    ["Origem", nomePlataforma(utm.source)],
    ["Meio", utm.medium],
    ["Campanha", utm.campaign],
    ["Conteúdo", utm.content],
  ].filter(([, valor]) => valor);

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <p className="text-xs font-medium text-ink-muted">De onde veio</p>
        {utm.source && (
          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-medium text-ink-muted">
            via {nomePlataforma(utm.source)}
          </span>
        )}
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {itens.map(([label, valor]) => (
          <div key={label}>
            <dt className="text-xs font-medium text-ink-dim">{label}</dt>
            <dd className="mt-0.5 break-words text-sm text-ink">{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
