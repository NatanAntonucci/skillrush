-- rollback/0004_hardening.sql
begin;

drop trigger if exists lineups_pending_limit on public.lineups;
drop function if exists public.enforce_pending_limit();
alter table public.lineups drop constraint if exists lineups_video_url_check;

commit;
