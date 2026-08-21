import { supabase } from "../../lib/supabase.js";

// URL pública do asaas-proxy — mesmo serviço que já recebe o webhook do
// Asaas, agora também usado pelo painel pra criar cliente/assinatura.
const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

// Cria o cliente e a(s) assinatura(s) recorrente(s) no Asaas de verdade
// (via asaas-proxy, que guarda a chave de API no servidor). Lança erro
// com mensagem legível se a integração não estiver configurada ou se o
// Asaas recusar os dados.
export async function criarAssinaturaAsaas({
  nome,
  cnpj,
  email,
  telefone,
  valor,
  proximaCobrancaEm,
  periodicidade,
  valor2,
  proximaCobrancaEm2,
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada — faça login de novo.");

  const response = await fetch(`${ASAAS_PROXY_URL}/asaas/assinatura-recorrente`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ nome, cnpj, email, telefone, valor, proximaCobrancaEm, periodicidade, valor2, proximaCobrancaEm2 }),
  });

  const data = await response.json().catch(() => null);

  if (response.status === 503) {
    throw new Error("Integração com o Asaas ainda não foi configurada no servidor.");
  }
  if (!response.ok && response.status !== 207) {
    throw new Error(data?.error || "Não foi possível criar a assinatura no Asaas.");
  }

  return data;
}
