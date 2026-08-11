-- O botão "Chamar no WhatsApp" da tela de Leads depende desse campo, que
-- nunca existiu na tabela original (criada antes do painel admin).
alter table public.leads
  add column if not exists telefone text;
