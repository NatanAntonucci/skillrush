import type { MapData } from '@/types';

/**
 * Mapas competitivos, sem duplicata de nome (a API do Valorant tem mais de
 * um "The Range") e em ordem alfabética.
 */
export function competitiveMaps(maps: MapData[]): MapData[] {
  const unique = new Map<string, MapData>();

  for (const map of maps) {
    if (map.isCompetitive !== true) continue;
    if (!unique.has(map.displayName)) {
      unique.set(map.displayName, map);
    }
  }

  return Array.from(unique.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName, 'pt-BR'),
  );
}
