-- Dia de vencimento real de clientes pode cair em 29, 30 ou 31 —
-- a trava original (1-28) foi conservadora demais e bloqueava
-- vínculos legítimos de assinatura já existente no Asaas.
alter table restaurants drop constraint restaurants_dia_vencimento_recorrente_check;
alter table restaurants add constraint restaurants_dia_vencimento_recorrente_check
  check (dia_vencimento_recorrente >= 1 and dia_vencimento_recorrente <= 31);
