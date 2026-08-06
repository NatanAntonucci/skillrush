'use client';

import { useRef, useEffect } from 'react';
import { useLineupStore } from '@/stores/lineupStore';
// Importações nomeadas conforme seus arquivos
import { AgentSelect } from '@/features/agents/AgentSelect';
import { MapSelect } from '@/features/maps/MapSelect';
import { LineupFilterPanel } from '@/components/lineup/LineupFilterPanel';
import { LineupList } from '@/features/lineups/LineupList';
// Importações padrão para detalhes e mapa
import LineupDetails from '@/components/lineup/LineupDetails';
import InteractiveMap from '@/components/map/InteractiveMap';

export default function LineupsPage() {
  const { selectedLineup } = useLineupStore();
  const lineupDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLineup && lineupDetailsRef.current) {
      lineupDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedLineup]);

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-slate-950 text-white p-6">
      {/* Row 1: Mapas (40%) | Agentes (60%) */}
      <div className="grid grid-cols-[40%_60%] gap-6">
        {/* Mapas Section */}
        <div className="flex flex-col">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Seleção de Mapas</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Mapas</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <MapSelect />
          </div>
        </div>

        {/* Agentes Section */}
        <div className="flex flex-col">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Seleção de Agentes</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Agentes</h2>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <AgentSelect />
          </div>
        </div>
      </div>

      {/* Row 2: Filtros (full width) */}
      <div>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Filtros</p>
        </div>
        <LineupFilterPanel />
      </div>

      {/* Row 3: Mapa Interativo (esquerda) | Lineups (direita) */}
      <div className="grid grid-cols-[1fr_380px] gap-6 flex-1">
        {/* Mapa Interativo */}
        <div className="flex flex-col">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Painel Tático</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Mapa Interativo</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <InteractiveMap />
          </div>
        </div>

        {/* Lineups List */}
        <div className="flex flex-col max-h-[600px]">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Lineups</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Disponíveis</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <LineupList />
          </div>
        </div>
      </div>

      {/* Row 4: Detalhes da Lineup (full width) */}
      <div 
        ref={lineupDetailsRef}
        className="flex flex-col border-t border-slate-800 pt-6"
      >
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Detalhes</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Lineup Selecionada</h3>
        </div>
        <LineupDetails />
      </div>
    </div>
  );
}
