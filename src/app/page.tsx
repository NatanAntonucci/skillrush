import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { LineupCard } from '@/components/lineup/LineupCard';
import { SearchBox } from '@/components/search/SearchBox';
import { RecentShortcuts } from '@/features/home/RecentShortcuts';
import { getMapLineupCounts, getCompetitiveMaps } from '@/services/queries';
import { fetchLineups } from '@/services/supabase/lineups';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

export const metadata: Metadata = {
  title: 'Skillrush — lineups de Valorant para consultar em segundos',
  description:
    'Ache a lineup do seu agente no mapa em segundos: hotspots no mapa, vídeo e execução passo a passo.',
};

export default async function HomePage() {
  const [maps, countByMap, latest] = await Promise.all([
    getCompetitiveMaps(),
    getMapLineupCounts(),
    fetchLineups({ limit: 6 }),
  ]);

  return (
    <main className="min-h-screen text-slate-100">
      <section className="mx-auto w-full max-w-3xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
          Lineups de Valorant, sem enrolação
        </span>

        <h1 className="animate-fade-up mt-4 text-2xl font-bold leading-tight text-white sm:text-4xl">
          Ache a lineup antes da partida
        </h1>

        <p
          className="animate-fade-up mx-auto mt-3 max-w-lg text-sm text-slate-400 sm:text-base"
          style={{ animationDelay: '60ms' }}
        >
          Escolha o mapa, o agente e veja onde jogar — com vídeo e execução em segundos.
        </p>

        <div className="animate-fade-up mt-6 sm:mt-8" style={{ animationDelay: '120ms' }}>
          <SearchBox />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Continuar de onde parei
            </h2>
            <Link
              href="/painel"
              className="text-sm text-accent-300 transition hover:text-accent-200"
            >
              Abrir painel →
            </Link>
          </div>

          <div className="mt-3">
            <RecentShortcuts />
          </div>
        </section>

        <section className="pt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold text-white sm:text-base">Mapas</h2>
            <span className="text-xs text-slate-500">{maps.length} competitivos</span>
          </div>

          <div data-reveal className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {maps.map((map, index) => {
              const total = countByMap.get(map.id) ?? 0;
              const art =
                resolveImage(map.splash) ?? resolveImage(map.displayIcon) ?? resolveImage(map.listViewIcon) ?? '';

              return (
                <Link
                  key={map.id}
                  href={`/maps/${slugify(map.displayName)}`}
                  className="group animate-fade-up relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-accent-500/60 hover:shadow-xl hover:shadow-accent-950/30"
                  style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                >
                  {art && (
                    <Image
                      src={art}
                      alt={`Arte do mapa ${map.displayName}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                    <span className="truncate font-semibold text-white drop-shadow group-hover:text-accent-200">
                      {map.displayName}
                    </span>

                    <span className="shrink-0 rounded-full bg-slate-950/70 px-2 py-0.5 text-[11px] text-slate-300">
                      {total === 0 ? 'em breve' : total}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {latest.length > 0 && (
          <section className="pb-16 pt-10">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-sm font-semibold text-white sm:text-base">Últimas lineups</h2>
            </div>

            <div data-reveal className="mt-4 grid gap-3 sm:grid-cols-2">
              {latest.map((lineup, index) => (
                <div
                  key={lineup.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
                >
                  <LineupCard lineup={lineup} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
