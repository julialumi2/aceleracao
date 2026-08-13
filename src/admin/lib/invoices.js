// Helpers pra trabalhar com o array de boletos de um cliente.

export function sortByVencimento(boletos) {
  return [...boletos].sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
}

// "Boleto atual" pra exibir em resumos (lista de clientes, dashboard):
// prioriza atrasado mais antigo, depois pendente mais próximo, depois o pago mais recente.
export function currentInvoice(boletos) {
  if (!boletos || boletos.length === 0) return null;
  const atrasados = sortByVencimento(boletos.filter((b) => b.status === "atrasado"));
  if (atrasados.length) return atrasados[0];
  const pendentes = sortByVencimento(boletos.filter((b) => b.status === "pendente"));
  if (pendentes.length) return pendentes[0];
  const pagos = sortByVencimento(boletos.filter((b) => b.status === "pago")).reverse();
  return pagos[0] || boletos[0];
}

export const ALERT_STAGE_LABELS = {
  antes: "Vence em 2 dias",
  hoje: "Vence hoje",
  depois: "Venceu há 2 dias",
};

// Em quais dos 3 pontos de contato (2 dias antes, no dia, 2 dias depois
// do vencimento) esse boleto está hoje — ou null se não é dia de alertar.
// Boleto pago nunca precisa de lembrete.
export function alertStage(boleto) {
  if (!boleto || boleto.status === "pago") return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(`${boleto.vencimento}T00:00:00`);
  const diffDias = Math.round((vencimento - hoje) / (1000 * 60 * 60 * 24));
  if (diffDias === 2) return "antes";
  if (diffDias === 0) return "hoje";
  if (diffDias === -2) return "depois";
  return null;
}
