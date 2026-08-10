// Gera um link wa.me para disparo manual — sem custo de API, a equipe
// abre o link e envia com um clique. Trocar por integração via Meta Cloud
// API / Twilio quando a automação entrar em produção.
export function buildWhatsAppLink(phone, message) {
  const digits = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
