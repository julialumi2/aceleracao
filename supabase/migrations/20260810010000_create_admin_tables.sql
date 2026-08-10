-- Estrutura de apoio ao painel administrativo (CRM interno).
-- `restaurants` é a mesma tabela referenciada pelo cadastro do app do cliente
-- (src/lib/supabase.js); as demais dão suporte às telas de admin.

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  nome text not null,
  cnpj text,
  endereco text,
  cep text,
  telefone text,
  email text,
  banco text,
  agencia text,
  conta text,
  dias_funcionamento text[],
  horario_abertura text,
  horario_fechamento text,
  created_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'assinado')),
  clicksign_document_url text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  valor numeric(10, 2) not null,
  vencimento date not null,
  status text not null default 'pendente' check (status in ('pago', 'pendente', 'atrasado')),
  asaas_id text,
  created_at timestamptz not null default now()
);

-- Preenchido manualmente pela equipe por enquanto; campo `origem` permite
-- diferenciar quando a verificação por IA/Instagram entrar em produção.
create table if not exists public.intensity_checks (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  status text not null check (status in ('ativo', 'em_queda', 'inativo')),
  observacao text,
  origem text not null default 'manual' check (origem in ('manual', 'automatico')),
  checked_by uuid references auth.users(id),
  checked_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.intensity_checks enable row level security;

-- Acesso interno: qualquer usuário autenticado (equipe) pode gerenciar.
-- Quando houver tabela de papéis (staff_members), trocar por checagem de role.
create policy "Equipe gerencia restaurants" on public.restaurants
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Equipe gerencia contracts" on public.contracts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Equipe gerencia invoices" on public.invoices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Equipe gerencia intensity_checks" on public.intensity_checks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
