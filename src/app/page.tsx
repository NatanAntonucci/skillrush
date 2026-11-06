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
  const latest = lineups.slice(0, 6);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-12 text-center lg:pt-16">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Ache a lineup antes da partida
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Escolha o mapa, o agente e veja onde jogar — com vídeo e execução em segundos.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <SearchBox />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Continuar de onde parei</h2>
          <Link href="/painel" className="text-sm text-cyan-300 hover:text-cyan-200">
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
          {maps.map((map) => (
            <Link
              key={map.id}
              href={`/maps/${slugify(map.displayName)}`}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 transition hover:border-cyan-500/60"
            >
              <div className="relative h-28 w-full bg-slate-900">
                {map.displayIcon && (
                  <Image
                    src={resolveImage(map.displayIcon)!}
                    alt={map.displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80 transition group-hover:opacity-100"
                  />
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-white group-hover:text-cyan-300">
                  {map.displayName}
                </span>
                <span className="text-xs text-slate-400">lineups →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Últimas lineups</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {latest.map((lineup) => (
              <LineupCard key={lineup.id} lineup={lineup} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
