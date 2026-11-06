'use client';

import { useEffect, useRef, useState } from 'react';

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

  function handleChange(id: string) {
    if (!id) {
      setSelectedMap(null);
      return;
    }

    const map = maps.find((item) => item.id === id) ?? null;
    if (map && map.id !== selectedMap?.id) {
      setSelectedMap(map);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <label
        htmlFor="map-select"
        className="text-xs uppercase tracking-[0.2em] text-slate-400"
      >
        Mapa
      </label>

      {loading ? (
        <div className="skeleton mt-2 h-10 w-full rounded-lg" />
      ) : error ? (
        <p className="mt-2 text-xs text-rose-400">{error}</p>
      ) : (
        <select
          id="map-select"
          value={selectedMap?.id ?? ''}
          onChange={(event) => handleChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
        >
          <option value="">Todos os mapas</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.displayName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
