-- 0007_maps_tactical.sql
-- Campos de conteúdo do mapa (usados nas páginas de conteúdo /maps e /maps/[slug]).

begin;

alter table public.maps
  add column if not exists tactical_description text;

commit;
