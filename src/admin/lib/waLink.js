// Gera um link wa.me para disparo manual — sem custo de API, a equipe
// abre o link e envia com um clique. Trocar por integração via Meta Cloud
// API / Twilio quando a automação entrar em produção.
export function buildWhatsAppLink(phone, message) {
  let digits = (phone || "").replace(/\D/g, "");
  // Telefones cadastrados aqui são só DDD + número (10 ou 11 dígitos),
  // sem o código do Brasil. Sem prefixar 55, o wa.me lê o DDD como se
  // fosse o código de outro país (ex: DDD 51 vira Peru).
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
