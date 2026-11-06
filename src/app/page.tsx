import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { LineupCard } from '@/components/lineup/LineupCard';
import { SearchBox } from '@/components/search/SearchBox';
import { RecentShortcuts } from '@/features/home/RecentShortcuts';
import { getAllLineups, getCompetitiveMaps } from '@/services/queries';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

export const metadata: Metadata = {
  title: 'Skillrush — lineups de Valorant para consultar em segundos',
  description:
    'Ache a lineup do seu agente no mapa em segundos: hotspots no mapa, vídeo e execução passo a passo.',
};

export default async function HomePage() {
  const [maps, lineups] = await Promise.all([getCompetitiveMaps(), getAllLineups()]);

  const countByMap = new Map<string, number>();
  for (const lineup of lineups) {
    countByMap.set(lineup.mapId, (countByMap.get(lineup.mapId) ?? 0) + 1);
  }

  const latest = lineups.slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-14 text-center">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Lineups de Valorant, sem enrolação
        </span>

        <h1 className="animate-fade-up mt-5 text-3xl font-bold text-white sm:text-4xl">
          Ache a lineup antes da partida
        </h1>

        <p
          className="animate-fade-up mx-auto mt-3 max-w-xl text-slate-400"
          style={{ animationDelay: '60ms' }}
        >
          Escolha o mapa, o agente e veja onde jogar — com vídeo e execução em segundos.
        </p>

        <div className="mx-auto mt-8 max-w-xl animate-fade-up" style={{ animationDelay: '120ms' }}>
          <SearchBox />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Continuar de onde parei
          </h2>
          <Link
            href="/painel"
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
          >
            Abrir painel completo →
          </Link>
        </div>

        <div className="mt-3">
          <RecentShortcuts />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Mapas</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map, index) => {
            const total = countByMap.get(map.id) ?? 0;
            const art = resolveImage(map.splash) ?? resolveImage(map.displayIcon) ?? '';

            return (
              <Link
                key={map.id}
                href={`/maps/${slugify(map.displayName)}`}
                className="group relative animate-fade-up overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-950/30"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <div className="relative h-36 w-full overflow-hidden">
                  {art && (
                    <Image
                      src={art}
                      alt={`Arte do mapa ${map.displayName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {total === 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-500/30">
                      Em breve
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold text-white group-hover:text-cyan-300">
                    {map.displayName}
                  </span>

                  <span className="text-xs text-slate-400">
                    {total === 0 ? 'sem lineups' : `${total} lineup${total > 1 ? 's' : ''}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Últimas lineups</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {latest.map((lineup, index) => (
              <div
                key={lineup.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
              >
                <LineupCard lineup={lineup} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
