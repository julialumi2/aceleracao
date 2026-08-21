-- Dispara um alerta no WhatsApp da equipe sempre que um lead novo é
-- inserido pelo formulário público. Usa a infra padrão de Database
-- Webhooks do Supabase (extensão pg_net + função supabase_functions.http_request,
-- já provisionadas em supabase-selfhost/volumes/db/webhooks.sql) pra
-- chamar o endpoint /webhooks/novo-lead do asaas-proxy, que por sua vez
-- chama a Evolution API.
--
-- Troque a URL abaixo pelo domínio real onde o asaas-proxy está
-- publicado, e o valor do header x-webhook-token pelo mesmo configurado
-- em LEAD_WEBHOOK_TOKEN no .env do asaas-proxy.
create trigger alerta_whatsapp_novo_lead
  after insert on leads
  for each row
  execute function supabase_functions.http_request(
    'https://SUBSTITUA-PELO-DOMINIO-DO-ASAAS-PROXY/webhooks/novo-lead',
    'POST',
    '{"Content-Type":"application/json","x-webhook-token":"SUBSTITUA-PELO-MESMO-TOKEN-DO-ENV"}',
    '{}',
    '5000'
  );
