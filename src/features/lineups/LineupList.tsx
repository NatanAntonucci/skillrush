'use client';

import Image from 'next/image';

import { useLineupData } from '@/features/lineups/LineupProvider';import { useLineupStore } from '@/stores/lineupStore';
import { classNames } from '@/utils/classNames';
import { labelDifficulty, labelSide } from '@/utils/labels';

export function LineupList() {
  const { visibleLineups, loading, error } = useLineupData();
  const { selectedLineup, selectedAgent, selectedMap, syncFromLineup } = useLineupStore();

  if (loading) {
    return <div className="p-4 text-center text-sm opacity-50">Carregando táticas...</div>;
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
            'w-full rounded-xl border p-3 text-left transition-all duration-200 group',
            selectedLineup?.id === lineup.id
              ? 'border-cyan-500/60 bg-cyan-500/10'
              : 'border-transparent bg-white/5 hover:bg-white/10',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-black/40 p-1">
              {lineup.ability?.displayIcon && (
                <Image
                  src={lineup.ability.displayIcon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xs font-bold transition-colors group-hover:text-cyan-300">
                {lineup.title}
              </h3>
              <div className="mt-1 flex gap-2 text-[10px] uppercase tracking-tight text-slate-400">
                <span>{labelDifficulty(lineup.difficulty)}</span>
                {lineup.side && (
                  <>
                    <span>•</span>
                    <span>{labelSide(lineup.side)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
