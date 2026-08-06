import { create } from 'zustand';

import type {
  Agent,
  MapData,
  Lineup,
} from '@/types';

interface LineupState {
  selectedAgent: Agent | null;
  selectedMap: MapData | null;

  filters: string[];

  selectedDifficulty: string | null;

  selectedSide: string | null;

  selectedLineup: Lineup | null;

  selectedRole: string | null;

  setSelectedAgent: (agent: Agent | null) => void;

  setSelectedMap: (map: MapData | null) => void;

  setSelectedDifficulty: (difficulty: string | null) => void;

  setSelectedSide: (side: string | null) => void;

  setSelectedLineup: (lineup: Lineup | null) => void;

  setSelectedRole: (role: string | null) => void;

  toggleFilter: (filter: string) => void;

  clearSelectedLineup: () => void;

  resetFilters: () => void;

  syncFromLineup: (lineup: Lineup) => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  selectedAgent: null,

  selectedMap: null,

  filters: [],

  selectedDifficulty: null,

  selectedSide: null,

  selectedLineup: null,

  selectedRole: null,

  setSelectedAgent: (selectedAgent) =>
    set((state) => {
      const newAgent = state.selectedAgent?.id === selectedAgent?.id
        ? null
        : selectedAgent;
      
      // Clear selected lineup if it doesn't match the new agent
      let newLineup = state.selectedLineup;
      if (newLineup && newAgent && newLineup.agentId !== newAgent.id) {
        newLineup = null;
      }
      
      // Clear filters if agent changed and it has specific abilities
      let newFilters = state.filters;
      if (newAgent && newAgent.id !== state.selectedAgent?.id) {
        // Agent changed, so clear filters to avoid mismatch
        newFilters = [];
      }
      
      return { 
        selectedAgent: newAgent, 
        selectedLineup: newLineup,
        filters: newFilters,
      };
    }),

  setSelectedMap: (selectedMap) =>
    set((state) => {
      const newMap = state.selectedMap?.id === selectedMap?.id
        ? null
        : selectedMap;
      
      // Clear selected lineup if it doesn't match the new map
      let newLineup = state.selectedLineup;
      if (newLineup && newMap && newLineup.mapId !== newMap.id) {
        newLineup = null;
      }
      
      return { selectedMap: newMap, selectedLineup: newLineup };
    }),

  setSelectedDifficulty: (selectedDifficulty) =>
    set((state) => ({
      selectedDifficulty:
        state.selectedDifficulty === selectedDifficulty
          ? null
          : selectedDifficulty,
    })),

  setSelectedSide: (selectedSide) =>
    set((state) => ({
      selectedSide:
        state.selectedSide === selectedSide
          ? null
          : selectedSide,
    })),

  setSelectedLineup: (selectedLineup) =>
    set({ selectedLineup }),

  setSelectedRole: (selectedRole) =>
    set((state) => ({
      selectedRole:
        state.selectedRole === selectedRole
          ? null
          : selectedRole,
    })),

  toggleFilter: (filter) =>
    set((state) => ({
      filters: state.filters.includes(filter)
        ? state.filters.filter((item) => item !== filter)
        : [...state.filters, filter],
    })),

  clearSelectedLineup: () =>
    set({ selectedLineup: null }),

  resetFilters: () =>
    set({
      filters: [],
      selectedDifficulty: null,
      selectedSide: null,
      selectedAgent: null,
      selectedMap: null,
      selectedLineup: null,
      selectedRole: null,
    }),

  syncFromLineup: (lineup) =>
    set({
      selectedLineup: lineup,
      selectedAgent: lineup.agent ?? null,
      selectedMap: lineup.map ?? null,
      selectedDifficulty: lineup.difficulty ?? null,
      selectedSide: lineup.side ?? null,
      filters: lineup.abilityName
        ? [lineup.abilityName]
        : [],
    }),
}));