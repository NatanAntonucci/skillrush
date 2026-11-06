'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { fetchMaps } from '@/services/supabase/maps';
import { useLineupStore } from '@/stores/lineupStore';
import { competitiveMaps } from '@/utils/maps';
import { slugify } from '@/utils/slug';

import type { MapData } from '@/types';

export function MapSelect() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedMap, setSelectedMap } = useLineupStore();
  const restoredFromUrl = useRef(false);

  useEffect(() => {
    if (restoredFromUrl.current || maps.length === 0 || selectedMap) return;

    const slug = new URLSearchParams(window.location.search).get('mapa');
    if (!slug) return;

    const match = maps.find((map) => slugify(map.displayName) === slug);
    if (match) {
      restoredFromUrl.current = true;
      setSelectedMap(match);
    }
  }, [maps, selectedMap, setSelectedMap]);

  useEffect(() => {
    async function loadMaps() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMaps();
        setMaps(competitiveMaps(data));
      } catch {
        setError('Não foi possível carregar mapas.');
      } finally {
        setLoading(false);
      }
    }

    loadMaps();
  }, []);

  return (
    <div className="space-y-2 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
      <label className="block text-sm font-semibold text-slate-200">Mapa</label>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando mapas...</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <div className="custom-scrollbar max-h-[420px] space-y-3 overflow-y-auto lg:max-h-[600px]">
          {maps.map((map) => (
            <button
              key={map.id}
              type="button"
              onClick={() => setSelectedMap(map)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 transition ${
                selectedMap?.id === map.id
                  ? 'border-violet-400 bg-violet-500/10'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-900/90'
              }`}
              title={map.displayName}
            >
              {map.listViewIcon ? (
                <Image
                  src={map.listViewIcon}
                  alt={map.displayName}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                  {map.displayName.slice(0, 2).toUpperCase()}
                </span>
              )}

              <div className="text-left">
                <p
                  className={`text-sm font-medium ${
                    selectedMap?.id === map.id ? 'text-violet-100' : 'text-slate-200'
                  }`}
                >
                  {map.displayName}
                </p>
                <p className="text-xs text-slate-500">Mapa competitivo</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
