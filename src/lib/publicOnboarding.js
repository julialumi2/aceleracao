// Formulário público de onboarding (cadastro.aceleracao.artesanosburger.com.br)
// — pra quem já fechou a mentoria. Passa pelo asaas-proxy (não insere
// direto no Supabase) porque o servidor precisa checar se já existe um
// cliente com o mesmo telefone/empresa — ex: um lead que a equipe já
// converteu manualmente — e mesclar os dados nele em vez de duplicar o
// cadastro. Cobrança, Asaas e cancelamento continuam só configuráveis
// pela equipe, nunca por aqui.
const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

export async function submitPublicOnboarding(dados) {
  const response = await fetch(`${ASAAS_PROXY_URL}/onboarding/cadastro-publico`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Não foi possível enviar o cadastro agora.");
  }

  return response.json();
}
