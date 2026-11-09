import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { getMapLineupCounts, getCompetitiveMaps } from '@/services/queries';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

export const metadata: Metadata = {
  title: 'Mapas — lineups de Valorant',
  description:
    'Todos os mapas do modo competitivo de Valorant com lineups, hotspots e vídeos de execução.',
};

export default async function MapsPage() {
  const [maps, countByMap] = await Promise.all([getCompetitiveMaps(), getMapLineupCounts()]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <SectionHeader
          title="Mapas"
          description="Todos os mapas do modo competitivo, com suas lineups e pontos de execução."
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => {
            const total = countByMap.get(map.id) ?? 0;

            return (
              <Link
                key={map.id}
                href={`/maps/${slugify(map.displayName)}`}
                className="group animate-fade-up overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/40 transition duration-300 hover:-translate-y-1 hover:border-accent-500/50"
              >
                {(map.listViewIcon || map.splash) ? (
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image
                      src={resolveImage(map.listViewIcon ?? map.splash)!}
                      alt={`Arte do mapa ${map.displayName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />

                    {map.tacticalDescription && (
                      <span className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] text-slate-200 ring-1 ring-white/10">
                        {map.tacticalDescription}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-slate-900 text-slate-600">
                    {map.displayName}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white group-hover:text-accent-300">
                    {map.displayName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {total === 0 ? 'Ainda sem lineups publicadas' : `${total} lineup(s) publicadas`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
