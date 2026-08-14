create table tasks (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  categoria text,
  prioridade text not null default 'media' check (prioridade in ('urgente', 'alta', 'media', 'baixa')),
  status text not null default 'a_fazer' check (status in ('a_fazer', 'em_andamento', 'feito')),
  prazo date,
  restaurant_id uuid references restaurants(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "Equipe gerencia tasks"
  on tasks
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
