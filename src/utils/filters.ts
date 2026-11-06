import type { Lineup } from '@/types';

export interface LineupFilters {
  abilities: string[];
  difficulty: string | null;
  side: string | null;
}

/**
 * Fonte única de verdade dos filtros: lista e mapa precisam mostrar
 * exatamente o mesmo conjunto, senão o mapa exibe hotspot de lineup
 * que a lista escondeu.
 */
export function applyFilters(lineups: Lineup[], filters: LineupFilters): Lineup[] {
  return lineups.filter((lineup) => {
    if (filters.difficulty && lineup.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.side && lineup.side !== filters.side) {
      return false;
    }

    if (filters.abilities.length > 0) {
      const abilityName = (lineup.abilityName ?? '').toLowerCase();
      return filters.abilities.some((ability) => ability.toLowerCase() === abilityName);
    }

    return true;
  });
}
