import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, TrendingDown, Target, Trophy, CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { fetchAnalisePorOrigem, fetchAnalisePorDia } from "../lib/adminApi.js";

const FUSO = "America/Sao_Paulo";
const SEM_UTM = "Direto / sem UTM";
const TOPO_RANKING = 10;

const PERIODOS = [
  { chave: "hoje", rotulo: "Hoje" },
  { chave: "ontem", rotulo: "Ontem" },
  { chave: "7d", rotulo: "Últimos 7 dias" },
  { chave: "30d", rotulo: "Últimos 30 dias" },
  { chave: "personalizado", rotulo: "Personalizado" },
];

const NIVEIS = [
  { chave: "source", rotulo: "Source" },
  { chave: "campaign", rotulo: "Campanha" },
  { chave: "content", rotulo: "Anúncio" },
  { chave: "term", rotulo: "Público" },
];

const ROTULO_STATUS = {
  novo: "Novo",
  contatado: "Em Contato",
  qualificado: "Qualificado",
  reuniao_agendada: "Reunião Agendada",
  follow_up: "Follow Up",
  convertido: "Fechado",
  descartado: "Desqualificado",
};

// ---------- datas, sempre no fuso de São Paulo ----------

const formatadorDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function diaEmSaoPaulo(data = new Date()) {
  return formatadorDia.format(data);
}

function somarDias(iso, dias) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

function diasEntre(inicio, fim) {
  const [a1, m1, d1] = inicio.split("-").map(Number);
  const [a2, m2, d2] = fim.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}

function diaCurto(iso) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

function intervaloDoPeriodo(periodo, de, ate) {
  const hoje = diaEmSaoPaulo();
  if (periodo === "hoje") return { inicio: hoje, fim: hoje };
  if (periodo === "ontem") {
    const ontem = somarDias(hoje, -1);
    return { inicio: ontem, fim: ontem };
  }
  if (periodo === "30d") return { inicio: somarDias(hoje, -29), fim: hoje };
  if (periodo === "personalizado" && de && ate) {
    return de <= ate ? { inicio: de, fim: ate } : { inicio: ate, fim: de };
  }
  return { inicio: somarDias(hoje, -6), fim: hoje };
}

// Mesmo tamanho de janela, colado antes do período escolhido — é com ele
// que os cards comparam ("últimos 7 dias" contra os 7 dias anteriores).
function intervaloAnterior({ inicio, fim }) {
  const dias = diasEntre(inicio, fim) + 1;
  return { inicio: somarDias(inicio, -dias), fim: somarDias(inicio, -1) };
}

// ---------- filtro guardado na URL, pra poder compartilhar o link ----------

function lerEstadoDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const periodo = PERIODOS.some((p) => p.chave === params.get("periodo")) ? params.get("periodo") : "7d";
  const nivel = NIVEIS.some((n) => n.chave === params.get("nivel")) ? params.get("nivel") : "campaign";
  const data = /^\d{4}-\d{2}-\d{2}$/;
  return {
    periodo,
    nivel,
    de: data.test(params.get("de") || "") ? params.get("de") : "",
    ate: data.test(params.get("ate") || "") ? params.get("ate") : "",
  };
}

function gravarEstadoNaUrl({ periodo, nivel, de, ate }) {
  const params = new URLSearchParams(window.location.search);
  params.set("periodo", periodo);
  params.set("nivel", nivel);
  if (periodo === "personalizado" && de && ate) {
    params.set("de", de);
    params.set("ate", ate);
  } else {
    params.delete("de");
    params.delete("ate");
  }
  window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
}

// ---------- contas ----------

function porcentagem(parte, total) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

function compararComAnterior(atual, anterior) {
  if (anterior === 0 && atual === 0) return null;
  if (anterior === 0) return { direcao: 1, texto: "novo no período" };
  const variacao = Math.round(((atual - anterior) / anterior) * 100);
  if (variacao === 0) return { direcao: 0, texto: "igual ao período anterior" };
  return { direcao: Math.sign(variacao), texto: `${variacao > 0 ? "+" : ""}${variacao}% vs. período anterior` };
}

function rotuloOrigem(linha) {
  return linha.origem || SEM_UTM;
}

