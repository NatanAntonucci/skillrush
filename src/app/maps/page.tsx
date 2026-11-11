import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { getMapLineupCounts, getCompetitiveMaps } from '@/services/queries';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

export const metadata: Metadata = {
  title: 'Mapas · lineups de Valorant',
  description:
    'Todos os mapas do modo competitivo de Valorant com lineups, hotspots e vídeos de execução.',
};

export default async function MapsPage() {
  const [maps, countByMap] = await Promise.all([getCompetitiveMaps(), getMapLineupCounts()]);

  return (
    <main className="min-h-screen text-slate-100">
      <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <SectionHeader
          title="Mapas"
          description="Todos os mapas do modo competitivo, com suas lineups e pontos de execução."
        />

        <div data-reveal className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {maps.map((map) => {
            const total = countByMap.get(map.id) ?? 0;
            const art = resolveImage(map.splash) ?? resolveImage(map.displayIcon);

            return (
              <Link
                key={map.id}
                href={`/maps/${slugify(map.displayName)}`}
                className="group animate-fade-up relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-accent-500/50"
              >
                {art ? (
                  <Image
                    src={art}
                    alt={`Arte do mapa ${map.displayName}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    {map.displayName}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {map.tacticalDescription && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-950/75 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200 ring-1 ring-white/10">
                    {map.tacticalDescription}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                  <h3 className="truncate font-semibold art-label drop-shadow">
                    {map.displayName}
                  </h3>
                  <span className="shrink-0 rounded-full bg-slate-950/70 px-2 py-0.5 text-[11px] text-slate-300">
                    {total === 0 ? 'em breve' : total}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
