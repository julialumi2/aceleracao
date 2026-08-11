import express from "express";
import { createClient } from "@supabase/supabase-js";

const PORT = process.env.PORT || 3000;
const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

for (const [name, value] of Object.entries({ ASAAS_WEBHOOK_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
  if (!value) {
    console.error(`Variável de ambiente obrigatória ausente: ${name}`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/webhooks/asaas", async (req, res) => {
  if (req.header("asaas-access-token") !== ASAAS_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: "token inválido" });
  }

  const { event, payment } = req.body || {};
  const status = EVENT_TO_STATUS[event];

  if (!status || !payment) {
    // Evento que não precisamos tratar (ex.: PAYMENT_DELETED) — só confirma o recebimento.
    return res.status(200).json({ ignored: true });
  }

  if (!payment.subscription) {
    // Cobrança avulsa, sem assinatura recorrente vinculada — fora do escopo por enquanto.
    return res.status(200).json({ ignored: true, reason: "sem assinatura vinculada" });
  }

  const { data: restaurant, error: findError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("asaas_subscription_id", payment.subscription)
    .maybeSingle();

  if (findError) {
    console.error("Erro ao buscar restaurante:", findError.message);
    return res.status(500).json({ error: "erro ao buscar cliente" });
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

app.listen(PORT, () => {
  console.log(`asaas-proxy ouvindo na porta ${PORT}`);
});