function somar(linhas, campo) {
  return linhas.reduce((soma, linha) => soma + linha[campo], 0);
}

function montarRanking(linhas, campo) {
  const comValor = linhas.filter((l) => l[campo] > 0).sort((a, b) => b[campo] - a[campo]);
  const total = somar(comValor, campo);
  const itens = comValor.slice(0, TOPO_RANKING).map((linha) => ({
    chave: linha.chave,
    rotulo: rotuloOrigem(linha),
    valor: linha[campo],
    clicavel: true,
  }));
  const resto = comValor.slice(TOPO_RANKING);
  if (resto.length > 0) {
    itens.push({
      chave: "__outros__",
      rotulo: `Outros (${resto.length} origens)`,
      valor: somar(resto, campo),
      clicavel: false,
    });
  }
  return { itens, total };
}

// A chave tem que casar com a do banco: minúsculas, sem espaços nas pontas.
function chaveDaOrigem(lead, nivel) {
  const valores = {
    source: lead.utm?.source,
    campaign: lead.utm?.campaign,
    content: lead.utm?.content,
    term: lead.utm?.term,
  };
  return (valores[nivel] || "").trim().toLowerCase();
}

// ---------- calendário de intervalo ----------

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const formatadorMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

function mesDoDia(iso) {
  return iso.slice(0, 7);
}

function mudarMes(mes, passo) {
  const [ano, numero] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, numero - 1 + passo, 1));
  return data.toISOString().slice(0, 7);
}

function celulasDoMes(mes) {
  const [ano, numero] = mes.split("-").map(Number);
  const vaziasAntes = new Date(Date.UTC(ano, numero - 1, 1)).getUTCDay();
  const totalDias = new Date(Date.UTC(ano, numero, 0)).getUTCDate();
  const celulas = Array.from({ length: vaziasAntes }, () => null);
  for (let dia = 1; dia <= totalDias; dia += 1) {
    celulas.push(`${mes}-${String(dia).padStart(2, "0")}`);
  }
  return celulas;
}

