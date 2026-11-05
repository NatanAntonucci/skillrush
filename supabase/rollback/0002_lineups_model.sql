-- rollback/0002_lineups_model.sql
begin;

drop trigger if exists lineups_prepare_insert on public.lineups;
drop trigger if exists lineups_touch on public.lineups;
drop function if exists public.lineups_prepare();
drop function if exists public.lineups_touch_updated_at();

drop index if exists public.lineups_slug_key;
drop index if exists public.lineups_map_agent_status_idx;
drop index if exists public.lineups_status_created_idx;
drop index if exists public.lineups_author_idx;
drop index if exists public.lineups_video_url_idx;

alter table public.lineups drop constraint if exists lineups_agent_fk;
alter table public.lineups drop constraint if exists lineups_map_fk;
alter table public.lineups drop constraint if exists lineups_ability_fk;
alter table public.lineups drop constraint if exists lineups_status_check;
alter table public.lineups drop constraint if exists lineups_difficulty_check;
alter table public.lineups drop constraint if exists lineups_side_check;
alter table public.lineups drop constraint if exists lineups_hotspot_check;
alter table public.lineups drop constraint if exists lineups_title_check;
alter table public.lineups drop constraint if exists lineups_description_check;

alter table public.lineups
  drop column if exists status,
  drop column if exists author_id,
  drop column if exists slug,
  drop column if exists reviewed_by,
  drop column if exists reviewed_at;

commit;
