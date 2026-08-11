import { supabase } from "../../lib/supabase.js";

// ---------- Leitura ----------

export async function fetchClients() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, contracts(*), contract_events(*), invoices(*), intensity_checks(*)")
    .is("arquivado_em", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRestaurantRow);
}

export async function fetchArchivedClients() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, contracts(*), contract_events(*), invoices(*), intensity_checks(*)")
    .not("arquivado_em", "is", null)
    .order("arquivado_em", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRestaurantRow);
}

export async function fetchLeads() {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapLeadRow);
}

function mapRestaurantRow(row) {
  // `contracts` é 1:1 (restaurant_id é UNIQUE), então o PostgREST embute
  // como objeto único, não array — diferente de invoices/intensity_checks/
  // contract_events, que são de verdade 1:muitos.
  const contract = row.contracts;
  const historicoIntensidade = [...(row.intensity_checks || [])]
    .sort((a, b) => new Date(a.checked_at) - new Date(b.checked_at))
    .map((c) => ({
      id: c.id,
      data: c.checked_at.slice(0, 10),
      status: c.status,
      observacao: c.observacao || "",
      mensagemEnviada: c.mensagem_enviada,
    }));
  const ultimaChecagem = historicoIntensidade[historicoIntensidade.length - 1];

  return {
    id: row.id,
    nome: row.nome,
    cnpj: row.cnpj || "",
    cep: row.cep || "",
    telefone: row.telefone || "",
    email: row.email || "",
    cardapioUrl: row.cardapio_url || "",
    saude: row.saude || "laranja",
    arquivadoEm: row.arquivado_em || null,
    cobrancaRecorrente: {
      valor: row.valor_recorrente != null ? Number(row.valor_recorrente) : null,
      diaVencimento: row.dia_vencimento_recorrente,
      proximaCobrancaEm: row.proxima_cobranca_em,
      configuradaEm: row.cobranca_configurada_em,
      asaasCustomerId: row.asaas_customer_id,
      asaasSubscriptionId: row.asaas_subscription_id,
    },
    contrato: {
      status: contract?.status || "pendente",
      documentoUrl: contract?.clicksign_document_url || "",
      assinadoEm: contract?.signed_at ? contract.signed_at.slice(0, 10) : null,
      historico: [...(row.contract_events || [])]
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .map((e) => ({ id: e.id, data: e.data, evento: e.evento })),
    },
    boletos: (row.invoices || []).map((inv) => ({
      id: inv.id,
      valor: Number(inv.valor),
      vencimento: inv.vencimento,
      status: inv.status,
      alertaEnviadoEm: inv.alerta_enviado_em,
    })),
    intensidade: {
      status: ultimaChecagem?.status || "ativo",
      observacao: ultimaChecagem?.observacao || "",
      atualizadoEm: ultimaChecagem?.data || null,
      historico: historicoIntensidade,
    },
  };
}

function mapLeadRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone || "",
    origem: row.origem,
    status: row.status,
    criadoEm: row.created_at.slice(0, 10),
  };
}

// ---------- Cliente: campos simples ----------

const CLIENT_FIELD_MAP = {
  nome: "nome",
  cnpj: "cnpj",
  cep: "cep",
  telefone: "telefone",
  email: "email",
  cardapioUrl: "cardapio_url",
  saude: "saude",
};

export async function updateClientFields(id, fields) {
  const payload = {};
  for (const [key, column] of Object.entries(CLIENT_FIELD_MAP)) {
    if (key in fields) payload[column] = fields[key];
  }
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from("restaurants").update(payload).eq("id", id);
  if (error) throw error;
}

// ---------- Cobrança recorrente ----------
// Dois casos:
// 1. Cliente novo: só grava a decisão (valor + dia calculado a partir da
//    data informada). A criação da assinatura no Asaas em si acontece
//    numa Edge Function separada — a chave de API não pode ficar no
//    navegador. asaas_customer_id/asaas_subscription_id ficam nulos até
//    essa parte estar ligada.
// 2. Cliente que já tem assinatura no Asaas (ex.: base antiga sendo
//    importada): não cria nada novo, só vincula os IDs que já existem lá
//    — evita duplicar cobrança de quem já paga.
export async function setRecurringBilling(id, { valor, diaVencimento, proximaCobrancaEm, asaasCustomerId, asaasSubscriptionId }) {
  const payload = {
    valor_recorrente: valor,
    dia_vencimento_recorrente: diaVencimento,
    proxima_cobranca_em: proximaCobrancaEm,
    cobranca_configurada_em: new Date().toISOString(),
  };
  if (asaasCustomerId) payload.asaas_customer_id = asaasCustomerId;
  if (asaasSubscriptionId) payload.asaas_subscription_id = asaasSubscriptionId;

  const { error } = await supabase.from("restaurants").update(payload).eq("id", id);
  if (error) throw error;
}

