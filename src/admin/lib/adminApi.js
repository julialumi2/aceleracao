import { supabase } from "../../lib/supabase.js";

// Chamadas prontas para o Supabase local — usadas em "melhor esforço"
// (best-effort): se a instância não estiver de pé, a tela continua
// funcionando com o estado local (ver mockData.js).

export async function updateContractStatus(restaurantId, status) {
  const { error } = await supabase
    .from("contracts")
    .upsert({ restaurant_id: restaurantId, status, signed_at: status === "assinado" ? new Date().toISOString() : null });
  if (error) throw error;
}

export async function updateInvoiceStatus(restaurantId, invoice) {
  const { error } = await supabase.from("invoices").upsert({
    restaurant_id: restaurantId,
    valor: invoice.valor,
    vencimento: invoice.vencimento,
    status: invoice.status,
  });
  if (error) throw error;
}

export async function saveIntensityCheck(restaurantId, { status, observacao }) {
  const { error } = await supabase.from("intensity_checks").insert({
    restaurant_id: restaurantId,
    status,
    observacao,
    origem: "manual",
  });
  if (error) throw error;
}

export async function updateLeadStatus(leadId, status) {
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw error;
}
