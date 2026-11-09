begin;
drop function if exists public.reserve_integration_quota(text, integer, integer, integer);
drop table if exists public.integration_limits;
drop table if exists public.integration_cache;
drop table if exists public.tracker_consents;
commit;