// ---------- Contrato ----------

export async function setContractStatus(restaurantId, status) {
  const signed_at = status === "assinado" ? new Date().toISOString() : null;
  const { error } = await supabase
    .from("contracts")
    .upsert({ restaurant_id: restaurantId, status, signed_at }, { onConflict: "restaurant_id" });
  if (error) throw error;

  const evento = status === "assinado" ? "Contrato assinado pelo cliente" : "Status marcado como pendente";
  const { data, error: eventError } = await supabase
    .from("contract_events")
    .insert({ restaurant_id: restaurantId, evento })
    .select()
    .single();
  if (eventError) throw eventError;
  return { id: data.id, data: data.data, evento: data.evento };
}

export async function setContractDocumentUrl(restaurantId, url) {
  const { error } = await supabase
    .from("contracts")
    .upsert({ restaurant_id: restaurantId, clicksign_document_url: url }, { onConflict: "restaurant_id" });
  if (error) throw error;
}

// ---------- Cobrança ----------

export async function addInvoice(restaurantId, { valor, vencimento }) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({ restaurant_id: restaurantId, valor, vencimento, status: "pendente" })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, valor: Number(data.valor), vencimento: data.vencimento, status: data.status, alertaEnviadoEm: data.alerta_enviado_em };
}

export async function updateInvoice(invoiceId, { valor, vencimento }) {
  const { error } = await supabase.from("invoices").update({ valor, vencimento }).eq("id", invoiceId);
  if (error) throw error;
}

export async function deleteInvoice(invoiceId) {
  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
  if (error) throw error;
}

export async function setInvoiceStatus(invoiceId, status) {
  const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId);
  if (error) throw error;
}

export async function markInvoiceAlertSent(invoiceId) {
  const hoje = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("invoices").update({ alerta_enviado_em: hoje }).eq("id", invoiceId);
  if (error) throw error;
  return hoje;
}

// ---------- Intensidade ----------

export async function addIntensityCheck(restaurantId, { status, observacao }) {
  const { data, error } = await supabase
    .from("intensity_checks")
    .insert({ restaurant_id: restaurantId, status, observacao, origem: "manual" })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    data: data.checked_at.slice(0, 10),
    status: data.status,
    observacao: data.observacao || "",
    mensagemEnviada: data.mensagem_enviada,
  };
}

export async function markIntensityMessageSent(checkId) {
  const { error } = await supabase.from("intensity_checks").update({ mensagem_enviada: true }).eq("id", checkId);
  if (error) throw error;
}

// ---------- Leads ----------

export async function updateLeadStatus(leadId, status) {
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw error;
}

// Cadastro direto (sem passar por um lead) — cliente que fechou por
// fora do formulário, indicação, etc.
export async function createClient({ nome, cnpj, telefone, email, cep }) {
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({ nome, cnpj: cnpj || null, telefone: telefone || null, email: email || null, cep: cep || null, saude: "laranja" })
    .select()
    .single();
  if (error) throw error;

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({ restaurant_id: restaurant.id, status: "pendente" })
    .select()
    .single();
  if (contractError) throw contractError;

  return mapRestaurantRow({ ...restaurant, contracts: contract, contract_events: [], invoices: [], intensity_checks: [] });
}

// ---------- Arquivamento (exclusão reversível) ----------

export async function archiveClient(id) {
  const arquivadoEm = new Date().toISOString();
  const { error } = await supabase.from("restaurants").update({ arquivado_em: arquivadoEm }).eq("id", id);
  if (error) throw error;
  return arquivadoEm;
}

export async function restoreClient(id) {
  const { error } = await supabase.from("restaurants").update({ arquivado_em: null }).eq("id", id);
  if (error) throw error;
}

export async function convertLeadToClient(lead) {
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({ nome: lead.nome, telefone: lead.telefone, email: lead.email, saude: "laranja" })
    .select()
    .single();
  if (error) throw error;

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({ restaurant_id: restaurant.id, status: "pendente" })
    .select()
    .single();
  if (contractError) throw contractError;

  const { data: check, error: checkError } = await supabase
    .from("intensity_checks")
    .insert({ restaurant_id: restaurant.id, status: "ativo", observacao: "Cliente recém-convertido.", origem: "manual" })
    .select()
    .single();
  if (checkError) throw checkError;

  await updateLeadStatus(lead.id, "convertido");

  return mapRestaurantRow({
    ...restaurant,
    contracts: contract,
    contract_events: [],
    invoices: [],
    intensity_checks: [check],
  });
}
