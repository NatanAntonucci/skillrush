-- SKILLRUSH: INSTALAÇÃO PARA PROJETO SUPABASE NOVO
-- Cole este arquivo inteiro no SQL Editor e execute uma vez.
-- Não contém chaves, não cria usuários admin e não insere lineups fictícias.
begin;
do $$
begin
  if to_regclass('public.agents') is not null
    or to_regclass('public.maps') is not null
    or to_regclass('public.abilities') is not null
    or to_regclass('public.lineups') is not null then
    raise exception 'Instalacao cancelada: schema base ja existe. Nao execute este instalador novamente; aplique somente as migrations pendentes.';
  end if;
end;
$$;

-- ARQUIVO: 0000_base_schema.sql
-- Schema base necessário em projetos Supabase novos.
-- IDs de habilidades são TEXT: o sync usa <uuid-do-agente>-<slot>.

create table if not exists public.agents (
  id uuid primary key,
  display_name text not null,
  display_icon text,
  description text,
  role_display_name text,
  role_display_icon text
);

create table if not exists public.maps (
  id uuid primary key,
  display_name text not null,
  display_icon text,
  list_view_icon text,
  splash text,
  is_competitive boolean not null default false
);

create table if not exists public.abilities (
  id text primary key,
  agent_id uuid not null references public.agents(id) on delete cascade,
  slot text not null,
  display_name text not null,
  display_icon text
);
create index if not exists abilities_agent_idx on public.abilities(agent_id);

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  video_url text not null,
  agent_id uuid not null,
  map_id uuid not null,
  ability_id text not null,
  ability_name text not null,
  difficulty text,
  side text,
  hotspot_x double precision not null,
  hotspot_y double precision not null,
  hotspot_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sem acesso público até as policies/grants das migrations seguintes.
alter table public.agents enable row level security;
alter table public.maps enable row level security;
alter table public.abilities enable row level security;
alter table public.lineups enable row level security;


-- ARQUIVO: 0001_profiles.sql
-- 0001_profiles.sql
-- Papéis de usuário (user / moderator / admin) e função auxiliar para RLS.
-- Rode no SQL Editor do Supabase. Rollback em supabase/rollback/0001_profiles.sql

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


-- ARQUIVO: 0002_lineups_model.sql
-- 0002_lineups_model.sql
-- Estado de publicação, autoria, slug e integridade da tabela lineups.
-- Rollback em supabase/rollback/0002_lineups_model.sql

alter table public.lineups
  add column if not exists status text not null default 'pending',
  add column if not exists author_id uuid,
  add column if not exists slug text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz;

-- tudo que já existia é conteúdo publicado
update public.lineups set status = 'approved' where status = 'pending';

alter table public.lineups
  alter column id set default gen_random_uuid();

-- slug retroativo para linhas antigas
update public.lineups
set slug = btrim(
      lower(regexp_replace(coalesce(title, 'lineup'), '[^a-zA-Z0-9]+', '-', 'g')),
      '-'
    ) || '-' || left(id::text, 8)
where slug is null or btrim(slug) = '';

alter table public.lineups alter column slug set not null;

