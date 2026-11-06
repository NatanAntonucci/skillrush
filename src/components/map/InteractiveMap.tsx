'use client';

import { useState, type SyntheticEvent } from 'react';
import Image from 'next/image';

import { MapHotspot } from './MapHotspot';
import { useLineupData } from '@/features/lineups/LineupProvider';
import { useLineupStore } from '@/stores/lineupStore';
import { resolveImage } from '@/utils/images';

interface ImageBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const FULL_BOX: ImageBox = { left: 0, top: 0, width: 100, height: 100 };

export default function InteractiveMap() {
  const { selectedMap, selectedLineup, syncFromLineup } = useLineupStore();
  const { visibleLineups, loading, error } = useLineupData();

  const [imageBox, setImageBox] = useState<ImageBox>(FULL_BOX);

  const activeMap = selectedMap ?? selectedLineup?.map ?? null;
  const mapImage = resolveImage(activeMap?.displayIcon || activeMap?.splash || '') ?? '';

  const hotspots = activeMap
    ? visibleLineups.filter((lineup) => lineup.mapId === activeMap.id)
    : [];

  /**
   * A imagem é desenhada com `object-contain`: sobra uma tarja quando a
   * proporção do PNG difere do container 16:9. Os hotspots são percentuais
   * da área desenhada, então precisamos medir essa área depois do load.
   */
  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const rect = image.getBoundingClientRect();

    if (!rect.width || !rect.height || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const width = ((image.naturalWidth * scale) / rect.width) * 100;
    const height = ((image.naturalHeight * scale) / rect.height) * 100;

    setImageBox({
      left: (100 - width) / 2,
      top: (100 - height) / 2,
      width,
      height,
    });
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Mapa Interativo</p>
          <h2 className="text-xl font-semibold text-white">
            {activeMap?.displayName ?? 'Selecione uma lineup'}
          </h2>
        </div>

        {selectedLineup && (
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            {selectedLineup.title}
          </span>
        )}
      </div>

      {!activeMap && (
        <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-700 sm:h-[420px]">
          <p className="text-slate-400">Selecione um mapa ou lineup.</p>
        </div>
      )}

      {activeMap && (
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <Image
            key={mapImage}
            src={mapImage}
            alt={activeMap.displayName}
            fill
            sizes="(max-width: 1280px) 100vw, 60vw"
            onLoad={handleImageLoad}
            className="object-contain"
          />

          <div
            className="absolute"
            style={{
              left: `${imageBox.left}%`,
              top: `${imageBox.top}%`,
              width: `${imageBox.width}%`,
              height: `${imageBox.height}%`,
            }}
          >
            {!loading &&
              !error &&
              hotspots.map((lineup) => (
                <MapHotspot
                  key={lineup.id}
                  x={lineup.hotspot.x}
                  y={lineup.hotspot.y}
                  abilityIcon={lineup.ability?.displayIcon}
                  isSelected={selectedLineup?.id === lineup.id}
                  onClick={() => syncFromLineup(lineup)}
                />
              ))}
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <p className="text-slate-300">Carregando hotspots...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 px-6 text-center">
              <p className="text-rose-400">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-slate-400">
        {hotspots.length > 0
          ? `${hotspots.length} lineup(s) encontrada(s)`
          : 'Nenhuma lineup encontrada'}
      </div>
    </div>
  );
}
