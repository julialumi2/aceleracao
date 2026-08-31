import { supabase } from "../../lib/supabase.js";
import { criarAssinaturaAsaas } from "./asaasApi.js";

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
    empresa: row.empresa || "",
    cnpj: row.cnpj || "",
    cidade: row.cidade || "",
    endereco: row.endereco || "",
    cep: row.cep || "",
    telefone: row.telefone || "",
    email: row.email || "",
    cardapioUrl: row.cardapio_url || "",
    saude: row.saude || "laranja",
    arquivadoEm: row.arquivado_em || null,
    canceladoEm: row.cancelado_em || null,
    motivoCancelamento: row.motivo_cancelamento || "",
    cobrancaRecorrente: {
      valor: row.valor_recorrente != null ? Number(row.valor_recorrente) : null,
      diaVencimento: row.dia_vencimento_recorrente,
      proximaCobrancaEm: row.proxima_cobranca_em,
      configuradaEm: row.cobranca_configurada_em,
      asaasCustomerId: row.asaas_customer_id,
      asaasSubscriptionId: row.asaas_subscription_id,
      periodicidade: row.periodicidade || "mensal",
      valor2: row.valor_recorrente_2 != null ? Number(row.valor_recorrente_2) : null,
      diaVencimento2: row.dia_vencimento_recorrente_2,
      proximaCobrancaEm2: row.proxima_cobranca_em_2,
      asaasSubscriptionId2: row.asaas_subscription_id_2,
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
      asaasId: inv.asaas_id,
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
    email: row.email || "",
    telefone: row.telefone || "",
    origem: row.origem,
    status: row.status,
    temperatura: row.temperatura || null,
    criadoEm: row.created_at.slice(0, 10),
    nomeNegocio: row.nome_negocio || "",
    cidade: row.cidade || "",
    estado: row.estado || "",
    faturamentoMensal: row.faturamento_mensal || "",
    maiorGargalo: row.maior_gargalo || "",
    gestorTrafego: row.gestor_trafego || "",
    mensagem: row.mensagem || "",
  };
}

// ---------- Cliente: campos simples ----------

const CLIENT_FIELD_MAP = {
  nome: "nome",
  empresa: "empresa",
  cnpj: "cnpj",
  cidade: "cidade",
  endereco: "endereco",
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
export async function setRecurringBilling(
  id,
  {
    valor,
    diaVencimento,
    proximaCobrancaEm,
    asaasCustomerId,
    asaasSubscriptionId,
    periodicidade,
    valor2,
    diaVencimento2,
    proximaCobrancaEm2,
    asaasSubscriptionId2,
  }
) {
  const payload = {
    valor_recorrente: valor,
    dia_vencimento_recorrente: diaVencimento,
    proxima_cobranca_em: proximaCobrancaEm,
    cobranca_configurada_em: new Date().toISOString(),
    periodicidade: periodicidade || "mensal",
  };
  if (asaasCustomerId) payload.asaas_customer_id = asaasCustomerId;
  if (asaasSubscriptionId) payload.asaas_subscription_id = asaasSubscriptionId;

  // Segunda assinatura só existe pra clientes quinzenais (dois vencimentos
  // separados no Asaas) — se não for quinzenal, zera pra não deixar lixo
  // de uma configuração anterior.
  if (periodicidade === "quinzenal") {
    payload.valor_recorrente_2 = valor2;
    payload.dia_vencimento_recorrente_2 = diaVencimento2;
    payload.proxima_cobranca_em_2 = proximaCobrancaEm2;
    if (asaasSubscriptionId2) payload.asaas_subscription_id_2 = asaasSubscriptionId2;
  } else {
    payload.valor_recorrente_2 = null;
    payload.dia_vencimento_recorrente_2 = null;
    payload.proxima_cobranca_em_2 = null;
    payload.asaas_subscription_id_2 = null;
  }

  const { error } = await supabase.from("restaurants").update(payload).eq("id", id);
  if (error) throw error;
}

// Reseta a configuração de cobrança recorrente pro estado "não configurado"
// — usado quando algo foi cadastrado errado e precisa recomeçar do zero.
// Não mexe nos boletos já registrados, só na config (valor/dia/IDs Asaas).
export async function clearRecurringBilling(id) {
  const { error } = await supabase
    .from("restaurants")
    .update({
      valor_recorrente: null,
      dia_vencimento_recorrente: null,
      proxima_cobranca_em: null,
      cobranca_configurada_em: null,
      asaas_customer_id: null,
      asaas_subscription_id: null,
      periodicidade: "mensal",
      valor_recorrente_2: null,
      dia_vencimento_recorrente_2: null,
      proxima_cobranca_em_2: null,
      asaas_subscription_id_2: null,
    })
    .eq("id", id);
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

// Grava o envelope e o documento do Clicksign depois que o contrato é
// gerado e enviado automaticamente (ver
// clicksignApi.js/gerarContratoClicksign). O documento é o que o
// webhook de assinatura usa pra achar esse cliente de volta.
export async function setContractEnvelope(restaurantId, envelopeId, documentoId) {
  const { error } = await supabase
    .from("contracts")
    .upsert(
      { restaurant_id: restaurantId, clicksign_envelope_id: envelopeId, clicksign_document_id: documentoId },
      { onConflict: "restaurant_id" }
    );
  if (error) throw error;

  const { data, error: eventError } = await supabase
    .from("contract_events")
    .insert({ restaurant_id: restaurantId, evento: "Contrato gerado e enviado pro Clicksign" })
    .select()
    .single();
  if (eventError) throw eventError;
  return { id: data.id, data: data.data, evento: data.evento };
}

// ---------- Cobrança ----------

// asaasId é opcional, mas importante preencher quando o boleto já existe
// no Asaas: sem ele, quando o webhook processar um evento de verdade pra
// esse mesmo boleto, ele não acha essa linha pra atualizar e cria uma
// segunda, duplicada. status também é opcional — cliente já vencido, por
// exemplo, entra direto como "atrasado" em vez de "pendente".
export async function addInvoice(restaurantId, { valor, vencimento, asaasId, status }) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({ restaurant_id: restaurantId, valor, vencimento, status: status || "pendente", asaas_id: asaasId || null })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, valor: Number(data.valor), vencimento: data.vencimento, status: data.status, alertaEnviadoEm: data.alerta_enviado_em, asaasId: data.asaas_id };
}

