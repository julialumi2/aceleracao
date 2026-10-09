const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

// Celular brasileiro: DDD + 8 ou 9 dígitos, com ou sem o 55 na frente.
export function telefoneValido(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return true;
  return digitos.startsWith("55") && (digitos.length === 12 || digitos.length === 13);
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor || "").trim());
}

// Manda o lead pro CRM de WhatsApp da equipe. Quem fala com a Unnichat é
// o asaas-proxy, que guarda a chave e a URL do webhook — aqui a chamada é
// só um aviso, disparado depois que o lead já foi gravado. Se falhar, a
// pessoa vê a mesma tela de sucesso.
export function enviarLeadParaUnnichat({ nome, email, telefone }) {
  fetch(`${ASAAS_PROXY_URL}/unnichat/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ nome, email, telefone }),
  }).catch(() => {});
}
