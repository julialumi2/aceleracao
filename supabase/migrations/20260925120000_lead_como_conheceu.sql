-- Pergunta "Por onde conheceu nosso trabalho?" do formulário público
-- (/comecar): Instagram, Indicação, Comprei um curso ou Anúncios. É a
-- resposta declarada pelo lead, diferente de origem/utm_*, que vêm do
-- link. A policy de insert anônimo só exige status = 'novo', então não
-- precisa mexer na RLS.
alter table leads
  add column if not exists como_conheceu text;
