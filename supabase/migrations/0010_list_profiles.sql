-- 0010_list_profiles.sql
-- Lista a equipe (profiles + e-mail) para a tela /admin/equipe.
-- O e-mail vive em auth.users, que não é exposto ao cliente; por isso a função
-- é security definer e só devolve dados para quem é admin.

begin;

create or replace function public.list_profiles()
returns table (
  id uuid,
  email text,
  role text,
  display_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id, u.email::text, p.role, p.display_name, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_super_admin()
  order by p.created_at;
$$;

revoke all on function public.list_profiles() from public;
grant execute on function public.list_profiles() to authenticated;

commit;
