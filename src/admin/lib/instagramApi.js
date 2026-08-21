import { supabase } from "../../lib/supabase.js";

const ASAAS_PROXY_URL = import.meta.env.VITE_ASAAS_PROXY_URL || "http://localhost:3000";

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sessão expirada — faça login de novo.");
  return { Authorization: `Bearer ${session.access_token}` };
}

// Link público (sem login) que o cliente abre pra autorizar o acesso ao
// próprio Instagram — a equipe manda isso por WhatsApp.
export function linkConexaoInstagram(restaurantId) {
  const host = window.location.hostname.replace(/^portal\./, "");
  const origem = host === window.location.hostname ? window.location.origin : `https://${host}`;
  return `${origem}/conectar-instagram?c=${restaurantId}`;
}

export async function statusInstagram(restaurantId) {
  const headers = await authHeaders();
  const response = await fetch(`${ASAAS_PROXY_URL}/instagram/status?restaurantId=${restaurantId}`, { headers });
  if (!response.ok) throw new Error("Não foi possível checar a conexão do Instagram.");
  return response.json();
}

export async function metricasInstagram(restaurantId) {
  const headers = await authHeaders();
  const response = await fetch(`${ASAAS_PROXY_URL}/instagram/metricas?restaurantId=${restaurantId}`, { headers });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Não foi possível buscar as métricas.");
  return data;
}