export async function updateInvoice(invoiceId, { valor, vencimento, asaasId }) {
  const payload = { valor, vencimento };
  if (asaasId !== undefined) payload.asaas_id = asaasId || null;
  const { error } = await supabase.from("invoices").update(payload).eq("id", invoiceId);
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

export async function updateLeadTemperatura(leadId, temperatura) {
  const { error } = await supabase.from("leads").update({ temperatura }).eq("id", leadId);
  if (error) throw error;
}

export async function deleteLead(leadId) {
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) throw error;
}

function normalizarTelefone(telefone) {
  return (telefone || "").replace(/\D/g, "");
}

// Quando alguém responde o formulário de lead mais de uma vez, cada
// resposta vira um registro separado em `leads`. Ao converter um deles
// em cliente, os outros com o mesmo telefone ficariam esquecidos como
// "lead" pra sempre — marca todos como convertidos também.
async function marcarLeadsDuplicadosComoConvertidos(leadConvertido) {
  const telefoneNormalizado = normalizarTelefone(leadConvertido.telefone);
  if (!telefoneNormalizado) return;

  const { data: outrosLeads, error } = await supabase
    .from("leads")
    .select("id, telefone")
    .neq("id", leadConvertido.id)
    .neq("status", "convertido");
  if (error) throw error;

  const duplicadosIds = (outrosLeads || [])
    .filter((l) => normalizarTelefone(l.telefone) === telefoneNormalizado)
    .map((l) => l.id);
  if (duplicadosIds.length === 0) return;

  const { error: updateError } = await supabase.from("leads").update({ status: "convertido" }).in("id", duplicadosIds);
  if (updateError) throw updateError;
}

// Lead que não fechou em call — indicado pela equipe ou vindo de um
// formulário de tráfego frio, cadastrado na mão até termos sincronia
// automática com o formulário.
export async function createLead({ nome, telefone, email, origem, temperatura }) {
  const { data, error } = await supabase
    .from("leads")
    .insert({ nome, telefone: telefone || null, email: email || null, origem: origem || "manual", temperatura: temperatura || null, status: "novo" })
    .select()
    .single();
  if (error) throw error;
  return mapLeadRow(data);
}

