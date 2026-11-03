// Hierarquia de botões do painel, pra não ter dois "botões principais"
// disputando atenção no mesmo card:
//   primario    ação principal do bloco — brasa sólida, no máximo um por card
//   secundario  ação de apoio — contorno sobre a superfície
//   fantasma    sair, cancelar, fechar — só texto
//   perigo      ação destrutiva em repouso
//   perigoFirme confirmação da ação destrutiva
const VARIANTES = {
  primario: "bg-emerald-brand font-semibold text-base hover:bg-emerald-bright",
  secundario: "border border-line-forte bg-surface font-medium text-ink hover:border-ink-dim hover:bg-surface-raised",
  fantasma: "font-medium text-ink-muted hover:bg-surface-raised hover:text-ink",
  perigo: "border border-line-forte font-medium text-flame hover:border-flame hover:bg-flame/10",
  perigoFirme: "bg-flame/15 font-semibold text-flame hover:bg-flame/25",
};

const TAMANHOS = {
  md: "h-9 px-[15px] text-[13.5px]",
  sm: "h-[30px] px-[11px] text-[12.5px]",
};

export default function Botao({
  variante = "secundario",
  tamanho = "md",
  icone: Icone,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] tracking-tight transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...props}
    >
      {Icone && <Icone size={tamanho === "sm" ? 13 : 15} className="shrink-0" />}
      {children}
    </button>
  );
}

// Escolha entre poucas opções que já são o estado atual do cliente
// (saúde da campanha, status do contrato, intensidade).
export function Segmentado({ opcoes, valor, onEscolher, rotulo, desabilitado = false, className = "" }) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={`inline-flex flex-wrap gap-0.5 rounded-[10px] border border-line bg-surface-raised p-1 ${className}`}
    >
      {opcoes.map((opcao) => {
        const ativo = valor === opcao.valor;
        return (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={ativo}
            disabled={desabilitado}
            onClick={() => onEscolher(opcao.valor)}
            className={`rounded-[7px] px-3 py-1.5 text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              ativo ? "bg-emerald-brand font-semibold text-base" : "font-medium text-ink-muted hover:text-ink"
            }`}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
