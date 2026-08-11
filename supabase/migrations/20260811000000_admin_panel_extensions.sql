-- Campos e tabelas que o painel admin passou a precisar depois da
-- primeira versão do schema (saúde da campanha, histórico de contrato,
-- fila de alertas de cobrança, log de mensagens de intensidade).

alter table public.restaurants
  add column if not exists cardapio_url text,
  add column if not exists saude text not null default 'laranja' check (saude in ('verde', 'amarelo', 'laranja'));

-- Histórico de eventos do contrato (envio, assinatura, etc.) — a tabela
-- `contracts` continua guardando só o status atual.
create table if not exists public.contract_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  evento text not null,
  data date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.invoices
  add column if not exists alerta_enviado_em date;

alter table public.intensity_checks
  add column if not exists mensagem_enviada boolean not null default false;

alter table public.contract_events enable row level security;

create policy "Equipe gerencia contract_events" on public.contract_events
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
