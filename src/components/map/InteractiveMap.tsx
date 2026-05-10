'use client';

import { useMemo, useState } from 'react';
import { MapHotspot } from './MapHotspot';
import { useLineupStore } from '@/stores/lineupStore';
import { useLineups } from '@/hooks/useLineups';
import { LineupDetailsModal } from '@/components/lineup/LineupDetailsModal';
import type { Lineup } from '@/types';

export default function InteractiveMap() {
  const { selectedMap, selectedAgent } = useLineupStore();
  const { lineups, loading, error } = useLineups({
    agentId: selectedAgent?.uuid,
    mapId: selectedMap?.uuid,
  });
  
  const [activeLineup, setActiveLineup] = useState<Lineup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mapImage = selectedMap?.splash ?? 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=1400&q=80';

  const hotspots = useMemo(() => {
    if (!selectedMap) return [];
    return lineups.filter((item) => item.mapId === selectedMap.uuid);
  }, [lineups, selectedMap]);

  const handleHotspotClick = (lineup: Lineup) => {
    setActiveLineup(lineup);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-inner shadow-slate-950/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Mapa interativo</p>
          <h2 className="text-xl font-semibold text-white">Posicione sua jogada</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase text-slate-300">
          {selectedMap?.displayName ?? 'Selecione um mapa'}
        </span>
      </div>

      {loading ? (
        <div className="aspect-video rounded-3xl border border-slate-800 bg-slate-900/50 flex items-center justify-center">
          <p className="text-slate-400">Carregando hotspots...</p>
        </div>
      ) : error ? (
        <div className="aspect-video rounded-3xl border border-slate-800 bg-slate-900/50 flex items-center justify-center">
          <p className="text-rose-400">{error}</p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-lg shadow-slate-950/30">
          <img
            src={mapImage}
            alt={selectedMap?.displayName ?? 'Mapa Valorant'}
            className="h-[420px] w-full object-cover opacity-95"
          />

          {hotspots.length > 0 ? (
            hotspots.map((hotspot) => (
              <MapHotspot
                key={hotspot.id}
                label={hotspot.hotspot.label}
                x={hotspot.hotspot.x}
                y={hotspot.hotspot.y}
                onClick={() => handleHotspotClick(hotspot)}
              />
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <p className="text-slate-300 text-center">
                {selectedMap ? 'Nenhuma lineup disponível para este mapa' : 'Selecione um mapa para ver hotspots'}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-slate-400">
        {hotspots.length > 0 ? `${hotspots.length} hotspot(s) disponível(is) · Clique para ver detalhes` : 'Clique em um hotspot para ver o vídeo da jogada e o contexto.'}
      </p>

      {isModalOpen && activeLineup && <LineupDetailsModal lineup={activeLineup} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
