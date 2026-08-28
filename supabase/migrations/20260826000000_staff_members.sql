-- Lista real da equipe, pra tela de Configurações parar de depender de
-- um array fixo no código (que "esquecia" gente criada depois do
-- primeiro F5). Cada linha corresponde a uma conta do Supabase Auth.
create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  cargo text,
  created_at timestamptz not null default now()
);

alter table public.staff_members enable row level security;

create policy "Equipe ve e gerencia staff_members"
  on public.staff_members
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Backfill dos 4 integrantes que já existiam antes desta tabela.
insert into public.staff_members (user_id, nome, email, cargo)
values
  ('22be7833-9d3d-4ddc-80aa-f1ffeb86c35d', 'Guilherme Araújo', 'guilherme.araujo@artesanos.adm.br', 'Admin'),
  ('3ef646fc-7b32-4d9b-aa6c-07a11ff0e468', 'Kevyn', 'kevynadm02artesanos@gmail.com', 'Adm'),
  ('227aaba4-6103-420b-827a-0798bfa2f28c', 'Kethllyn', 'kethllynadmartesanos@outlook.com', 'Adm'),
  ('ccb03432-807a-4815-954c-2c07fb972dc9', 'Julia', 'julia.suzuki@artesanos.adm.br', 'TI')
on conflict (email) do nothing;