-- constraints (idempotentes)
do $$
begin
  alter table public.lineups
    add constraint lineups_status_check check (status in ('approved', 'pending', 'rejected'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lineups
    add constraint lineups_difficulty_check check (difficulty is null or difficulty in ('easy', 'medium', 'hard'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lineups
    add constraint lineups_side_check check (side is null or side in ('attack', 'defense'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lineups
    add constraint lineups_hotspot_check check (hotspot_x between 0 and 100 and hotspot_y between 0 and 100);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lineups
    add constraint lineups_title_check check (char_length(title) between 3 and 120);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.lineups
    add constraint lineups_description_check check (char_length(description) between 10 and 2000);
exception when duplicate_object then null;
end $$;

-- chaves estrangeiras para a metadata oficial
-- Só cria se a coluna ainda não tiver nenhuma FK: em bancos que já tinham
-- lineups_agent_id_fkey (criada pelo dashboard), duplicar quebra o PostgREST
-- (erro PGRST201: "more than one relationship").
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.lineups'::regclass
      and c.contype = 'f'
      and a.attname = 'agent_id'
  ) then
    alter table public.lineups
      add constraint lineups_agent_fk foreign key (agent_id) references public.agents (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.lineups'::regclass
      and c.contype = 'f'
      and a.attname = 'map_id'
  ) then
    alter table public.lineups
      add constraint lineups_map_fk foreign key (map_id) references public.maps (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.conrelid = 'public.lineups'::regclass
      and c.contype = 'f'
      and a.attname = 'ability_id'
  ) then
    alter table public.lineups
      add constraint lineups_ability_fk foreign key (ability_id) references public.abilities (id);
  end if;
end $$;

-- slug automático e updated_at
create or replace function public.lineups_prepare()
returns trigger
language plpgsql
as $$
begin
  if new.id is null then
    new.id := gen_random_uuid();
  end if;

  if new.slug is null or btrim(new.slug) = '' then
    new.slug :=
      coalesce(
        nullif(
          btrim(
            lower(regexp_replace(coalesce(new.title, 'lineup'), '[^a-zA-Z0-9]+', '-', 'g')),
            '-'
          ),
          ''
        ),
        'lineup'
      ) || '-' || left(new.id::text, 8);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists lineups_prepare_insert on public.lineups;
create trigger lineups_prepare_insert
  before insert on public.lineups
  for each row execute function public.lineups_prepare();

create or replace function public.lineups_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists lineups_touch on public.lineups;
create trigger lineups_touch
  before update on public.lineups
  for each row execute function public.lineups_touch_updated_at();

-- índices
create unique index if not exists lineups_slug_key on public.lineups (slug);
create index if not exists lineups_map_agent_status_idx on public.lineups (map_id, agent_id, status);
create index if not exists lineups_status_created_idx on public.lineups (status, created_at desc);
create index if not exists lineups_author_idx on public.lineups (author_id);
create index if not exists lineups_video_url_idx on public.lineups (video_url);


-- ARQUIVO: 0003_rls.sql
-- 0003_rls.sql
-- Autorização no banco: leitura pública do conteúdo aprovado, escrita só para admin/mod.
-- Rollback em supabase/rollback/0003_rls.sql

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


-- ARQUIVO: 0004_hardening.sql
-- 0004_hardening.sql
-- Limites antiabuso que não dependem de servidor.
-- Rollback em supabase/rollback/0004_hardening.sql

create or replace function public.enforce_pending_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  pending_count integer;
begin
  if new.status = 'pending' then
    select count(*) into pending_count
    from public.lineups
    where author_id = new.author_id
      and status = 'pending';

    if pending_count >= 5 then
      raise exception 'Limite de 5 lineups pendentes por usuario atingido'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists lineups_pending_limit on public.lineups;
create trigger lineups_pending_limit
  before insert on public.lineups
  for each row execute function public.enforce_pending_limit();

-- vídeo não pode ser vazio nem gigante
do $$
begin
  alter table public.lineups
    add constraint lineups_video_url_check check (char_length(video_url) between 8 and 500);
exception when duplicate_object then null;
end $$;


-- ARQUIVO: 0005_cleanup_legacy_policies.sql
-- 0005_cleanup_legacy_policies.sql
-- Remove policies criadas manualmente no dashboard antes do modelo novo.
-- A policy "public read lineups" usava USING (true), o que expunha lineups
-- pendentes/rejeitadas na leitura pública. As demais eram duplicatas.

drop policy if exists "public read lineups" on public.lineups;
drop policy if exists "admin insert lineups only" on public.lineups;
drop policy if exists "public read agents" on public.agents;
drop policy if exists "public read maps" on public.maps;
drop policy if exists "public read abilities" on public.abilities;

-- Rollback: não recriar. Reintroduziria a exposição de conteúdo pendente.


-- ARQUIVO: 0006_map_competitiveness.sql
-- 0006_map_competitiveness.sql
-- Curadoria da flag `is_competitive`, que agora é a única fonte de verdade
-- para os seletores de mapa (antes era uma lista fixa no código e deixava
-- Abyss/Corrode de fora, além de mostrar mapas de TDM).
-- Idempotente: pode rodar de novo sem efeito colateral.

update public.maps
set is_competitive = true
where display_name in (
  'Ascent', 'Bind', 'Breeze', 'Corrode', 'Fracture', 'Haven',
  'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset', 'Abyss'
);

update public.maps
set is_competitive = false
where display_name in (
  'District', 'Kasbah', 'Piazza', 'Glitch', 'Drift',
  'The Range', 'Skirmish A', 'Skirmish B', 'Skirmish C',
  'Basic Training', 'Menu'
);


-- ARQUIVO: 0007_maps_tactical.sql
-- 0007_maps_tactical.sql
-- Campos de conteúdo do mapa (usados nas páginas de conteúdo /maps e /maps/[slug]).

alter table public.maps
  add column if not exists tactical_description text;


-- ARQUIVO: 0008_summit_competitive.sql
-- 0008_summit_competitive.sql
-- Summit entrou na rotação competitiva (tem "A/B Sites"); Gauntlet e os Skirmish
-- novos são de outros modos e ficam fora dos seletores.

update public.maps set is_competitive = true where display_name = 'Summit';
update public.maps set is_competitive = false where display_name in ('Gauntlet', 'Skirmish D', 'Skirmish E');


-- ARQUIVO: 0009_ability_names_pt.sql
-- 0009_ability_names_pt.sql
-- Os nomes de habilidade passaram a ser sincronizados em pt-BR (a API do
-- Valorant já entrega localizado). Backfill do nome desnormalizado nas lineups.
-- Idempotente: pode rodar novamente.

update public.lineups l
set ability_name = a.display_name
from public.abilities a
where a.id = l.ability_id
  and l.ability_name is distinct from a.display_name;


-- ARQUIVO: 0010_list_profiles.sql
-- 0010_list_profiles.sql
-- Lista a equipe (profiles + e-mail) para a tela /admin/equipe.
-- O e-mail vive em auth.users, que não é exposto ao cliente; por isso a função
-- é security definer e só devolve dados para quem é admin.

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


-- ARQUIVO: 0011_integrations.sql

-- Only the Edge Function service role can access provider payloads / counters.
create table if not exists public.integration_cache (
  cache_key text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
create index if not exists integration_cache_expiry on public.integration_cache(expires_at);
alter table public.integration_cache enable row level security;
revoke all on public.integration_cache from public, anon, authenticated;
grant all on public.integration_cache to service_role;

create table if not exists public.tracker_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  riot_id text not null check (char_length(riot_id) between 3 and 100),
  consent_version text not null default '2026-11-07',
  accepted_at timestamptz not null default now()
);
alter table public.tracker_consents enable row level security;
revoke all on public.tracker_consents from public, anon, authenticated;
grant all on public.tracker_consents to service_role;

-- Revocation also removes any in-flight cache write committed before the delete.
do $$ begin
  alter table public.integration_cache add constraint integration_cache_consent_fk
    foreign key (owner_id) references public.tracker_consents(user_id) on delete cascade;
exception when duplicate_object then null; end $$;

create table if not exists public.integration_limits (
  bucket text not null,
  window_start bigint not null,
  used integer not null,
  primary key (bucket, window_start)
);
alter table public.integration_limits enable row level security;
revoke all on public.integration_limits from public, anon, authenticated;
grant all on public.integration_limits to service_role;

-- Atomic quota reservation across all Edge isolates; fail closed on DB errors.
create or replace function public.reserve_integration_quota(p_bucket text, p_seconds integer, p_limit integer, p_cost integer default 1)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_window bigint; v_used integer;
begin
  if p_seconds < 1 or p_limit < 1 or p_cost < 1 or p_cost > p_limit then return false; end if;
  v_window := floor(extract(epoch from now()) / p_seconds)::bigint * p_seconds;
  insert into public.integration_limits(bucket, window_start, used)
  values(p_bucket, v_window, p_cost)
  on conflict(bucket, window_start) do update set used = integration_limits.used + p_cost
  where integration_limits.used + p_cost <= p_limit
  returning used into v_used;
  delete from public.integration_limits where window_start < extract(epoch from now()) - 86400;
  delete from public.integration_cache where expires_at < now() - interval '1 day';
  return v_used is not null;
end;
$$;
revoke all on function public.reserve_integration_quota(text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_integration_quota(text, integer, integer, integer) to service_role;


-- ARQUIVO: 0012_explicit_grants.sql
-- Explicita privilégios para projetos novos sem depender de default privileges
-- previamente configurados no dashboard. RLS continua sendo aplicada.

grant usage on schema public to anon, authenticated, service_role;
grant select on public.agents, public.maps, public.abilities, public.lineups to anon, authenticated;
grant insert, update, delete on public.lineups to authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.agents, public.maps, public.abilities, public.lineups, public.profiles to service_role;
notify pgrst, 'reload schema';


notify pgrst, 'reload schema';
commit;
