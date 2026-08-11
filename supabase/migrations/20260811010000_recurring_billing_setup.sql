-- Captura a decisão de cobrança recorrente no momento em que o cliente
-- fecha (valor combinado + se já pagou a 1ª parcela ou quando vai pagar).
-- A criação da assinatura em si no Asaas acontece depois, via Edge
-- Function (a chave de API nunca deve chegar no navegador) — os campos
-- asaas_* ficam nulos até essa integração entrar em produção.
alter table public.restaurants
  add column if not exists valor_recorrente numeric(10, 2),
  add column if not exists dia_vencimento_recorrente smallint check (dia_vencimento_recorrente between 1 and 28),
  add column if not exists proxima_cobranca_em date,
  add column if not exists asaas_customer_id text,
  add column if not exists asaas_subscription_id text,
  add column if not exists cobranca_configurada_em timestamptz;
