import crypto from "node:crypto";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { gerarContratoDocx, gerarContratoHtml } from "./lib/contrato.js";
import { htmlParaPdf } from "./lib/pdf.js";
import { INSTAGRAM_CONFIGURADO, montarUrlAutorizacao, processarCallback, buscarMetricas } from "./lib/instagram.js";
import { acharClienteExistente, montarAtualizacaoMescla } from "./lib/onboarding.js";

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

// Geração e envio de contrato pro Clicksign — mesma lógica de opcional.
// Aponta pro sandbox por padrão (nunca produção sem querer).
const CLICKSIGN_API_TOKEN = process.env.CLICKSIGN_API_TOKEN;
const CLICKSIGN_API_URL = process.env.CLICKSIGN_API_URL || "https://sandbox.clicksign.com/api/v3";
const CLICKSIGN_CONFIGURADO = Boolean(CLICKSIGN_API_TOKEN);

// Conexão do Instagram de cada cliente (OAuth via Facebook) — mesma
// lógica de opcional. FRONTEND_URL é pra onde mandamos o cliente de
// volta depois do login com o Facebook.
const FRONTEND_URL = process.env.FRONTEND_URL || "https://aceleracao.artesanosburger.com.br";

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

// Chamado pelo painel admin (Configurações → Equipe) pra dar acesso ao
// painel pra um novo integrante. Cria o usuário direto no Supabase Auth
// com uma senha temporária já confirmada — o self-host ainda não tem SMTP
// configurado (GOTRUE_MAILER_AUTOCONFIRM no docker-compose), então um
// convite por e-mail não chegaria a lugar nenhum. A senha volta na
// resposta pra equipe repassar por um canal seguro (WhatsApp, etc.); a
// pessoa troca por uma senha própria em Configurações → Trocar senha.
// Ainda não existe distinção de papel (ver comentário em AdminLogin.jsx
// sobre a tabela `staff_members` pendente) — qualquer conta logada no
// painel pode criar outra, mesmo nível de acesso do resto do admin.
app.post("/admin/membros", async (req, res) => {
  const usuario = await usuarioAutenticado(req);
  if (!usuario) {
    return res.status(401).json({ error: "não autenticado" });
  }

  const { nome, email } = req.body || {};
  if (!nome || !email) {
    return res.status(400).json({ error: "nome e email são obrigatórios" });
  }

  const senhaTemporaria = crypto.randomBytes(9).toString("base64url");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: senhaTemporaria,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (error) {
    const jaExiste = error.status === 422 || /already.*registered/i.test(error.message);
    console.error("Erro ao criar acesso de equipe:", error.message);
    return res.status(jaExiste ? 409 : 502).json({ error: jaExiste ? "já existe uma conta com esse e-mail" : error.message });
  }

  return res.status(200).json({ email: data.user.email, senhaTemporaria });
});

async function clicksignFetch(method, path, body) {
  const response = await fetch(`${CLICKSIGN_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: CLICKSIGN_API_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const motivo = payload?.errors?.[0]?.detail || payload?.errors?.[0]?.title || `Clicksign respondeu ${response.status}`;
    throw new Error(motivo);
  }
  return payload;
}

// Chamado pelo painel admin (aba Contrato) — preenche o template do
// contrato com os dados do cliente, sobe pro Clicksign, cadastra o
// cliente como signatário e ativa o envelope pra disparar o e-mail de
// assinatura. Passo a passo da API v3: envelope -> documento -> signatário
// -> requisitos (assinar + autenticação) -> ativar -> notificar.
// Só preenche o template e devolve o .docx pra baixar — não fala com o
// Clicksign, não manda nada pra ninguém. Serve pra equipe conferir o
// texto antes de mandar de verdade pra assinatura.
app.post("/clicksign/preview-contrato", async (req, res) => {
  const usuario = await usuarioAutenticado(req);
  if (!usuario) {
    return res.status(401).json({ error: "não autenticado" });
  }

  const { nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura } = req.body || {};

  if (!nome || !valorMensal || !diaVencimento) {
    return res.status(400).json({ error: "nome, valorMensal e diaVencimento são obrigatórios" });
  }

  try {
    const docxBuffer = gerarContratoDocx({
      nome,
      cnpj: cnpj || "",
      cidade: cidade || "",
      cep: cep || "",
      email: email || "",
      valorMensal,
      diaVencimento,
      dataAssinatura: dataAssinatura || new Date().toISOString().slice(0, 10),
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="contrato-${nome.replace(/[^\w]+/g, "-")}.docx"`);
    return res.status(200).send(docxBuffer);
  } catch (err) {
    console.error("Erro ao gerar rascunho do contrato:", err.message);
    return res.status(500).json({ error: "não foi possível gerar o rascunho do contrato" });
  }
});

