-- Schema base necessário em projetos Supabase novos.
-- IDs de habilidades são TEXT: o sync usa <uuid-do-agente>-<slot>.
begin;

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
commit;
