import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCompetitiveMaps } from '@/services/queries';
import { slugify } from '@/utils/slug';

export const metadata: Metadata = {
  title: 'Mapas — lineups de Valorant',
  description:
    'Todos os mapas do modo competitivo de Valorant com lineups, hotspots e vídeos de execução.',
};

export default async function MapsPage() {
  const maps = await getCompetitiveMaps();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <SectionHeader
          title="Mapas"
          description="Todos os mapas do modo competitivo, com suas lineups e pontos de execução."
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Link
              key={map.id}
              href={`/maps/${slugify(map.displayName)}`}
              className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/40 transition hover:border-cyan-500/50"
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
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                  {map.displayName}
                </h3>
                <p className="text-sm text-slate-400">Ver lineups do mapa →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