function rotuloMes(mes) {
  const [ano, numero] = mes.split("-").map(Number);
  const nome = formatadorMes.format(new Date(Date.UTC(ano, numero - 1, 1)));
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

// Clique no dia inicial, clique no final. O segundo clique já aplica o
// filtro e fecha — é o uso do dia a dia, no celular inclusive.
function CalendarioIntervalo({ de, ate, maximo, onEscolher, onFechar }) {
  const [mes, setMes] = useState(mesDoDia(de || maximo));
  const [inicioTemp, setInicioTemp] = useState("");
  const [diaSobre, setDiaSobre] = useState("");

  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  function escolherDia(dia) {
    if (!inicioTemp) {
      setInicioTemp(dia);
      return;
    }
    if (dia < inicioTemp) {
      setInicioTemp(dia);
      return;
    }
    onEscolher({ de: inicioTemp, ate: dia });
  }

  const fimPrevisto = inicioTemp && diaSobre > inicioTemp ? diaSobre : "";
  const inicioSelecionado = inicioTemp || de;
  const fimSelecionado = inicioTemp ? fimPrevisto : ate;

  return (
    <>
      <button
        type="button"
        aria-label="Fechar calendário"
        onClick={onFechar}
        className="fixed inset-0 z-40 cursor-default"
      />
      <div className="absolute right-0 top-full z-50 mt-2 w-[min(19rem,88vw)] rounded-2xl border border-line bg-surface p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Mês anterior"
            onClick={() => setMes(mudarMes(mes, -1))}
            className="rounded-lg border border-line p-1.5 text-ink-dim transition-colors hover:text-ink"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-medium text-ink">{rotuloMes(mes)}</span>
          <button
            type="button"
            aria-label="Próximo mês"
            disabled={mes >= mesDoDia(maximo)}
            onClick={() => setMes(mudarMes(mes, 1))}
            className="rounded-lg border border-line p-1.5 text-ink-dim transition-colors hover:text-ink disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center">
          {DIAS_SEMANA.map((letra, indice) => (
            <span key={`${letra}-${indice}`} className="py-1 text-[10px] font-medium uppercase text-ink-dim">
              {letra}
            </span>
          ))}
          {celulasDoMes(mes).map((dia, indice) => {
            if (!dia) return <span key={`vazio-${indice}`} />;
            const futuro = dia > maximo;
            const ehInicio = dia === inicioSelecionado;
            const ehFim = dia === fimSelecionado;
            const noMeio = inicioSelecionado && fimSelecionado && dia > inicioSelecionado && dia < fimSelecionado;
            const ponta = ehInicio || ehFim;
            return (
              <button
                key={dia}
                type="button"
                disabled={futuro}
                onClick={() => escolherDia(dia)}
                onMouseEnter={() => setDiaSobre(dia)}
                className={`rounded-lg py-1.5 text-xs tabular-nums transition-colors ${
                  ponta
                    ? "bg-emerald-brand font-semibold text-base"
                    : noMeio
                      ? "bg-emerald-brand/15 text-ink"
                      : futuro
                        ? "text-ink-dim/40"
                        : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                }`}
              >
                {Number(dia.slice(-2))}
              </button>
            );
          })}
        </div>

        <p className="mt-3 border-t border-line/60 pt-2.5 text-[11px] text-ink-dim">
          {inicioTemp
            ? `Início em ${diaCurto(inicioTemp)}. Agora escolha o último dia.`
            : "Clique no primeiro dia e depois no último."}
        </p>
      </div>
    </>
  );
}

// ---------- pedaços da tela ----------

function Variacao({ comparacao }) {
  if (!comparacao) return <p className="mt-1 text-[11px] text-ink-dim">sem base de comparação</p>;
  const { direcao, texto } = comparacao;
  const cor = direcao > 0 ? "text-green-300" : direcao < 0 ? "text-flame" : "text-ink-dim";
  const Icone = direcao > 0 ? TrendingUp : direcao < 0 ? TrendingDown : null;
  return (
    <p className={`mt-1 flex items-center gap-1 text-[11px] ${cor}`}>
      {Icone && <Icone size={12} />}
      {texto}
    </p>
  );
}

function CartaoKpi({ icone: Icone, rotulo, valor, apoio, comparacao, destaque = false }) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-4 sm:p-5 ${
        destaque ? "border-emerald-brand/40" : "border-line"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
          destaque ? "bg-emerald-brand/15 text-emerald-bright" : "bg-surface-raised text-ink-muted"
        }`}
      >
        <Icone size={18} />
      </span>
      <p className="mt-3 truncate font-display text-xl tracking-wide text-ink sm:mt-4 sm:text-2xl" title={String(valor)}>
        {valor}
      </p>
      <p className="mt-1 text-xs text-ink-dim">{rotulo}</p>
      {apoio && <p className="mt-0.5 truncate text-[11px] text-ink-muted">{apoio}</p>}
      <Variacao comparacao={comparacao} />
    </div>
  );
}

function Ranking({ titulo, descricao, ranking, destaque, onSelecionar }) {
  const maior = ranking.itens[0]?.valor || 1;

  return (
    <section className={`rounded-2xl border bg-surface p-4 sm:p-5 ${destaque ? "border-emerald-brand/40" : "border-line"}`}>
      <h2 className="text-sm font-semibold text-ink">{titulo}</h2>
      <p className="mt-0.5 text-xs text-ink-dim">{descricao}</p>

      {ranking.itens.length === 0 ? (
        <p className="mt-4 text-xs text-ink-dim">Nenhum lead nesse grupo no período.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {ranking.itens.map((item) => {
            const largura = Math.max(4, Math.round((item.valor / maior) * 100));
            const conteudo = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-xs text-ink" title={item.rotulo}>
                    {item.rotulo}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                    {item.valor}
                    <span className="ml-1.5 text-[11px] text-ink-dim">{porcentagem(item.valor, ranking.total)}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className={`h-full rounded-full ${destaque ? "bg-emerald-brand" : "bg-ink-muted/50"}`}
                    style={{ width: `${largura}%` }}
                  />
                </div>
              </>
            );

            return (
              <li key={item.chave}>
                {item.clicavel ? (
                  <button
                    type="button"
                    onClick={() => onSelecionar({ chave: item.chave, rotulo: item.rotulo })}
                    className="w-full rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface-raised"
                  >
                    {conteudo}
                  </button>
                ) : (
                  <div className="px-1 py-1">{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const COLUNAS_TABELA = [
  { chave: "origem", rotulo: "Origem", alinhamento: "text-left" },
  { chave: "total", rotulo: "Total", alinhamento: "text-right" },
  { chave: "acima30k", rotulo: "Acima de 30k", alinhamento: "text-right" },
  { chave: "ate30k", rotulo: "Até 30k", alinhamento: "text-right" },
  { chave: "naoInformado", rotulo: "Não informado", alinhamento: "text-right" },
  { chave: "percentualAcima", rotulo: "% acima de 30k", alinhamento: "text-right" },
];

function TabelaQualidade({ linhas, onSelecionar }) {
  const [ordem, setOrdem] = useState({ coluna: "acima30k", crescente: false });

  function ordenarPor(coluna) {
    setOrdem((atual) =>
      atual.coluna === coluna ? { coluna, crescente: !atual.crescente } : { coluna, crescente: false }
    );
  }

  const ordenadas = useMemo(() => {
    const copia = linhas.map((linha) => ({ ...linha, percentualAcima: porcentagem(linha.acima30k, linha.total) }));
    copia.sort((a, b) => {
      const valorA = ordem.coluna === "origem" ? rotuloOrigem(a).toLowerCase() : a[ordem.coluna];
      const valorB = ordem.coluna === "origem" ? rotuloOrigem(b).toLowerCase() : b[ordem.coluna];
      if (valorA === valorB) return b.total - a.total;
      const comparacao = valorA > valorB ? 1 : -1;
      return ordem.crescente ? comparacao : -comparacao;
    });
    return copia;
  }, [linhas, ordem]);

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Qualidade por origem</h2>
      <p className="mt-0.5 text-xs text-ink-dim">
        Quem traz volume e quem traz lead bom. Quanto mais laranja, maior a fatia acima de R$ 30 mil.
      </p>

      <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line/60">
              {COLUNAS_TABELA.map((coluna) => (
                <th key={coluna.chave} className={`px-3 py-2 ${coluna.alinhamento}`}>
                  <button
                    type="button"
                    onClick={() => ordenarPor(coluna.chave)}
                    className={`text-[11px] font-medium uppercase tracking-wide transition-colors hover:text-ink ${
                      ordem.coluna === coluna.chave ? "text-emerald-bright" : "text-ink-dim"
                    }`}
                  >
                    {coluna.rotulo}
                    {ordem.coluna === coluna.chave && (ordem.crescente ? " ↑" : " ↓")}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((linha) => (
              <tr
                key={linha.chave}
                onClick={() => onSelecionar({ chave: linha.chave, rotulo: rotuloOrigem(linha) })}
                className="cursor-pointer border-b border-line/40 transition-colors last:border-0 hover:bg-surface-raised"
              >
                <td className="max-w-[16rem] truncate px-3 py-2.5 text-ink" title={rotuloOrigem(linha)}>
                  {rotuloOrigem(linha)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">{linha.total}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink">{linha.acima30k}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">{linha.ate30k}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-dim">{linha.naoInformado}</td>
                <td className="px-3 py-2.5 text-right">
                  <span
                    className="inline-block min-w-[3.25rem] rounded-lg px-2 py-1 text-xs font-medium tabular-nums text-ink"
                    style={{ backgroundColor: `rgba(245, 165, 19, ${0.06 + (linha.percentualAcima / 100) * 0.54})` }}
                  >
                    {linha.percentualAcima}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GraficoDiario({ dias }) {
  const maior = Math.max(1, ...dias.map((d) => d.total));
  const passoRotulo = Math.ceil(dias.length / 10);

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Evolução diária</h2>
        <div className="flex items-center gap-3 text-[11px] text-ink-dim">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-brand" /> acima de 30k
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-ink-muted/50" /> até 30k
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-line" /> não informado
          </span>
        </div>
      </div>

      <div className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-[20rem] items-end gap-1.5" style={{ height: "10rem" }}>
          {dias.map((dia) => (
            <div key={dia.dia} className="flex h-full min-w-[0.75rem] flex-1 flex-col justify-end gap-px" title={`${diaCurto(dia.dia)}: ${dia.total} lead(s)`}>
              <div className="w-full rounded-t-sm bg-emerald-brand" style={{ height: `${(dia.acima30k / maior) * 100}%` }} />
              <div className="w-full bg-ink-muted/50" style={{ height: `${(dia.ate30k / maior) * 100}%` }} />
              <div className="w-full bg-line" style={{ height: `${(dia.naoInformado / maior) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex min-w-[20rem] gap-1.5">
          {dias.map((dia, indice) => (
            <span key={dia.dia} className="min-w-[0.75rem] flex-1 text-center text-[10px] text-ink-dim">
              {indice % passoRotulo === 0 ? diaCurto(dia.dia) : ""}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainelLateral({ origem, leads, intervalo, onFechar, onAbrirLead }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={onFechar}>
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-line bg-surface"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line/60 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-ink-dim">Leads da origem</p>
            <p className="truncate font-display text-base tracking-wide text-ink" title={origem.rotulo}>
              {origem.rotulo}
            </p>
            <p className="mt-0.5 text-xs text-ink-dim">
              {diaCurto(intervalo.inicio)} a {diaCurto(intervalo.fim)} · {leads.length} lead(s)
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="shrink-0 rounded-full border border-line p-1.5 text-ink-dim transition-colors hover:text-ink"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {leads.length === 0 ? (
            <p className="text-sm text-ink-dim">Nenhum lead dessa origem no período.</p>
          ) : (
            <ul className="space-y-2">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => onAbrirLead(lead)}
                    className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-raised px-3.5 py-3 text-left transition-colors hover:border-emerald-brand/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{lead.nome}</p>
                      <p className="truncate text-xs text-ink-dim">
                        {[lead.nomeNegocio, lead.cidade].filter(Boolean).join(" · ") || "sem negócio informado"}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-muted">
                        <span>{lead.faturamentoMensal || "faturamento não informado"}</span>
                        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-dim">
                          {ROTULO_STATUS[lead.status] || lead.status}
                        </span>
                      </p>
                    </div>
                    <ChevronRight size={15} className="shrink-0 text-ink-dim" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function Esqueleto() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[8.5rem] rounded-2xl border border-line bg-surface" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-2xl border border-line bg-surface" />
        ))}
      </div>
      <div className="h-56 rounded-2xl border border-line bg-surface" />
    </div>
  );
}

// ---------- tela ----------

export default function AnaliseOrigem({ leads = [], onAbrirLead }) {
  const inicial = lerEstadoDaUrl();
  const [periodo, setPeriodo] = useState(inicial.periodo);
  const [nivel, setNivel] = useState(inicial.nivel);
  const [de, setDe] = useState(inicial.de || somarDias(diaEmSaoPaulo(), -6));
  const [ate, setAte] = useState(inicial.ate || diaEmSaoPaulo());
  const [dados, setDados] = useState({ atual: [], anterior: [], diario: [] });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [origemSelecionada, setOrigemSelecionada] = useState(null);
  const [calendarioAberto, setCalendarioAberto] = useState(false);

  const intervalo = useMemo(() => intervaloDoPeriodo(periodo, de, ate), [periodo, de, ate]);
  const mostrarDiario = periodo !== "hoje" && periodo !== "ontem";

  useEffect(() => {
    gravarEstadoNaUrl({ periodo, nivel, de, ate });
  }, [periodo, nivel, de, ate]);

  useEffect(() => {
    let cancelado = false;
    const anterior = intervaloAnterior(intervalo);
    setCarregando(true);
    setErro("");

    Promise.all([
      fetchAnalisePorOrigem({ ...intervalo, nivel }),
      fetchAnalisePorOrigem({ ...anterior, nivel }),
      mostrarDiario ? fetchAnalisePorDia(intervalo) : Promise.resolve([]),
    ])
      .then(([atual, anteriores, diario]) => {
        if (cancelado) return;
        setDados({ atual, anterior: anteriores, diario });
        setCarregando(false);
      })
      .catch(() => {
        if (cancelado) return;
        setErro("Não foi possível carregar a análise agora. Tenta de novo em instantes.");
        setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [intervalo.inicio, intervalo.fim, nivel, mostrarDiario]);

  const totais = useMemo(
    () => ({
      total: somar(dados.atual, "total"),
      acima30k: somar(dados.atual, "acima30k"),
      ate30k: somar(dados.atual, "ate30k"),
      naoInformado: somar(dados.atual, "naoInformado"),
    }),
    [dados.atual]
  );

  const totaisAnteriores = useMemo(
    () => ({
      total: somar(dados.anterior, "total"),
      acima30k: somar(dados.anterior, "acima30k"),
      ate30k: somar(dados.anterior, "ate30k"),
    }),
    [dados.anterior]
  );

  const melhorOrigem = useMemo(() => {
    const ordenadas = dados.atual.filter((l) => l.acima30k > 0).sort((a, b) => b.acima30k - a.acima30k);
    return ordenadas[0] || null;
  }, [dados.atual]);

  const melhorOrigemAntes = useMemo(() => {
    if (!melhorOrigem) return 0;
    return dados.anterior.find((l) => l.chave === melhorOrigem.chave)?.acima30k || 0;
  }, [dados.anterior, melhorOrigem]);

  // Dias sem lead nenhum não voltam do banco, mas o gráfico precisa deles.
  const diasDoGrafico = useMemo(() => {
    if (!mostrarDiario) return [];
    const porDia = new Map(dados.diario.map((d) => [d.dia, d]));
    const dias = [];
    for (let i = 0; i <= diasEntre(intervalo.inicio, intervalo.fim); i += 1) {
      const dia = somarDias(intervalo.inicio, i);
      dias.push(porDia.get(dia) || { dia, total: 0, acima30k: 0, ate30k: 0, naoInformado: 0 });
    }
    return dias;
  }, [dados.diario, intervalo, mostrarDiario]);

  // O painel lateral é o único lugar com dado pessoal, e usa os leads que a
  // aba Leads já carregou — mesma permissão, nada novo exposto.
  const leadsDaOrigem = useMemo(() => {
    if (!origemSelecionada) return [];
    return leads
      .filter((lead) => {
        const dia = diaEmSaoPaulo(new Date(lead.criadoEmIso || lead.criadoEm));
        if (dia < intervalo.inicio || dia > intervalo.fim) return false;
        return chaveDaOrigem(lead, nivel) === origemSelecionada.chave;
      })
      .sort((a, b) => (a.criadoEmIso < b.criadoEmIso ? 1 : -1));
  }, [origemSelecionada, leads, nivel, intervalo]);

  const rankingGeral = useMemo(() => montarRanking(dados.atual, "total"), [dados.atual]);
  const rankingAcima = useMemo(() => montarRanking(dados.atual, "acima30k"), [dados.atual]);
  const rankingAte = useMemo(() => montarRanking(dados.atual, "ate30k"), [dados.atual]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-[14rem] flex-1">
          <h1 className="font-display text-2xl tracking-wide text-ink">Análise de Anúncios e Origem</h1>
          <p className="mt-1 text-sm text-ink-muted">
            De onde vêm os leads e quais origens trazem negócio acima de R$ 30 mil por mês.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value);
              setCalendarioAberto(e.target.value === "personalizado");
            }}
            aria-label="Período"
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-emerald-brand/60 focus:outline-none"
          >
            {PERIODOS.map((p) => (
              <option key={p.chave} value={p.chave} className="bg-surface text-ink">
                {p.rotulo}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCalendarioAberto((aberto) => !aberto)}
              aria-expanded={calendarioAberto}
              className={`flex items-center gap-2 rounded-xl border bg-surface px-3 py-2 text-sm transition-colors ${
                periodo === "personalizado"
                  ? "border-emerald-brand/40 text-ink"
                  : "border-line text-ink-muted hover:text-ink"
              }`}
            >
              <CalendarDays size={15} />
              {periodo === "personalizado"
                ? `${diaCurto(intervalo.inicio)} a ${diaCurto(intervalo.fim)}`
                : "Escolher datas"}
            </button>

            {calendarioAberto && (
              <CalendarioIntervalo
                de={periodo === "personalizado" ? de : ""}
                ate={periodo === "personalizado" ? ate : ""}
                maximo={diaEmSaoPaulo()}
                onFechar={() => setCalendarioAberto(false)}
                onEscolher={({ de: novoDe, ate: novoAte }) => {
                  setDe(novoDe);
                  setAte(novoAte);
                  setPeriodo("personalizado");
                  setCalendarioAberto(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Nível da origem" className="flex rounded-xl border border-line bg-surface p-1">
          {NIVEIS.map((n) => (
            <button
              key={n.chave}
              type="button"
              aria-pressed={nivel === n.chave}
              onClick={() => setNivel(n.chave)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                nivel === n.chave ? "bg-emerald-brand text-base" : "text-ink-muted hover:text-ink"
              }`}
            >
              {n.rotulo}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-dim">
          {diaCurto(intervalo.inicio)} a {diaCurto(intervalo.fim)} · agrupado por{" "}
          {NIVEIS.find((n) => n.chave === nivel)?.rotulo.toLowerCase()}
        </p>
      </div>

      {erro && <div className="mb-6 rounded-xl border border-flame/30 bg-flame/5 px-4 py-3 text-sm text-flame">{erro}</div>}

      {carregando && <Esqueleto />}

      {!carregando && !erro && totais.total === 0 && (
        <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-lg tracking-wide text-ink">Nenhum lead nesse período</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Escolha um intervalo maior no filtro de período, ou confira mais tarde — os leads aparecem aqui assim que
            chegam pelo formulário.
          </p>
        </div>
      )}

      {!carregando && !erro && totais.total > 0 && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CartaoKpi
              icone={Users}
              rotulo="Total de leads"
              valor={totais.total}
              apoio={`${totais.naoInformado} sem faturamento informado`}
              comparacao={compararComAnterior(totais.total, totaisAnteriores.total)}
            />
            <CartaoKpi
              icone={Target}
              rotulo="Faturam acima de R$ 30 mil"
              valor={totais.acima30k}
              apoio={`${porcentagem(totais.acima30k, totais.total)}% do total`}
              comparacao={compararComAnterior(totais.acima30k, totaisAnteriores.acima30k)}
              destaque
            />
            <CartaoKpi
              icone={Users}
              rotulo="Faturam até R$ 30 mil"
              valor={totais.ate30k}
              apoio={`${porcentagem(totais.ate30k, totais.total)}% do total`}
              comparacao={compararComAnterior(totais.ate30k, totaisAnteriores.ate30k)}
            />
            <CartaoKpi
              icone={Trophy}
              rotulo="Melhor origem acima de 30k"
              valor={melhorOrigem ? rotuloOrigem(melhorOrigem) : "—"}
              apoio={melhorOrigem ? `${melhorOrigem.acima30k} lead(s) acima de 30k` : "ninguém acima de 30k no período"}
              comparacao={melhorOrigem ? compararComAnterior(melhorOrigem.acima30k, melhorOrigemAntes) : null}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Ranking
              titulo="Origens que mais trouxeram leads"
              descricao="Volume total no período"
              ranking={rankingGeral}
              destaque={false}
              onSelecionar={setOrigemSelecionada}
            />
            <Ranking
              titulo="Origens que mais trouxeram leads acima de 30k"
              descricao="É aqui que está o dinheiro"
              ranking={rankingAcima}
              destaque
              onSelecionar={setOrigemSelecionada}
            />
            <Ranking
              titulo="Origens que mais trouxeram leads até 30k"
              descricao="Volume de ticket menor"
              ranking={rankingAte}
              destaque={false}
              onSelecionar={setOrigemSelecionada}
            />
          </div>

          <TabelaQualidade linhas={dados.atual} onSelecionar={setOrigemSelecionada} />

          {mostrarDiario && diasDoGrafico.length > 0 && <GraficoDiario dias={diasDoGrafico} />}
        </div>
      )}

      {origemSelecionada && (
        <PainelLateral
          origem={origemSelecionada}
          leads={leadsDaOrigem}
          intervalo={intervalo}
          onFechar={() => setOrigemSelecionada(null)}
          onAbrirLead={(lead) => {
            setOrigemSelecionada(null);
            onAbrirLead?.(lead);
          }}
        />
      )}
    </div>
  );
}
