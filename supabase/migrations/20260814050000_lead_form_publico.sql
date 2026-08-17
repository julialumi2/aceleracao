alter table leads
  add column nome_negocio text,
  add column faturamento_mensal text,
  add column maior_gargalo text,
  add column gestor_trafego text,
  add column mensagem text;

-- Formulário público (bio do Instagram / tráfego pago) — só permite
-- inserir um lead novo, nunca ler, alterar ou apagar os já existentes.
create policy "Publico pode cadastrar lead pelo formulario"
  on leads
  for insert
  to anon
  with check (status = 'novo');
