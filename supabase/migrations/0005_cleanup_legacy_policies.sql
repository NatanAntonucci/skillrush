-- 0005_cleanup_legacy_policies.sql
-- Remove policies criadas manualmente no dashboard antes do modelo novo.
-- A policy "public read lineups" usava USING (true), o que expunha lineups
-- pendentes/rejeitadas na leitura pública. As demais eram duplicatas.

begin;

drop policy if exists "public read lineups" on public.lineups;
drop policy if exists "admin insert lineups only" on public.lineups;
drop policy if exists "public read agents" on public.agents;
drop policy if exists "public read maps" on public.maps;
drop policy if exists "public read abilities" on public.abilities;

commit;

-- Rollback: não recriar. Reintroduziria a exposição de conteúdo pendente.
