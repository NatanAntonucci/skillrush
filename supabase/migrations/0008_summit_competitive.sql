-- 0008_summit_competitive.sql
-- Summit entrou na rotação competitiva (tem "A/B Sites"); Gauntlet e os Skirmish
-- novos são de outros modos e ficam fora dos seletores.

begin;

update public.maps set is_competitive = true where display_name = 'Summit';
update public.maps set is_competitive = false where display_name in ('Gauntlet', 'Skirmish D', 'Skirmish E');

commit;