// Cadastro direto (sem passar por um lead) — cliente que fechou por
// fora do formulário, indicação, etc.
export async function createClient({ nome, empresa, cnpj, telefone, email, cep }) {
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({
      nome,
      empresa: empresa || null,
      cnpj: cnpj || null,
      telefone: telefone || null,
      email: email || null,
      cep: cep || null,
      saude: "laranja",
    })
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

// Apagar de vez — diferente de arquivar, sem volta. Só faz sentido pra
// registro de teste/duplicado; contratos, boletos e afins do cliente
// somem junto (cascade), tarefas ficam órfãs mas continuam existindo.
export async function deleteClient(id) {
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Cancelamento (diferente de arquivar) ----------
// Cliente cancelou a mentoria mas pode ainda dever boleto — continua
// aparecendo em Cobranças, só some das métricas de "cliente ativo".

export async function setCancelamento(id, motivo) {
  const canceladoEm = new Date().toISOString();
  const { error } = await supabase
    .from("restaurants")
    .update({ cancelado_em: canceladoEm, motivo_cancelamento: motivo || null, saude: "inativo" })
    .eq("id", id);
  if (error) throw error;
  return canceladoEm;
}

export async function reativarCliente(id) {
  const { error } = await supabase.from("restaurants").update({ cancelado_em: null, motivo_cancelamento: null }).eq("id", id);
  if (error) throw error;
}

// ---------- Tarefas ----------

function mapTaskRow(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao || "",
    categoria: row.categoria || "",
    prioridade: row.prioridade,
    status: row.status,
    prazo: row.prazo,
    criadoEm: row.created_at,
    cliente: row.restaurants ? { id: row.restaurants.id, nome: row.restaurants.empresa || row.restaurants.nome } : null,
    lead: row.leads ? { id: row.leads.id, nome: row.leads.nome } : null,
  };
}

export async function fetchTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, restaurants(id, nome, empresa), leads(id, nome)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapTaskRow);
}

export async function createTask({ titulo, descricao, categoria, prioridade, prazo, restaurantId, leadId }) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      titulo,
      descricao: descricao || null,
      categoria: categoria || null,
      prioridade: prioridade || "media",
      prazo: prazo || null,
      restaurant_id: restaurantId || null,
      lead_id: leadId || null,
    })
    .select("*, restaurants(id, nome, empresa), leads(id, nome)")
    .single();
  if (error) throw error;
  return mapTaskRow(data);
}

export async function updateTaskStatus(id, status) {
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// cobranca opcional: { valor, dataInicio } — se informado, já grava a
// cobrança recorrente mensal e tenta criar a assinatura de verdade no
// Asaas. Se o Asaas falhar (não configurado, sem CNPJ ainda, etc.), a
// conversão do lead continua valendo — só devolve um aviso pra equipe
// terminar manualmente na aba Cobrança.
export async function convertLeadToClient(lead, cobranca) {
  const dadosCobranca = cobranca?.valor && cobranca?.dataInicio
    ? {
        valor_recorrente: cobranca.valor,
        dia_vencimento_recorrente: new Date(`${cobranca.dataInicio}T00:00:00`).getDate(),
        proxima_cobranca_em: cobranca.dataInicio,
        cobranca_configurada_em: new Date().toISOString(),
        periodicidade: "mensal",
      }
    : {};

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({
      nome: lead.nome,
      empresa: lead.nomeNegocio || null,
      cidade: lead.cidade || null,
      telefone: lead.telefone,
      email: lead.email,
      saude: "laranja",
      ...dadosCobranca,
    })
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
  await marcarLeadsDuplicadosComoConvertidos(lead);

  let avisoAsaas = null;
  if (cobranca?.valor && cobranca?.dataInicio) {
    try {
      const asaas = await criarAssinaturaAsaas({
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        valor: cobranca.valor,
        proximaCobrancaEm: cobranca.dataInicio,
      });
      const { error: asaasUpdateError } = await supabase
        .from("restaurants")
        .update({ asaas_customer_id: asaas.asaasCustomerId, asaas_subscription_id: asaas.asaasSubscriptionId })
        .eq("id", restaurant.id);
      if (asaasUpdateError) throw asaasUpdateError;
      restaurant.asaas_customer_id = asaas.asaasCustomerId;
      restaurant.asaas_subscription_id = asaas.asaasSubscriptionId;
    } catch (err) {
      avisoAsaas = `Cliente convertido, mas a assinatura no Asaas não foi criada automaticamente (${err.message}). Complete na aba Cobrança do cliente — geralmente falta o CNPJ.`;
    }
  }

  const cliente = mapRestaurantRow({
    ...restaurant,
    contracts: contract,
    contract_events: [],
    invoices: [],
    intensity_checks: [check],
  });

  return { ...cliente, avisoAsaas };
}
