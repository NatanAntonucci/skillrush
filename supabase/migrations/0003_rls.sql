-- 0003_rls.sql
-- Autorização no banco: leitura pública do conteúdo aprovado, escrita só para admin/mod.
-- Rollback em supabase/rollback/0003_rls.sql

begin;

alter table public.agents enable row level security;
alter table public.maps enable row level security;
alter table public.abilities enable row level security;
alter table public.lineups enable row level security;

-- metadata oficial: ninguém escreve pelo cliente (só service role, que ignora RLS)
revoke insert, update, delete on public.agents from anon, authenticated;
revoke insert, update, delete on public.maps from anon, authenticated;
revoke insert, update, delete on public.abilities from anon, authenticated;

drop policy if exists "agents public read" on public.agents;
create policy "agents public read"
  on public.agents for select to anon, authenticated using (true);

drop policy if exists "maps public read" on public.maps;
create policy "maps public read"
  on public.maps for select to anon, authenticated using (true);

drop policy if exists "abilities public read" on public.abilities;
create policy "abilities public read"
  on public.abilities for select to anon, authenticated using (true);

-- lineups
revoke insert, update, delete on public.lineups from anon;

-- política antiga documentada em SUPABASE_SCHEMA.md
drop policy if exists "Lineups are publicly readable" on public.lineups;

drop policy if exists "lineups public read" on public.lineups;
create policy "lineups public read"
  on public.lineups for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "lineups author read" on public.lineups;
create policy "lineups author read"
  on public.lineups for select to authenticated
  using (author_id = auth.uid());

drop policy if exists "lineups author insert" on public.lineups;
create policy "lineups author insert"
  on public.lineups for insert to authenticated
  with check (author_id = auth.uid() and status = 'pending');

drop policy if exists "lineups admin all" on public.lineups;
create policy "lineups admin all"
  on public.lineups for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

commit;
