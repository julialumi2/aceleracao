-- Classificação de temperatura pros leads que não fecharam em call
-- (indicados pela equipe, ou vindos do formulário de tráfego frio).
alter table leads add column if not exists temperatura text
  check (temperatura in ('frio', 'morno', 'quente'));

-- Cadastro manual não garante e-mail (ex.: lead que só tem nome e telefone).
alter table leads alter column email drop not null;

-- Faltava permissão de INSERT pra equipe — só existia leitura e update de status.
create policy "Equipe autenticada pode criar lead"
  on leads for insert
  with check (auth.role() = 'authenticated');
