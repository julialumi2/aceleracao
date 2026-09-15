-- Parâmetros da campanha que trouxe o lead (utm_* que o gestor de tráfego
-- coloca no link do anúncio). O cliente herda os do lead na conversão.
-- A policy de insert anônimo do formulário público só exige
-- status = 'novo', então as colunas novas não precisam de ajuste de RLS.
alter table leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text;

alter table restaurants
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text;
