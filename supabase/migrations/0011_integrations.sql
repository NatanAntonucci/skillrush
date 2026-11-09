begin;
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
commit;
