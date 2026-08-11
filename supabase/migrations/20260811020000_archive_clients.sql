-- Arquivamento de clientes (soft delete): sai das listas ativas mas
-- mantém contrato/boletos/intensidade guardados, com opção de restaurar.
alter table restaurants add column if not exists arquivado_em timestamptz;
