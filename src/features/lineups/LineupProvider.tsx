'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useLineups } from '@/hooks/useLineups';
import { useLineupStore } from '@/stores/lineupStore';
import { applyFilters } from '@/utils/filters';

import type { Lineup } from '@/types';

interface LineupDataValue {
  /** Tudo que veio do banco para o par agente/mapa. */
  lineups: Lineup[];
  /** Já filtrado por habilidade, dificuldade e lado. */
  visibleLineups: Lineup[];
  loading: boolean;
  error: string | null;
}

const LineupDataContext = createContext<LineupDataValue | null>(null);

/**
 * Centraliza a busca de lineups para que a lista e o mapa consumam
 * a mesma resposta (antes cada componente disparava a própria requisição).
 */
export function LineupProvider({ children }: { children: ReactNode }) {
  const {
    selectedAgent,
    selectedMap,
    selectedLineup,
    filters,
    selectedDifficulty,
    selectedSide,
  } = useLineupStore();

  const { lineups, loading, error } = useLineups({
    agentId: selectedAgent?.id ?? selectedLineup?.agentId,
    mapId: selectedMap?.id ?? selectedLineup?.mapId,
  });

  const visibleLineups = useMemo(
    () =>
      applyFilters(lineups, {
        abilities: filters,
        difficulty: selectedDifficulty,
        side: selectedSide,
      }),
    [lineups, filters, selectedDifficulty, selectedSide],
  );

  const value = useMemo(
    () => ({ lineups, visibleLineups, loading, error }),
    [lineups, visibleLineups, loading, error],
  );

  return <LineupDataContext.Provider value={value}>{children}</LineupDataContext.Provider>;
}

export function useLineupData() {
  const context = useContext(LineupDataContext);

  if (!context) {
    throw new Error('useLineupData precisa ser usado dentro de <LineupProvider>');
  }

  return context;
}
