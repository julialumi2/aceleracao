-- Garante um único registro de contrato por restaurante, necessário pro
-- upsert (on conflict) usado em setContractStatus/setContractDocumentUrl.
alter table public.contracts
  add constraint contracts_restaurant_id_key unique (restaurant_id);
