-- 0006_map_competitiveness.sql
-- Curadoria da flag `is_competitive`, que agora é a única fonte de verdade
-- para os seletores de mapa (antes era uma lista fixa no código e deixava
-- Abyss/Corrode de fora, além de mostrar mapas de TDM).
-- Idempotente: pode rodar de novo sem efeito colateral.

begin;

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

commit;
