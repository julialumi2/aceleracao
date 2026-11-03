-- Quem aparece na lista de "quem falou com o lead". Hoje são o Douglas e
-- o Leonardo, que puxam a conversa no WhatsApp — os outros integrantes
-- continuam vendo a etiqueta, só não entram como opção.
-- Pra incluir alguém depois, basta marcar atende_leads nessa pessoa.
alter table staff_members
  add column if not exists atende_leads boolean not null default false;

update staff_members
   set atende_leads = true
 where lower(email) in ('douglas.jefreyrv@gmail.com', 'leoferreira221203@gmail.com');
