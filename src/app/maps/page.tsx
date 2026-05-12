'use client';

import { useEffect, useState } from 'react';
import { fetchMaps } from '@/services/supabase/maps';
import { SectionHeader } from '@/components/ui/SectionHeader';
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
        setMaps(data.filter((item) => item.displayName !== 'Menu'));
      } catch (err) {
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
          title="Página de mapas"
          description="Explore os mapas disponíveis com suas imagens e características."
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {maps.map((map) => (
              <div key={map.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
                {map.splash && (
                  <img src={map.splash} alt={map.displayName} className="w-full h-32 object-cover rounded-2xl mb-4" loading="lazy" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{map.displayName}</h3>
                <p className="text-sm text-slate-400">Mapa competitivo de Valorant.</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
