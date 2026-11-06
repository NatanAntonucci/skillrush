import { describe, expect, it } from 'vitest';

import { applyFilters } from './filters';

import type { Lineup } from '@/types';

function lineup(overrides: Partial<Lineup> = {}): Lineup {
  return {
    id: 'id',
    slug: 'slug',
    title: 'lineup',
    description: 'descricao',
    videoUrl: 'https://youtu.be/abc123',
    difficulty: 'easy',
    side: 'attack',
    status: 'approved',
    authorId: null,
    createdAt: null,
    hotspot: { x: 10, y: 20, label: 'A' },
    agentId: 'agent',
    mapId: 'map',
    abilityId: 'ability',
    abilityName: 'Smoke',
    ...overrides,
  };
}

describe('applyFilters', () => {
  it('sem filtros retorna tudo', () => {
    const lineups = [lineup(), lineup({ id: '2', abilityName: 'Flash' })];

    expect(applyFilters(lineups, { abilities: [], difficulty: null, side: null })).toHaveLength(2);
  });

  it('filtra por dificuldade', () => {
    const lineups = [
      lineup({ id: '1', difficulty: 'easy' }),
      lineup({ id: '2', difficulty: 'hard' }),
    ];

    const result = applyFilters(lineups, { abilities: [], difficulty: 'hard', side: null });

    expect(result.map((item) => item.id)).toEqual(['2']);
  });

  it('filtra por lado', () => {
    const lineups = [
      lineup({ id: '1', side: 'attack' }),
      lineup({ id: '2', side: 'defense' }),
    ];

    const result = applyFilters(lineups, { abilities: [], difficulty: null, side: 'defense' });

    expect(result.map((item) => item.id)).toEqual(['2']);
  });

  it('combina habilidades com OR, não AND', () => {
    const lineups = [
      lineup({ id: '1', abilityName: 'Smoke' }),
      lineup({ id: '2', abilityName: 'Flash' }),
      lineup({ id: '3', abilityName: 'Molotov' }),
    ];

    const result = applyFilters(lineups, {
      abilities: ['Smoke', 'Flash'],
      difficulty: null,
      side: null,
    });

    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('compara habilidade sem diferenciar maiúsculas', () => {
    const lineups = [lineup({ id: '1', abilityName: 'Recon Bolt' })];

    const result = applyFilters(lineups, {
      abilities: ['recon bolt'],
      difficulty: null,
      side: null,
    });

    expect(result).toHaveLength(1);
  });

  it('aplica todos os filtros juntos', () => {
    const lineups = [
      lineup({ id: '1', abilityName: 'Smoke', difficulty: 'easy', side: 'attack' }),
      lineup({ id: '2', abilityName: 'Smoke', difficulty: 'hard', side: 'attack' }),
      lineup({ id: '3', abilityName: 'Flash', difficulty: 'easy', side: 'attack' }),
    ];

    const result = applyFilters(lineups, {
      abilities: ['Smoke'],
      difficulty: 'easy',
      side: 'attack',
    });

    expect(result.map((item) => item.id)).toEqual(['1']);
  });
});
