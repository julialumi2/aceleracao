-- Tarefas eram visíveis/editáveis por qualquer conta autenticada — cada
-- membro da equipe via as tarefas de todo mundo. Agora cada tarefa
-- pertence a quem criou (default automático, o cliente nem precisa
-- mandar esse campo) e só aparece pra ela.
--
-- Tarefas antigas (sem created_by, criadas antes desta migration)
-- continuam visíveis pra todo mundo — não tem como saber retroativamente
-- quem criou cada uma.
alter table tasks add column created_by uuid references auth.users(id);
alter table tasks alter column created_by set default auth.uid();

drop policy "Equipe gerencia tasks" on tasks;

create policy "Equipe ve e edita as proprias tarefas"
  on tasks
  for all
  using (auth.role() = 'authenticated' and (created_by = auth.uid() or created_by is null))
  with check (auth.role() = 'authenticated' and created_by = auth.uid());
