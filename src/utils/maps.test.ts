import { describe, expect, it } from 'vitest';

import { competitiveMaps } from './maps';

import type { MapData } from '@/types';

function map(overrides: Partial<MapData> & { displayName: string }): MapData {
  return {
    id: overrides.displayName.toLowerCase(),
    displayIcon: null,
    listViewIcon: null,
    splash: null,
    isCompetitive: false,
    ...overrides,
  };
}

describe('competitiveMaps', () => {
  it('mantém apenas mapas competitivos', () => {
    const result = competitiveMaps([
      map({ displayName: 'Ascent', isCompetitive: true }),
      map({ displayName: 'District', isCompetitive: false }),
    ]);

    expect(result.map((item) => item.displayName)).toEqual(['Ascent']);
  });

  it('remove duplicatas pelo nome', () => {
    const result = competitiveMaps([
      map({ displayName: 'The Range', isCompetitive: true, id: 'range-1' }),
      map({ displayName: 'The Range', isCompetitive: true, id: 'range-2' }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('range-1');
  });

  it('ordena alfabeticamente', () => {
    const result = competitiveMaps([
      map({ displayName: 'Split', isCompetitive: true }),
      map({ displayName: 'Ascent', isCompetitive: true }),
      map({ displayName: 'Bind', isCompetitive: true }),
    ]);

    expect(result.map((item) => item.displayName)).toEqual(['Ascent', 'Bind', 'Split']);
  });
});
