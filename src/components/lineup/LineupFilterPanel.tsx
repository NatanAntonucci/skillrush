'use client';

import { useLineupStore } from '@/stores/lineupStore';

const utilityFilters = ['Smoke', 'Flash', 'Molotov', 'Recon', 'Crowd Control'];
const difficultyOptions = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Médio', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
] as const;
const sideOptions = [
  { label: 'Ataque', value: 'attack' },
  { label: 'Defesa', value: 'defense' },
] as const;

export function LineupFilterPanel() {
  const {
    filters: activeFilters,
    toggleFilter,
    clearFilters,
    selectedDifficulty,
    selectedSide,
    setSelectedDifficulty,
    setSelectedSide,
    selectedAgent,
  } = useLineupStore();

  const agentAbilities = selectedAgent?.abilities?.map(a => a.displayName) || [];
  const availableFilters = selectedAgent ? agentAbilities : utilityFilters;

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Filtros</p>
          <p className="text-sm text-slate-400">Refine lineups por utilitário, dificuldade e lado.</p>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-800"
        >
          Limpar filtros
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Dificuldade</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficultyOptions.map((difficulty) => (
              <button
                key={difficulty.value}
                type="button"
                onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty.value ? null : difficulty.value)}
                className={`rounded-2xl border px-4 py-2 text-sm transition ${
                  selectedDifficulty === difficulty.value
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-900/90'
                }`}
              >
                {difficulty.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Lado</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sideOptions.map((side) => (
              <button
                key={side.value}
                type="button"
                onClick={() => setSelectedSide(selectedSide === side.value ? null : side.value)}
                className={`rounded-2xl border px-4 py-2 text-sm transition ${
                  selectedSide === side.value
                    ? 'border-violet-400 bg-violet-500/15 text-violet-100'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-900/90'
                }`}
              >
                {side.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Habilidade</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {availableFilters.map((filter) => {
            const isActive = activeFilters.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                onClick={() => toggleFilter(filter)}
                className={`rounded-2xl border px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-900/90'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
