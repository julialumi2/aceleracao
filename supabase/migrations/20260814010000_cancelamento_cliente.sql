-- Cliente que cancelou a mentoria, mas ainda tem boleto em aberto —
-- diferente de arquivar (que tira de tudo, inclusive Cobranças).
-- Cancelado continua aparecendo em Cobranças até a dívida ser resolvida.
alter table restaurants add column if not exists cancelado_em timestamptz;
alter table restaurants add column if not exists motivo_cancelamento text;
