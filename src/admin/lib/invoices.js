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
