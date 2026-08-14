alter table restaurants drop constraint restaurants_saude_check;
alter table restaurants add constraint restaurants_saude_check
  check (saude = any (array['verde'::text, 'amarelo'::text, 'laranja'::text, 'inativo'::text]));
