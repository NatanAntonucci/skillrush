-- Explicita privilégios para projetos novos sem depender de default privileges
-- previamente configurados no dashboard. RLS continua sendo aplicada.
begin;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.agents, public.maps, public.abilities, public.lineups to anon, authenticated;
grant insert, update, delete on public.lineups to authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.agents, public.maps, public.abilities, public.lineups, public.profiles to service_role;
notify pgrst, 'reload schema';
commit;
