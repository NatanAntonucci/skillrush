'use client';

import { useEffect, useState } from 'react';
import { fetchMaps } from '@/services/valorant-api/client';
import { useLineupStore } from '@/stores/lineupStore';
import type { MapData } from '@/types';

export function MapSelect() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedMap, setSelectedMap } = useLineupStore();

  useEffect(() => {
    async function loadMaps() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchMaps();
        const competitiveMaps = new Set([
          'Ascent',
          'Bind',
          'Breeze',
          'Fracture',
          'Haven',
          'Icebox',
          'Lotus',
          'Pearl',
          'Split',
          'Sunset',
        ]);

        setMaps(
          response.data
            .filter((item) => competitiveMaps.has(item.displayName))
            .sort((a, b) => a.displayName.localeCompare(b.displayName)),
        );
      } catch (err) {
        setError('Não foi possível carregar mapas.');
      } finally {
        setLoading(false);
      }
    }

    loadMaps();
  }, []);

  return (
    <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
      <label className="block text-sm font-semibold text-slate-200">Mapa</label>
      {loading ? (
        <p className="text-sm text-slate-400">Carregando mapas...</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <div className="grid gap-2">
          {maps.slice(0, 6).map((map) => (
            <button
              key={map.uuid}
              type="button"
              onClick={() => setSelectedMap(map)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                selectedMap?.uuid === map.uuid
                  ? 'border-violet-400 bg-violet-500/10 text-violet-100'
                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                {map.listViewIcon ? (
                  <img src={map.listViewIcon} alt={map.displayName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300">{map.displayName.slice(0, 2)}</span>
                )}
                <div>
                  <p className="font-medium">{map.displayName}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
