function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// stage vem de alertStage() em lib/invoices.js: "antes" (2 dias antes),
// "hoje" (dia do vencimento), "depois" (2 dias depois) ou undefined
// (usa o texto de atraso genérico, pra quando é disparado fora desses 3 dias).
export function billingAlertMessage(client, invoice, stage) {
  const valor = invoice.valor.toFixed(2);
  const vencimento = formatDate(invoice.vencimento);

  if (stage === "antes") {
    return `Olá, ${client.nome}! Passando pra lembrar que o boleto no valor de R$ ${valor} vence em 2 dias, no dia ${vencimento}. Qualquer dúvida, estamos à disposição 🙏`;
  }
  if (stage === "hoje") {
    return `Olá, ${client.nome}! Hoje (${vencimento}) é o vencimento do boleto no valor de R$ ${valor}. Fica de olho pra não perder a data 🙏`;
  }
  if (stage === "depois") {
    return `Olá, ${client.nome}! O boleto no valor de R$ ${valor} venceu há 2 dias (${vencimento}) e ainda consta em aberto. Pode verificar e regularizar quando possível? Qualquer dúvida, estamos à disposição 🙏`;
  }
  return `Olá, ${client.nome}! Notamos que o boleto no valor de R$ ${valor}, com vencimento em ${vencimento}, ainda está em aberto. Pode verificar e regularizar quando possível? Qualquer dúvida, estamos à disposição 🙏`;
}

export function intensityAlertMessage(client) {
  return `Olá, ${client.nome}! Passando para saber como está o movimento da loja essa semana. Nosso time notou uma queda no engajamento das redes sociais — vamos marcar uma call rápida para ajustar a estratégia juntos?`;
}

export function leadFirstContactMessage(lead) {
  return `Olá, ${lead.nome}! Vi que você preencheu nosso formulário de aceleração de delivery. Podemos conversar rapidinho sobre o seu restaurante?`;
}
