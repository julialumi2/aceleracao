import express from "express";
import { createClient } from "@supabase/supabase-js";

const PORT = process.env.PORT || 3000;
const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Alerta de lead novo no WhatsApp — opcional. Sem essas variáveis
// preenchidas, o endpoint /webhooks/novo-lead só responde 503 em vez de
// derrubar o serviço inteiro (o webhook do Asaas não pode depender disso).
const LEAD_WEBHOOK_TOKEN = process.env.LEAD_WEBHOOK_TOKEN;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;
const ALERT_WHATSAPP_NUMBER = process.env.ALERT_WHATSAPP_NUMBER;
const LEAD_ALERT_CONFIGURADO =
  LEAD_WEBHOOK_TOKEN && EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE && ALERT_WHATSAPP_NUMBER;

// Criação de cliente/assinatura no Asaas a partir do painel admin —
// opcional pelo mesmo motivo do alerta de lead: sem isso configurado,
// o resto do serviço (webhook do Asaas) precisa continuar de pé.
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_BILLING_CONFIGURADO = Boolean(ASAAS_API_KEY);

for (const [name, value] of Object.entries({ ASAAS_WEBHOOK_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
  if (!value) {
    console.error(`Variável de ambiente obrigatória ausente: ${name}`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Autoriza chamadas vindas do painel admin (origem diferente da deste
// serviço) — a autenticação de verdade é o token do Supabase checado em
// cada rota abaixo, isto aqui só libera o navegador a fazer a chamada.
function cors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}

// Mapeia o evento do Asaas pro status que usamos no CRM.
// Eventos que não representam pago/atrasado/pendente são ignorados.
const EVENT_TO_STATUS = {
  PAYMENT_CREATED: "pendente",
  PAYMENT_UPDATED: "pendente",
  PAYMENT_RECEIVED: "pago",
  PAYMENT_CONFIRMED: "pago",
  PAYMENT_OVERDUE: "atrasado",
};

const app = express();
app.use(express.json());
app.use(cors);

// Confirma que quem está chamando é um funcionário logado no painel —
// mesmo nível de acesso que o resto do admin já exige (qualquer conta
// autenticada no Supabase). Retorna o usuário ou null.
async function usuarioAutenticado(req) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user;
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/webhooks/asaas", async (req, res) => {
  console.log(`Webhook recebido: event=${req.body?.event} subscription=${req.body?.payment?.subscription} id=${req.body?.payment?.id}`);

  if (req.header("asaas-access-token") !== ASAAS_WEBHOOK_TOKEN) {
    console.warn("Webhook rejeitado: token inválido");
    return res.status(401).json({ error: "token inválido" });
  }

  const { event, payment } = req.body || {};
  const status = EVENT_TO_STATUS[event];

  if (!status || !payment) {
    // Evento que não precisamos tratar (ex.: PAYMENT_DELETED) — só confirma o recebimento.
    console.log(`Evento ignorado (não mapeado): ${event}`);
    return res.status(200).json({ ignored: true });
  }

  if (!payment.subscription) {
    // Cobrança avulsa, sem assinatura recorrente vinculada — fora do escopo por enquanto.
    return res.status(200).json({ ignored: true, reason: "sem assinatura vinculada" });
  }

  // Clientes quinzenais têm DUAS assinaturas no Asaas (uma por dia de
  // vencimento), então a assinatura recebida pode bater com qualquer uma
  // das duas colunas.
  let restaurant = null;
  const { data: porAssinaturaPrincipal, error: findError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("asaas_subscription_id", payment.subscription)
    .maybeSingle();

  if (findError) {
    console.error("Erro ao buscar restaurante:", findError.message);
    return res.status(500).json({ error: "erro ao buscar cliente" });
  }
  restaurant = porAssinaturaPrincipal;

  if (!restaurant) {
    const { data: porAssinaturaSecundaria, error: findError2 } = await supabase
      .from("restaurants")
      .select("id")
      .eq("asaas_subscription_id_2", payment.subscription)
      .maybeSingle();

    if (findError2) {
      console.error("Erro ao buscar restaurante (assinatura 2):", findError2.message);
      return res.status(500).json({ error: "erro ao buscar cliente" });
    }
    restaurant = porAssinaturaSecundaria;
  }

  if (!restaurant) {
    console.warn(`Nenhum cliente vinculado à assinatura Asaas ${payment.subscription}`);
    return res.status(200).json({ ignored: true, reason: "assinatura não vinculada a nenhum cliente" });
  }

  const { error: upsertError } = await supabase.from("invoices").upsert(
    {
      restaurant_id: restaurant.id,
      asaas_id: payment.id,
      valor: payment.value,
      vencimento: payment.dueDate,
      status,
    },
    { onConflict: "asaas_id" }
  );

  if (upsertError) {
    console.error("Erro ao salvar boleto:", upsertError.message);
    return res.status(500).json({ error: "erro ao salvar boleto" });
  }

  return res.status(200).json({ ok: true });
});

// Chamado pelo Database Webhook do Supabase (trigger AFTER INSERT na
// tabela leads) sempre que alguém envia o formulário de interesse.
// Formata os dados preenchidos e manda um alerta pro WhatsApp via
// Evolution API.
app.post("/webhooks/novo-lead", async (req, res) => {
  if (!LEAD_ALERT_CONFIGURADO) {
    return res.status(503).json({ error: "alerta de lead não configurado" });
  }

  if (req.header("x-webhook-token") !== LEAD_WEBHOOK_TOKEN) {
    console.warn("Webhook de lead rejeitado: token inválido");
    return res.status(401).json({ error: "token inválido" });
  }

  const lead = req.body?.record;
  if (!lead) {
    return res.status(400).json({ error: "payload sem record" });
  }

  const linhas = [
    "🔥 *Novo lead na Aceleração Delivery*",
    "",
    `*Nome:* ${lead.nome || "-"}`,
    `*WhatsApp:* ${lead.telefone || "-"}`,
    `*Negócio:* ${lead.nome_negocio || "-"}`,
    `*Faturamento mensal:* ${lead.faturamento_mensal || "-"}`,
    `*Maior gargalo:* ${lead.maior_gargalo || "-"}`,
    `*Gestor de tráfego:* ${lead.gestor_trafego || "-"}`,
  ];
  if (lead.mensagem) linhas.push(`*Mensagem:* ${lead.mensagem}`);
  linhas.push(`*Origem:* ${lead.origem || "-"}`);

  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
      body: JSON.stringify({ number: ALERT_WHATSAPP_NUMBER, text: linhas.join("\n") }),
    });

    if (!response.ok) {
      const detalhe = await response.text();
      console.error(`Evolution API respondeu ${response.status}: ${detalhe}`);
      return res.status(502).json({ error: "falha ao enviar alerta no WhatsApp" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao chamar Evolution API:", err.message);
    return res.status(502).json({ error: "falha ao enviar alerta no WhatsApp" });
  }
});

async function asaasFetch(path, body) {
  const response = await fetch(`${ASAAS_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", access_token: ASAAS_API_KEY },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const motivo = data?.errors?.[0]?.description || `Asaas respondeu ${response.status}`;
    throw new Error(motivo);
  }
  return data;
}

// Chamado pelo painel admin ao configurar cobrança recorrente pra um
// cliente novo — cria o cliente e a(s) assinatura(s) de verdade no
// Asaas, em vez de a equipe fazer isso manualmente no painel deles.
app.post("/asaas/assinatura-recorrente", async (req, res) => {
  if (!ASAAS_BILLING_CONFIGURADO) {
    return res.status(503).json({ error: "integração com o Asaas não configurada" });
  }

  const usuario = await usuarioAutenticado(req);
  if (!usuario) {
    return res.status(401).json({ error: "não autenticado" });
  }

  const {
    nome,
    cnpj,
    email,
    telefone,
    valor,
    proximaCobrancaEm,
    periodicidade,
    valor2,
    proximaCobrancaEm2,
  } = req.body || {};

  if (!nome || !valor || !proximaCobrancaEm) {
    return res.status(400).json({ error: "nome, valor e proximaCobrancaEm são obrigatórios" });
  }

  try {
    const customer = await asaasFetch("/customers", {
      name: nome,
      cpfCnpj: (cnpj || "").replace(/\D/g, "") || undefined,
      email: email || undefined,
      mobilePhone: (telefone || "").replace(/\D/g, "") || undefined,
    });

    const subscription = await asaasFetch("/subscriptions", {
      customer: customer.id,
      billingType: "BOLETO",
      value: valor,
      nextDueDate: proximaCobrancaEm,
      cycle: "MONTHLY",
      description: `Mentoria Aceleração Delivery — ${nome}`,
    });

    const resultado = { asaasCustomerId: customer.id, asaasSubscriptionId: subscription.id };

    if (periodicidade === "quinzenal" && valor2 && proximaCobrancaEm2) {
      try {
        const subscription2 = await asaasFetch("/subscriptions", {
          customer: customer.id,
          billingType: "BOLETO",
          value: valor2,
          nextDueDate: proximaCobrancaEm2,
          cycle: "MONTHLY",
          description: `Mentoria Aceleração Delivery — ${nome} (2ª cobrança do mês)`,
        });
        resultado.asaasSubscriptionId2 = subscription2.id;
      } catch (err) {
        // Cliente e 1ª assinatura já foram criados no Asaas — devolve o
        // que deu certo e avisa qual parte falhou, em vez de perder tudo.
        return res.status(207).json({ ...resultado, erroSegundaAssinatura: err.message });
      }
    }

    return res.status(200).json(resultado);
  } catch (err) {
    console.error("Erro ao criar cliente/assinatura no Asaas:", err.message);
    return res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`asaas-proxy ouvindo na porta ${PORT}`);
});
