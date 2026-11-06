-- 0009_ability_names_pt.sql
-- Os nomes de habilidade passaram a ser sincronizados em pt-BR (a API do
-- Valorant já entrega localizado). Backfill do nome desnormalizado nas lineups.
-- Idempotente: pode rodar novamente.

begin;

update public.lineups l
set ability_name = a.display_name
from public.abilities a
where a.id = l.ability_id
  and l.ability_name is distinct from a.display_name;

commit;
