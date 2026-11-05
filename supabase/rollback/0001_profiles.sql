-- rollback/0001_profiles.sql
begin;

drop policy if exists "profiles self read" on public.profiles;
drop policy if exists "profiles admin read" on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user();
drop function if exists public.is_super_admin();
drop function if exists public.is_admin();
drop table if exists public.profiles;

commit;
