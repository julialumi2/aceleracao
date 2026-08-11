// Regra combinada: a data informada decide o vencimento da recorrência.
//
// - Já pagou (ou a data informada não é futura): a cobrança seguinte só
//   aparece no mesmo dia do MÊS QUE VEM — não cobra de novo o que já
//   foi pago.
// - Ainda não pagou e a data é futura: essa própria data é a primeira
//   cobrança da recorrência.
//
// Ex.: pagou dia 09 ou 10 (hoje/ontem) -> recorrência todo dia 09/10,
// a partir do mês que vem. Vai pagar amanhã dia 11 -> recorrência todo
// dia 11, a partir de amanhã.
export function calcularProximaCobranca(dataInformada, jaPago) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const data = new Date(`${dataInformada}T00:00:00`);

  if (jaPago || data <= hoje) {
    const proximoMes = new Date(data);
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    return proximoMes.toISOString().slice(0, 10);
  }

  return dataInformada;
}

export function diaDoVencimento(dataInformada) {
  return new Date(`${dataInformada}T00:00:00`).getDate();
}
