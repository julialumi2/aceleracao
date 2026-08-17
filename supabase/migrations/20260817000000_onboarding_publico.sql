-- Formulário público de onboarding (clientes que já fecharam a mentoria,
-- URL /bem-vindo) — insere direto na tabela restaurants como cliente novo.
-- O WITH CHECK trava todo campo financeiro/sensível em seu valor padrão,
-- então mesmo uma requisição forjada direto na API não consegue criar um
-- cliente já "configurado" (cobrança, Asaas, cancelamento etc.) — só os
-- campos cadastrais/operacionais ficam livres.
create policy "Publico pode cadastrar cliente pelo formulario de onboarding"
  on restaurants
  for insert
  to anon
  with check (
    saude = 'laranja'
    and valor_recorrente is null
    and dia_vencimento_recorrente is null
    and proxima_cobranca_em is null
    and asaas_customer_id is null
    and asaas_subscription_id is null
    and cobranca_configurada_em is null
    and arquivado_em is null
    and periodicidade = 'mensal'
    and valor_recorrente_2 is null
    and dia_vencimento_recorrente_2 is null
    and proxima_cobranca_em_2 is null
    and asaas_subscription_id_2 is null
    and cancelado_em is null
    and motivo_cancelamento is null
  );
