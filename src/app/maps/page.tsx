'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { fetchMaps } from '@/services/supabase/maps';
import { competitiveMaps } from '@/utils/maps';

import type { MapData } from '@/types';

export default function MapsPage() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <SectionHeader
          title="Mapas"
          description="Todos os mapas do modo competitivo, com suas chamadas e lineups."
        />

        {loading ? (
          <div className="mt-8 text-center">
            <p className="text-slate-400">Carregando mapas...</p>
          </div>
        ) : error ? (
          <div className="mt-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {maps.map((map) => (
              <div
                key={map.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/40"
              >
                {map.splash ? (
                  <Image
                    src={map.splash}
                    alt={map.displayName}
                    width={400}
                    height={128}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-slate-900 text-slate-600">
                    {map.displayName}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white">{map.displayName}</h3>
                  <p className="text-sm text-slate-400">Mapa competitivo de Valorant.</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
