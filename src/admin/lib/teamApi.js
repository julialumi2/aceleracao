import { supabase } from "../../lib/supabase.js";

// Mesmo serviço do asaas-proxy — também expõe a criação de acesso de
// equipe (via Supabase Admin API, chave que só existe no servidor).
const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

// Cria o login de um novo integrante da equipe no Supabase Auth de
// verdade (via asaas-proxy). Devolve a senha temporária gerada pro
// servidor — repasse pra pessoa por um canal seguro, ela troca depois em
// Configurações → Trocar senha.
export async function criarMembroEquipe({ nome, email, cargo }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada — faça login de novo.");

  const response = await fetch(`${ASAAS_PROXY_URL}/admin/membros`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ nome, email, cargo }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível criar o acesso.");
  }

  return data;
}

// Lista real da equipe (tabela staff_members), pra não depender mais de
// um array fixo no código que "esquecia" quem era criado depois.
export async function fetchMembrosEquipe() {
  const { data, error } = await supabase.from("staff_members").select("nome, email, cargo").order("created_at");
  if (error) throw error;
  return (data || []).map((m) => ({ name: m.nome, email: m.email, role: m.cargo || "Equipe" }));
}
