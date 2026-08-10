-- Tabela para receber os envios do Google Forms (prospects que ainda não
-- criaram conta pelo app). Preenchida pelo Apps Script em scripts/google-forms-sync.gs.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  email text not null,
  cnpj text,
  endereco text,
  cep text,
  banco text,
  agencia text,
  conta text,
  dias_funcionamento text[],
  horario_abertura text,
  horario_fechamento text,
  status text not null default 'novo', -- novo | contatado | convertido | descartado
  origem text not null default 'google_forms'
);

alter table public.leads enable row level security;

-- Apps Script insere usando a service_role key (via UrlFetchApp), que
-- ignora RLS — nenhuma policy de insert público é necessária aqui.
create policy "Equipe autenticada pode ver leads"
  on public.leads for select
  using (auth.role() = 'authenticated');

create policy "Equipe autenticada pode atualizar status do lead"
  on public.leads for update
  using (auth.role() = 'authenticated');
