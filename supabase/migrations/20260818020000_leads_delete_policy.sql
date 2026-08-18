create policy "Equipe autenticada pode excluir lead"
  on public.leads
  for delete
  using (auth.role() = 'authenticated');
