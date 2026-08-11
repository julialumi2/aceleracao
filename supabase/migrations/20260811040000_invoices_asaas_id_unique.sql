-- Permite upsert por asaas_id no webhook (um boleto do Asaas nunca deve
-- virar duas linhas aqui, mesmo se o Asaas reenviar o mesmo evento).
-- UNIQUE normal (não parcial): colunas nulas nunca conflitam entre si,
-- então boletos sem asaas_id continuam funcionando sem problema — e um
-- índice parcial não seria reconhecido pelo ON CONFLICT (asaas_id) do
-- upsert do PostgREST.
alter table invoices add constraint invoices_asaas_id_key unique (asaas_id);
