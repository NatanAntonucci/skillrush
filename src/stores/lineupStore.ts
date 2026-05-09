import { create } from 'zustand';
import type { Agent, MapData } from '@/types';

interface LineupState {
  selectedAgent: Agent | null;
  selectedMap: MapData | null;
  filters: string[];
  setSelectedAgent: (agent: Agent) => void;
  setSelectedMap: (map: MapData) => void;
  toggleFilter: (filter: string) => void;
  resetFilters: () => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  selectedAgent: null,
  selectedMap: null,
  filters: [],
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setSelectedMap: (selectedMap) => set({ selectedMap }),
  toggleFilter: (filter) =>
    set((state) => ({
      filters: state.filters.includes(filter)
        ? state.filters.filter((item) => item !== filter)
        : [...state.filters, filter],
    })),
  resetFilters: () => set({ filters: [] }),
}));
