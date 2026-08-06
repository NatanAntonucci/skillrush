'use client';

import { useMemo } from 'react';

import { useLineupStore } from '@/stores/lineupStore';

import { useLineups } from '@/hooks/useLineups';

import { MapHotspot } from './MapHotspot';

export default function InteractiveMap() {
  const {
    selectedMap,
    selectedAgent,

    selectedLineup,

    setSelectedLineup,

    syncFromLineup,
  } = useLineupStore();

  const { lineups, loading, error } = useLineups({
    agentId: selectedAgent?.id ?? selectedLineup?.agentId,
    mapId: selectedMap?.id ?? selectedLineup?.mapId,
  });

  const activeMap =
    selectedMap ??
    selectedLineup?.map ??
    null;

  const hotspots = useMemo(() => {
    if (!activeMap) return [];

    return lineups.filter(
      (lineup) =>
        lineup.mapId === activeMap.id,
    );
  }, [lineups, activeMap]);

  const mapImage =
    activeMap?.displayIcon ||
    activeMap?.splash ||
    '';

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
            Mapa Interativo
          </p>

          <h2 className="text-xl font-semibold text-white">
            {activeMap?.displayName ??
              'Selecione uma lineup'}
          </h2>
        </div>

        {selectedLineup && (
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            {selectedLineup.title}
          </span>
        )}
      </div>
      {/* EMPTY */}
      {!activeMap && (
        <div className="flex h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-700">
          <p className="text-slate-400">
            Selecione um mapa ou lineup.
          </p>
        </div>
      )}

      {/* MAP */}
      {activeMap && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 aspect-video">

          {/* IMAGE */}
          <img
            src={mapImage}
            alt={activeMap.displayName}
            className="w-full h-full object-contain"
          />

          {/* HOTSPOTS */}
          {!loading &&
            !error &&
            hotspots.map((lineup) => {
              const active =
                selectedLineup?.id === lineup.id;

              return (
                <MapHotspot
                  key={lineup.id}
                  x={lineup.hotspot.x}
                  y={lineup.hotspot.y}
                  abilityIcon={lineup.ability?.displayIcon}
                  isSelected={selectedLineup?.id === lineup.id}
                  onClick={() => syncFromLineup(lineup)}
                />
              );
            })}

          {/* LOADING */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-slate-300">
                Carregando hotspots...
              </p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-rose-400">
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="text-sm text-slate-400">
        {hotspots.length > 0
          ? `${hotspots.length} lineup(s) encontrada(s)`
          : 'Nenhuma lineup encontrada'}
      </div>
    </div>
  );
}