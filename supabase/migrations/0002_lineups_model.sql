-- 0002_lineups_model.sql
-- Estado de publicação, autoria, slug e integridade da tabela lineups.
-- Rollback em supabase/rollback/0002_lineups_model.sql

begin;

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

commit;
