-- Pergunta "Como você classifica seu momento financeiro hoje?" do
-- formulário público (/comecar): Ruim, Razoável, Bom ou Muito bom.
-- Como nas colunas utm_*, a policy de insert anônimo só exige
-- status = 'novo', então não precisa mexer na RLS.
alter table leads
  add column if not exists momento_financeiro text;
