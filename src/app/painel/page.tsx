'use client';

import { useEffect, useRef } from 'react';

import { LineupProvider } from '@/features/lineups/LineupProvider';
import { UrlSync } from '@/features/lineups/UrlSync';
import { AgentSelect } from '@/features/agents/AgentSelect';
import { MapSelect } from '@/features/maps/MapSelect';
import { LineupFilterPanel } from '@/components/lineup/LineupFilterPanel';
import { LineupList } from '@/features/lineups/LineupList';
import LineupDetails from '@/components/lineup/LineupDetails';
import InteractiveMap from '@/components/map/InteractiveMap';
import { useLineupStore } from '@/stores/lineupStore';

export default function PanelPage() {
  const { selectedLineup } = useLineupStore();
  const lineupDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLineup && lineupDetailsRef.current) {
      lineupDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedLineup]);

  return (
    <LineupProvider>
      <UrlSync />
      <div className="flex min-h-screen flex-col gap-6 bg-slate-950 p-4 text-white sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[40%_60%]">
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Seleção de Mapas</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Mapas</h2>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <MapSelect />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Seleção de Agentes</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Agentes</h2>
            </div>
            <div className="custom-scrollbar flex-1 overflow-auto">
              <AgentSelect />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Filtros</p>
          </div>
          <LineupFilterPanel />
        </div>

        <div className="grid flex-1 gap-6 xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Painel Tático</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Mapa Interativo</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <InteractiveMap />
            </div>
          </div>

          <div className="flex max-h-[600px] flex-col">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Lineups</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Disponíveis</h3>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <LineupList />
            </div>
          </div>
        </div>

        <div ref={lineupDetailsRef} className="flex flex-col border-t border-slate-800 pt-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Detalhes</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Lineup Selecionada</h3>
          </div>
          <LineupDetails />
        </div>
      </div>
    </LineupProvider>
  );
}
