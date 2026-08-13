-- Clientes quinzenais têm DUAS assinaturas separadas no Asaas (confirmado
-- no painel: 2 linhas em Cobranças → Assinaturas, uma por dia de
-- vencimento), não uma assinatura com ciclo quinzenal. Guardamos o
-- segundo conjunto de campos em paralelo ao primeiro.
alter table restaurants add column if not exists periodicidade text not null default 'mensal'
  check (periodicidade in ('mensal', 'quinzenal'));

alter table restaurants add column if not exists valor_recorrente_2 numeric(10,2);
alter table restaurants add column if not exists dia_vencimento_recorrente_2 smallint
  check (dia_vencimento_recorrente_2 >= 1 and dia_vencimento_recorrente_2 <= 31);
alter table restaurants add column if not exists proxima_cobranca_em_2 date;
alter table restaurants add column if not exists asaas_subscription_id_2 text;
