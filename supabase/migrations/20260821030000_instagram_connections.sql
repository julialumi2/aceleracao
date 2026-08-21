-- Guarda a conexão do Instagram de cada cliente (token de acesso obtido
-- via OAuth do Facebook) pra puxar métricas automaticamente na aba
-- Intensidade. Sem policy nenhuma aqui de propósito: nem staff nem
-- cliente devem conseguir ler o token bruto pelo Supabase — só o
-- asaas-proxy, usando a service_role key, acessa esta tabela.
create table if not exists public.instagram_connections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade unique,
  instagram_user_id text not null,
  instagram_username text,
  page_id text,
  access_token text not null,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now()
);

alter table public.instagram_connections enable row level security;
