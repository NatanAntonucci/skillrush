-- 0001_profiles.sql
-- Papéis de usuário (user / moderator / admin) e função auxiliar para RLS.
-- Rode no SQL Editor do Supabase. Rollback em supabase/rollback/0001_profiles.sql

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  display_name text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público do usuário com papel de autorização.';
comment on column public.profiles.role is 'user | moderator | admin';

alter table public.profiles enable row level security;

-- security definer: consulta profiles sem recursão de policy
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'moderator')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- administrador "estrito": moderadores não podem alterar papéis (evita autopromoção)
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

-- cria perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill de usuários já existentes
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read"
  on public.profiles for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
  on public.profiles for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

commit;
