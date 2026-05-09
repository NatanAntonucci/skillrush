'use client';

import { useLineupStore } from '@/stores/lineupStore';

const filters = ['Smoke', 'Flash', 'Molotov', 'Recon', 'Crowd Control'];

export function LineupFilterPanel() {
  const { filters: activeFilters, toggleFilter, resetFilters } = useLineupStore();

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Filtros</p>
          <p className="text-sm text-slate-400">Refine lineups por utilitário e execução.</p>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-800"
        >
          Limpar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filters.map((filter) => {
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
  );
}
