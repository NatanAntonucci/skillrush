'use client';

import { useEffect, useState } from 'react';
import { fetchMaps } from '@/services/supabase/maps';
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
        const data = await fetchMaps();
        setMaps(data.filter((map) => map.isCompetitive !== false).sort((a, b) => a.displayName.localeCompare(b.displayName)));
      } catch (err) {
        setError('Não foi possível carregar mapas.');
      } finally {
        setLoading(false);
      }
    }

    loadMaps();
  }, []);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
      <label className="block text-sm font-semibold text-slate-200">Mapa</label>
      {loading ? (
        <p className="text-sm text-slate-400">Carregando mapas...</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {maps.map((map) => (
              <button
                key={map.id}
                type="button"
                onClick={() => setSelectedMap(map)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition ${
                  selectedMap?.id === map.id
                    ? 'border-violet-400 bg-violet-500/10'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-900/90'
                }`}
                title={map.displayName}
              >
                {map.listViewIcon ? (
                  <img 
                    src={map.listViewIcon} 
                    alt={map.displayName} 
                    className="h-12 w-12 rounded-full object-cover border border-slate-700"
                    loading="lazy" 
                  />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                    {map.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className={`text-xs font-medium text-center max-w-[60px] leading-tight ${
                  selectedMap?.id === map.id ? 'text-violet-100' : 'text-slate-200'
                }`}>
                  {map.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
