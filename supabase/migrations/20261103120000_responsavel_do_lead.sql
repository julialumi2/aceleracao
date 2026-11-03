-- "Quem falou com esse lead": a pessoa da equipe que puxou a conversa no
-- WhatsApp fica marcada no lead. Qualquer um da equipe marca uma vez; a
-- partir daí trava, e só administrador troca.
--
-- A trava é um gatilho no banco, não só um botão desabilitado na tela:
-- a aba Leads conversa direto com o PostgREST, então bloquear só no
-- front não bloquearia nada de verdade.

alter table leads
  add column if not exists responsavel_id uuid references auth.users(id) on delete set null,
  add column if not exists responsavel_em timestamptz;

-- Até aqui "Admin" era texto livre na coluna cargo (tinha "Admin",
-- "Adm", "TI"...). Isto é a marcação de verdade, e serve de base pro
-- controle de permissões maior que ainda vamos fazer.
alter table staff_members
  add column if not exists admin boolean not null default false;

update staff_members
   set admin = true
 where lower(email) in ('julia.suzuki@artesanos.adm.br', 'guilherme.araujo@artesanos.adm.br');

create or replace function public.usuario_e_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from staff_members
     where user_id = auth.uid()
       and admin
  );
$$;

create or replace function public.trava_responsavel_do_lead()
returns trigger
language plpgsql
as $$
begin
  if new.responsavel_id is distinct from old.responsavel_id then
    if old.responsavel_id is not null and not public.usuario_e_admin() then
      raise exception 'Este lead já tem responsável. Só um administrador pode trocar.'
        using errcode = 'check_violation';
    end if;
    -- a data vem do banco, não do navegador
    new.responsavel_em := case when new.responsavel_id is null then null else now() end;
  end if;
  return new;
end;
$$;

drop trigger if exists trava_responsavel_do_lead on leads;
create trigger trava_responsavel_do_lead
  before update on leads
  for each row
  execute function public.trava_responsavel_do_lead();

revoke execute on function public.usuario_e_admin() from public, anon;
grant execute on function public.usuario_e_admin() to authenticated;
