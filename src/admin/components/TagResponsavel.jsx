import { useEffect, useRef, useState } from "react";
import { UserPlus, Check } from "lucide-react";

// Uma cor fixa por pessoa, sorteada a partir do id — a mesma pessoa é
// sempre da mesma cor, em qualquer tela, sem ninguém configurar nada.
// Ficam fora do âmbar e do vermelho, que no painel querem dizer
// "ação" e "risco".
const CORES = [
  "border-info/40 bg-info/10 text-info",
  "border-ok/40 bg-ok/10 text-ok",
  "border-[#B08CF7]/40 bg-[#B08CF7]/10 text-[#B08CF7]",
  "border-[#F78CC4]/40 bg-[#F78CC4]/10 text-[#F78CC4]",
  "border-[#5FD0D8]/40 bg-[#5FD0D8]/10 text-[#5FD0D8]",
  "border-[#C3D16A]/40 bg-[#C3D16A]/10 text-[#C3D16A]",
];

export function corDaPessoa(id = "") {
  let soma = 0;
  for (const letra of String(id)) soma += letra.charCodeAt(0);
  return CORES[soma % CORES.length];
}

export function primeiroNome(nome = "") {
  return nome.trim().split(/\s+/)[0] || nome;
}

export default function TagResponsavel({ lead, equipe = [], souAdmin = false, onDefinir, compacto = false }) {
  const [aberto, setAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const caixaRef = useRef(null);

  const responsavel = equipe.find((m) => m.id && m.id === lead.responsavelId);
  // Só quem atende lead entra como opção (hoje: Douglas e Leonardo). Se
  // ninguém estiver marcado no banco, cai pra equipe inteira em vez de
  // mostrar uma lista vazia.
  const candidatos = equipe.filter((m) => m.atendeLeads);
  const opcoes = candidatos.length > 0 ? candidatos : equipe;
  const travado = Boolean(lead.responsavelId) && !souAdmin;

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento) {
      if (!caixaRef.current?.contains(evento.target)) fechar();
    }
    function aoTeclar(evento) {
      if (evento.key === "Escape") fechar();
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
    setConfirmando(null);
    setErro("");
  }

  async function confirmar() {
    if (salvando) return;
    setSalvando(true);
    setErro("");
    try {
      await onDefinir(lead, confirmando);
      fechar();
    } catch (err) {
      setErro(err.message || "Não foi possível marcar agora.");
    } finally {
      setSalvando(false);
    }
  }

  // Já marcado e sem permissão pra trocar: só a etiqueta.
  if (travado && responsavel) {
    return (
      <span
        title={`Falou com o lead${lead.responsavelEm ? ` em ${new Date(lead.responsavelEm).toLocaleDateString("pt-BR")}` : ""} · só um administrador pode trocar`}
        className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-[3px] text-[11.5px] font-medium ${corDaPessoa(responsavel.id)}`}
      >
        <span className="h-[5px] w-[5px] rounded-full bg-current" />
        {primeiroNome(responsavel.name)}
      </span>
    );
  }

  // Marcado, mas o id não está na lista da equipe (pessoa removida).
  if (travado) {
    return <span className="text-[11.5px] text-ink-dim">responsável removido</span>;
  }

  return (
    <span className="relative inline-flex" ref={caixaRef}>
      <button
        type="button"
        onClick={() => (aberto ? fechar() : setAberto(true))}
        aria-expanded={aberto}
        className={
          responsavel
            ? `inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-[3px] text-[11.5px] font-medium transition-opacity hover:opacity-80 ${corDaPessoa(responsavel.id)}`
            : "inline-flex items-center gap-1.5 rounded-[7px] border border-dashed border-line-forte px-2 py-[3px] text-[11.5px] font-medium text-ink-dim transition-colors hover:border-emerald-brand/50 hover:text-ink"
        }
      >
        {responsavel ? (
          <>
            <span className="h-[5px] w-[5px] rounded-full bg-current" />
            {primeiroNome(responsavel.name)}
          </>
        ) : (
          <>
            <UserPlus size={12} />
            {compacto ? "Quem falou?" : "Marcar quem falou"}
          </>
        )}
      </button>

      {aberto && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-60 rounded-[12px] border border-line bg-surface p-1.5 shadow-2xl">
          {!confirmando && (
            <>
              <p className="px-2 pb-1.5 pt-1 text-[11px] text-ink-dim">
                {responsavel ? "Trocar o responsável" : "Quem falou com esse lead?"}
              </p>
              <div className="max-h-56 overflow-y-auto">
                {opcoes.map((membro) => (
                  <button
                    key={membro.id || membro.email}
                    type="button"
                    onClick={() => setConfirmando(membro)}
                    disabled={!membro.id}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink disabled:opacity-40"
                  >
                    <span className={`h-2 w-2 rounded-full border ${corDaPessoa(membro.id)}`} />
                    <span className="truncate">{membro.name}</span>
                    {membro.id === lead.responsavelId && <Check size={13} className="ml-auto text-ink-dim" />}
                  </button>
                ))}
                {opcoes.length === 0 && <p className="px-2 py-3 text-[12px] text-ink-dim">Ninguém cadastrado na equipe.</p>}
              </div>
            </>
          )}

          {confirmando && (
            <div className="p-2">
              <p className="text-[13px] font-medium text-ink">
                Marcar {primeiroNome(confirmando.name)} como quem falou?
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
                Depois de confirmar, essa marcação <strong className="font-semibold text-ink">não pode ser alterada</strong> —
                só Julia ou Guilherme conseguem trocar.
              </p>
              {erro && <p className="mt-2 text-[11.5px] text-flame">{erro}</p>}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={confirmar}
                  disabled={salvando}
                  className="inline-flex h-[30px] items-center rounded-[10px] bg-emerald-brand px-3 text-[12.5px] font-semibold text-base transition-colors hover:bg-emerald-bright disabled:opacity-50"
                >
                  {salvando ? "Marcando..." : "Tenho certeza"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(null)}
                  className="inline-flex h-[30px] items-center rounded-[10px] px-2.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
