-- Tela "Análise de Anúncios e Origem" do painel: mostra de onde vêm os
-- leads e quais origens trazem negócio acima de R$ 30 mil/mês.
--
-- A conta é feita aqui no banco (o painel só recebe o resumo já somado) e
-- nenhuma função devolve telefone ou e-mail: dado pessoal continua só na
-- aba Leads, que tem as mesmas permissões.

-- Público do anúncio. As outras quatro utm_* já existiam; só os leads
-- novos vão ter esta preenchida.
alter table leads
  add column if not exists utm_term text;

-- Faturamento informado no formulário -> grupo de negócio:
--   'acima_30k'      > R$ 30 mil/mês
--   'ate_30k'        <= R$ 30 mil/mês (30 mil exatos entram aqui)
--   'nao_informado'  entra no total geral, fora dos dois grupos
--
-- O formulário só grava as quatro faixas fixas. O resto são respostas
-- digitadas à mão na época em que o campo era texto livre — lista fechada
-- (nenhum lead novo cai nela) e conferida com a equipe em 28/09/2026.
create or replace function public.faixa_faturamento(valor text)
returns text
language sql
immutable
as $$
  select case
    when valor is null or btrim(valor) = '' then 'nao_informado'

    -- faixas atuais do formulário
    when lower(btrim(valor)) = 'até r$ 10 mil' then 'ate_30k'
    when lower(btrim(valor)) = 'r$ 10 mil a r$ 30 mil' then 'ate_30k'
    when lower(btrim(valor)) = 'r$ 30 mil a r$ 60 mil' then 'acima_30k'
    when lower(btrim(valor)) = 'acima de r$ 60 mil' then 'acima_30k'

    -- respostas antigas em texto livre, acima de 30 mil
    -- ("50" e "50.00" = 50 mil, decidido com a equipe)
    when btrim(valor) in ('110000', '50', '50.00', '32000', '38000') then 'acima_30k'

    -- respostas antigas em texto livre, até 30 mil
    when btrim(valor) in (
      '0', '0,000', '3000', '4000', '5000', '5.000', '10000', '10.000', '10,000',
      '13,000 mil', '15000', '20000', '20.000', '22k', '25000', '25.000',
      '28000', '28.000', '30 mil', '30.000,00'
    ) then 'ate_30k'
    when btrim(valor) like '1500%' then 'ate_30k'
    -- resposta em frase: "...chegava em 60, agora ... está nos 15.000,00..."
    when lower(valor) like '%agora que estamos só com o delivery%' then 'ate_30k'

    else 'nao_informado'
  end;
$$;

-- Leads do período agrupados pela origem, no nível pedido.
-- p_nivel: 'source' | 'campaign' | 'content' | 'term'.
-- A chave de agrupamento é a UTM em minúsculas e sem espaços nas pontas
-- ("Facebook" e "facebook " viram a mesma origem); o rótulo devolvido é a
-- grafia mais frequente. Lead sem UTM volta com chave e rótulo vazios — a
-- tela mostra "Direto / sem UTM" e nunca descarta.
create or replace function public.analise_origem_por_origem(
  p_inicio date,
  p_fim date,
  p_nivel text default 'campaign'
)
returns table (
  origem_chave text,
  origem text,
  total bigint,
  acima_30k bigint,
  ate_30k bigint,
  nao_informado bigint
)
language plpgsql
stable
as $$
begin
  if p_nivel not in ('source', 'campaign', 'content', 'term') then
    raise exception 'nível de origem inválido: %', p_nivel;
  end if;

  return query
  with base as (
    select
      nullif(btrim(case p_nivel
        when 'source' then l.utm_source
        when 'campaign' then l.utm_campaign
        when 'content' then l.utm_content
        when 'term' then l.utm_term
      end), '') as origem_original,
      public.faixa_faturamento(l.faturamento_mensal) as faixa
    from leads l
    where (l.created_at at time zone 'America/Sao_Paulo')::date between p_inicio and p_fim
  )
  select
    coalesce(lower(base.origem_original), '') as origem_chave,
    coalesce(mode() within group (order by base.origem_original), '') as origem,
    count(*) as total,
    count(*) filter (where base.faixa = 'acima_30k') as acima_30k,
    count(*) filter (where base.faixa = 'ate_30k') as ate_30k,
    count(*) filter (where base.faixa = 'nao_informado') as nao_informado
  from base
  group by coalesce(lower(base.origem_original), '')
  order by count(*) desc;
end;
$$;

-- Leads do período por dia (fuso de São Paulo), pro gráfico de evolução.
create or replace function public.analise_origem_por_dia(p_inicio date, p_fim date)
returns table (
  dia date,
  total bigint,
  acima_30k bigint,
  ate_30k bigint,
  nao_informado bigint
)
language sql
stable
as $$
  select
    (l.created_at at time zone 'America/Sao_Paulo')::date as dia,
    count(*) as total,
    count(*) filter (where public.faixa_faturamento(l.faturamento_mensal) = 'acima_30k') as acima_30k,
    count(*) filter (where public.faixa_faturamento(l.faturamento_mensal) = 'ate_30k') as ate_30k,
    count(*) filter (where public.faixa_faturamento(l.faturamento_mensal) = 'nao_informado') as nao_informado
  from leads l
  where (l.created_at at time zone 'America/Sao_Paulo')::date between p_inicio and p_fim
  group by 1
  order by 1;
$$;

-- As funções rodam com a permissão de quem chama (security invoker), então
-- a RLS da tabela leads continua valendo: só a equipe logada enxerga.
revoke execute on function public.faixa_faturamento(text) from public, anon;
revoke execute on function public.analise_origem_por_origem(date, date, text) from public, anon;
revoke execute on function public.analise_origem_por_dia(date, date) from public, anon;

grant execute on function public.faixa_faturamento(text) to authenticated;
grant execute on function public.analise_origem_por_origem(date, date, text) to authenticated;
grant execute on function public.analise_origem_por_dia(date, date) to authenticated;