// Gera a prévia em HTML (não fala com o Clicksign) — usada pelo modal
// de revisão no painel, onde a equipe pode editar o texto livremente
// antes de mandar de verdade.
app.post("/clicksign/preview-html", async (req, res) => {
  const usuario = await usuarioAutenticado(req);
  if (!usuario) {
    return res.status(401).json({ error: "não autenticado" });
  }

  const { nome, cnpj, cidade, cep, email, valorMensal, diaVencimento, dataAssinatura } = req.body || {};

  if (!nome || !valorMensal || !diaVencimento) {
    return res.status(400).json({ error: "nome, valorMensal e diaVencimento são obrigatórios" });
  }

  try {
    const html = await gerarContratoHtml({
      nome,
      cnpj: cnpj || "",
      cidade: cidade || "",
      cep: cep || "",
      email: email || "",
      valorMensal,
      diaVencimento,
      dataAssinatura: dataAssinatura || new Date().toISOString().slice(0, 10),
    });
    return res.status(200).json({ html });
  } catch (err) {
    console.error("Erro ao gerar prévia do contrato:", err.message);
    return res.status(500).json({ error: "não foi possível gerar a prévia do contrato" });
  }
});

app.post("/clicksign/gerar-contrato", async (req, res) => {
  if (!CLICKSIGN_CONFIGURADO) {
    return res.status(503).json({ error: "integração com o Clicksign não configurada" });
  }

  const usuario = await usuarioAutenticado(req);
  if (!usuario) {
    return res.status(401).json({ error: "não autenticado" });
  }

  const { nome, cnpj, cidade, cep, email, telefone, valorMensal, diaVencimento, dataAssinatura, html } = req.body || {};

  if (!nome || !email || !valorMensal || !diaVencimento) {
    return res.status(400).json({ error: "nome, email, valorMensal e diaVencimento são obrigatórios" });
  }

  try {
    // Se veio HTML (a equipe revisou/editou no modal), manda esse texto
    // final em PDF. Sem HTML, preenche o modelo original e manda em docx
    // — atalho ainda disponível pra quem quer pular a revisão.
    let fileBuffer;
    let filename;
    if (html) {
      fileBuffer = await htmlParaPdf(html);
      filename = "contrato-mentoria.pdf";
    } else {
      fileBuffer = gerarContratoDocx({
        nome,
        cnpj: cnpj || "",
        cidade: cidade || "",
        cep: cep || "",
        email,
        valorMensal,
        diaVencimento,
        dataAssinatura: dataAssinatura || new Date().toISOString().slice(0, 10),
      });
      filename = "contrato-mentoria.docx";
    }

    const envelope = await clicksignFetch("POST", "/envelopes", {
      data: { type: "envelopes", attributes: { name: `Contrato — ${nome}` } },
    });
    const envelopeId = envelope.data.id;

    const documento = await clicksignFetch("POST", `/envelopes/${envelopeId}/documents`, {
      data: {
        type: "documents",
        attributes: { filename, content_base64: fileBuffer.toString("base64") },
      },
    });
    const documentoId = documento.data.id;

    const signatario = await clicksignFetch("POST", `/envelopes/${envelopeId}/signers`, {
      data: {
        type: "signers",
        attributes: {
          name: nome,
          email,
          phone_number: (telefone || "").replace(/\D/g, "") || undefined,
          has_documentation: false,
          communicate_events: { signature_request: "email", signature_reminder: "email", document_signed: "email" },
        },
      },
    });
    const signatarioId = signatario.data.id;

    const relationships = {
      document: { data: { type: "documents", id: documentoId } },
      signer: { data: { type: "signers", id: signatarioId } },
    };

    await clicksignFetch("POST", `/envelopes/${envelopeId}/requirements`, {
      data: { type: "requirements", attributes: { action: "agree", role: "sign" }, relationships },
    });
    await clicksignFetch("POST", `/envelopes/${envelopeId}/requirements`, {
      data: { type: "requirements", attributes: { action: "provide_evidence", auth: "email" }, relationships },
    });

    await clicksignFetch("PATCH", `/envelopes/${envelopeId}`, {
      data: { id: envelopeId, type: "envelopes", attributes: { status: "running" } },
    });
    await clicksignFetch("POST", `/envelopes/${envelopeId}/notifications`, {
      data: { type: "notifications", attributes: {} },
    });

    return res.status(200).json({ envelopeId });
  } catch (err) {
    console.error("Erro ao gerar/enviar contrato no Clicksign:", err.message);
    return res.status(502).json({ error: err.message });
  }
});

