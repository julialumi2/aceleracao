function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function billingAlertMessage(client, invoice) {
  return `Olá, ${client.nome}! Notamos que o boleto no valor de R$ ${invoice.valor.toFixed(
    2
  )}, com vencimento em ${formatDate(invoice.vencimento)}, ainda está em aberto. Pode verificar e regularizar quando possível? Qualquer dúvida, estamos à disposição 🙏`;
}

export function intensityAlertMessage(client) {
  return `Olá, ${client.nome}! Passando para saber como está o movimento da loja essa semana. Nosso time notou uma queda no engajamento das redes sociais — vamos marcar uma call rápida para ajustar a estratégia juntos?`;
}
