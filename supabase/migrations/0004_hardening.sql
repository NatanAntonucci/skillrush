-- 0004_hardening.sql
-- Limites antiabuso que não dependem de servidor.
-- Rollback em supabase/rollback/0004_hardening.sql

begin;

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

commit;
