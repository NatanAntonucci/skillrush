'use client';

import { useMemo } from 'react';
import { useLineups } from '@/hooks/useLineups';
import { useLineupStore } from '@/stores/lineupStore';
import { classNames } from '@/utils/classNames';

export function LineupList() {
  const {
    selectedLineup,
    filters,
    selectedDifficulty,
    selectedSide,
    selectedAgent,
    selectedMap,
    syncFromLineup,
  } = useLineupStore();

  const { lineups, loading, error } = useLineups({
    agentId: selectedAgent?.id ?? selectedLineup?.agentId,
    mapId: selectedMap?.id ?? selectedLineup?.mapId,
  });

  const visibleLineups = useMemo(() => {
    const filtered = lineups.filter((lineup) => {
      if (selectedDifficulty && lineup.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedSide && lineup.side !== selectedSide) {
        return false;
      }
      if (filters.length > 0) {
        return filters.every((filter) => lineup.abilityName?.toLowerCase().includes(filter.toLowerCase()));
      }
      return true;
    });

    if (!selectedLineup) {
      return filtered;
    }

    const selectedVisible = filtered.some((lineup) => lineup.id === selectedLineup.id);
    return selectedVisible ? filtered : [selectedLineup, ...filtered];
  }, [lineups, selectedDifficulty, selectedSide, filters, selectedLineup]);

  if (loading) {
    return <div className="p-4 text-center opacity-50 text-sm">Carregando táticas...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-800/30 bg-rose-950/20 p-4 text-sm text-rose-300">
        {error}
      </div>
    );
  }

  if (visibleLineups.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/80 p-6 text-slate-400">
        <p className="text-sm">
          {selectedAgent || selectedMap
            ? 'Nenhuma lineup encontrada com os filtros atuais.'
            : 'Selecione agente e mapa para ver lineups.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {visibleLineups.map((lineup) => (
        <button
          key={lineup.id}
          onClick={() => syncFromLineup(lineup)}
          className={classNames(
            "w-full text-left p-3 rounded-xl border transition-all duration-200 group",
            selectedLineup?.id === lineup.id
              ? "bg-primary/10 border-primary shadow-sm"
              : "bg-white/5 border-transparent hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/40 rounded flex items-center justify-center p-1">
               {lineup.ability?.displayIcon && (
                 <img src={lineup.ability.displayIcon} alt="" className="w-full h-full object-contain" />
               )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                {lineup.title}
              </h3>
              <div className="flex gap-2 mt-1 opacity-60">
                <span className="text-[9px] uppercase tracking-tighter">{lineup.difficulty}</span>
                <span className="text-[9px]">•</span>
                <span className="text-[9px] uppercase tracking-tighter">{lineup.side}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}