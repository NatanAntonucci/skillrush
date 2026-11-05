-- rollback/0003_rls.sql
begin;

drop policy if exists "agents public read" on public.agents;
drop policy if exists "maps public read" on public.maps;
drop policy if exists "abilities public read" on public.abilities;
drop policy if exists "lineups public read" on public.lineups;
drop policy if exists "lineups author read" on public.lineups;
drop policy if exists "lineups author insert" on public.lineups;
drop policy if exists "lineups admin all" on public.lineups;

alter table public.agents disable row level security;
alter table public.maps disable row level security;
alter table public.abilities disable row level security;
alter table public.lineups disable row level security;

grant insert, update, delete on public.agents to authenticated;
grant insert, update, delete on public.maps to authenticated;
grant insert, update, delete on public.abilities to authenticated;

commit;
