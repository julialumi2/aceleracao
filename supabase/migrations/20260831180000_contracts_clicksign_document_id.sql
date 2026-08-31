-- O webhook do Clicksign correlaciona pela chave do documento (campo
-- "document.key" no payload), não pela do envelope como a gente supôs
-- antes de testar contra um evento real — sem essa coluna o webhook
-- nunca acha o contrato certo pra marcar como assinado.
alter table contracts add column if not exists clicksign_document_id text;