// Página pública que o cliente abre (link que a equipe manda por
// WhatsApp) — confere que o cliente existe antes de mandar pro login do
// Facebook, e manda pra uma tela de erro amigável se o link for inválido.
app.get("/instagram/autorizar", async (req, res) => {
  if (!INSTAGRAM_CONFIGURADO) {
    return res.redirect(`${FRONTEND_URL}/conectar-instagram/erro?motivo=nao-configurado`);
  }
  const restaurantId = req.query.restaurantId;
  if (!restaurantId) {
    return res.redirect(`${FRONTEND_URL}/conectar-instagram/erro?motivo=link-invalido`);
  }

  const { data, error } = await supabase.from("restaurants").select("id").eq("id", restaurantId).maybeSingle();
  if (error || !data) {
    return res.redirect(`${FRONTEND_URL}/conectar-instagram/erro?motivo=link-invalido`);
  }

  return res.redirect(montarUrlAutorizacao(restaurantId));
});

// O Facebook chama aqui depois que o cliente autoriza (ou recusa) o
// acesso. Troca o code por token, acha a conta do Instagram conectada à
// Página, salva e manda o cliente pra tela de sucesso/erro.
app.get("/instagram/callback", async (req, res) => {
  const { code, state: restaurantId, error: erroFacebook } = req.query;

  if (erroFacebook || !code || !restaurantId) {
    return res.redirect(`${FRONTEND_URL}/conectar-instagram/erro?motivo=cancelado`);
  }

  try {
    const conexao = await processarCallback(code);

    const { error } = await supabase.from("instagram_connections").upsert(
      {
        restaurant_id: restaurantId,
        instagram_user_id: conexao.instagramUserId,
        instagram_username: conexao.instagramUsername,
        page_id: conexao.pageId,
        access_token: conexao.accessToken,
        token_expires_at: conexao.tokenExpiresAt,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id" }
    );
    if (error) throw error;

    return res.redirect(`${FRONTEND_URL}/conectar-instagram/sucesso`);
  } catch (err) {
    console.error("Erro ao processar callback do Instagram:", err.message);
    return res.redirect(`${FRONTEND_URL}/conectar-instagram/erro?motivo=falha-conexao`);
  }
});

// Chamado pelo painel admin — status da conexão (sem token, só o que é
// seguro mostrar pra equipe).
app.get("/instagram/status", async (req, res) => {
  const usuario = await usuarioAutenticado(req);
  if (!usuario) return res.status(401).json({ error: "não autenticado" });

  const { restaurantId } = req.query;
  if (!restaurantId) return res.status(400).json({ error: "restaurantId é obrigatório" });

  const { data } = await supabase
    .from("instagram_connections")
    .select("instagram_username, connected_at")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  return res.status(200).json({ conectado: Boolean(data), username: data?.instagram_username || null, conectadoEm: data?.connected_at || null });
});

// Chamado pelo painel admin pra puxar os números atualizados — posts
// nos últimos 7 dias + alcance da conta, direto da API do Instagram.
app.get("/instagram/metricas", async (req, res) => {
  const usuario = await usuarioAutenticado(req);
  if (!usuario) return res.status(401).json({ error: "não autenticado" });

  const { restaurantId } = req.query;
  if (!restaurantId) return res.status(400).json({ error: "restaurantId é obrigatório" });

  const { data: conexao } = await supabase
    .from("instagram_connections")
    .select("instagram_user_id, access_token")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (!conexao) {
    return res.status(404).json({ error: "cliente não conectou o Instagram ainda" });
  }

  try {
    const metricas = await buscarMetricas({ instagramUserId: conexao.instagram_user_id, accessToken: conexao.access_token });
    return res.status(200).json(metricas);
  } catch (err) {
    console.error("Erro ao buscar métricas do Instagram:", err.message);
    return res.status(502).json({ error: err.message });
  }
});

// Formulário público de cadastro (cadastro.aceleracao...). Antes só
// inseria direto via Supabase anon; agora passa por aqui pra poder
// checar se já existe um cliente com o mesmo telefone/empresa (ex: um
// lead que a equipe já converteu) e mesclar em vez de duplicar.
app.post("/onboarding/cadastro-publico", async (req, res) => {
  const {
    nome,
    empresa,
    telefone,
    email,
    cnpj,
    endereco,
    cidade,
    cep,
    banco,
    agencia,
    conta,
    diasFuncionamento,
    horarioAbertura,
    horarioFechamento,
    horarioAberturaFds,
    horarioFechamentoFds,
  } = req.body || {};

  if (!nome) {
    return res.status(400).json({ error: "nome é obrigatório" });
  }

  const dadosFormulario = {
    nome,
    empresa: empresa || null,
    telefone: telefone || null,
    email: email || null,
    cnpj: cnpj || null,
    endereco: endereco || null,
    cidade: cidade || null,
    cep: cep || null,
    banco: banco || null,
    agencia: agencia || null,
    conta: conta || null,
    dias_funcionamento: diasFuncionamento && diasFuncionamento.length ? diasFuncionamento : null,
    horario_abertura: horarioAbertura || null,
    horario_fechamento: horarioFechamento || null,
    horario_abertura_fds: horarioAberturaFds || null,
    horario_fechamento_fds: horarioFechamentoFds || null,
  };

  try {
    const existente = await acharClienteExistente(supabase, { telefone, empresa });

    if (existente) {
      const atualizacao = montarAtualizacaoMescla(existente, dadosFormulario);
      if (Object.keys(atualizacao).length > 0) {
        const { error } = await supabase.from("restaurants").update(atualizacao).eq("id", existente.id);
        if (error) throw error;
      }
      await supabase.from("contract_events").insert({
        restaurant_id: existente.id,
        evento: "Dados de cadastro público mesclados automaticamente com este cliente (mesmo telefone/empresa).",
      });
      return res.status(200).json({ merged: true, restaurantId: existente.id });
    }

    const { data: novo, error } = await supabase
      .from("restaurants")
      .insert({ ...dadosFormulario, saude: "laranja" })
      .select("id")
      .single();
    if (error) throw error;

    return res.status(200).json({ merged: false, restaurantId: novo.id });
  } catch (err) {
    console.error("Erro ao processar cadastro público:", err.message);
    return res.status(500).json({ error: "não foi possível salvar o cadastro" });
  }
});

app.listen(PORT, () => {
  console.log(`asaas-proxy ouvindo na porta ${PORT}`);
});
