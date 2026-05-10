import { create } from 'zustand';
import type { Agent, MapData } from '@/types';

interface LineupState {
  selectedAgent: Agent | null;
  selectedMap: MapData | null;
  filters: string[];
  selectedDifficulty: string | null;
  selectedSide: 'Ataque' | 'Defesa' | null;
  setSelectedAgent: (agent: Agent) => void;
  setSelectedMap: (map: MapData) => void;
  setSelectedDifficulty: (difficulty: string | null) => void;
  setSelectedSide: (side: 'Ataque' | 'Defesa' | null) => void;
  toggleFilter: (filter: string) => void;
  resetFilters: () => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  selectedAgent: null,
  selectedMap: null,
  filters: [],
  selectedDifficulty: null,
  selectedSide: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setSelectedMap: (selectedMap) => set({ selectedMap }),
  setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
  setSelectedSide: (selectedSide) => set({ selectedSide }),
  toggleFilter: (filter) =>
    set((state) => ({
      filters: state.filters.includes(filter)
        ? state.filters.filter((item) => item !== filter)
        : [...state.filters, filter],
    })),
  resetFilters: () => set({ filters: [], selectedDifficulty: null, selectedSide: null }),
}));
