'use client';

import { useMemo } from 'react';
import { useLineupStore } from '@/stores/lineupStore';
import { useLineups } from '@/hooks/useLineups';

export function LineupList() {
  const { selectedAgent, selectedMap } = useLineupStore();
  const { lineups, loading, error } = useLineups({
    agentId: selectedAgent?.uuid,
    mapId: selectedMap?.uuid,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/90 p-4 h-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-800/30 bg-rose-950/20 p-6 text-rose-400">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (lineups.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/80 p-6 text-slate-400">
        <p className="text-sm">
          {selectedAgent && selectedMap
            ? 'Nenhuma lineup disponível para esta combinação de agente e mapa.'
            : 'Selecione agente e mapa para visualizar lineups relevantes.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lineups.map((lineup) => (
        <article
          key={lineup.id}
          className="group rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm shadow-slate-950/20 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-cyan-100 transition">{lineup.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{lineup.description}</p>
            </div>
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs uppercase text-cyan-300">{lineup.ability}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-2 py-1">#{lineup.hotspot.label}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
