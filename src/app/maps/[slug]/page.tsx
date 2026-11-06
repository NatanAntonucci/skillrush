import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LineupCard } from '@/components/lineup/LineupCard';
import { MapBoard } from '@/components/map/MapBoard';
import { getCompetitiveMaps, getLineupsByMap, getMapBySlug } from '@/services/queries';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

interface MapPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const maps = await getCompetitiveMaps();
  return maps.map((map) => ({ slug: slugify(map.displayName) }));
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const map = await getMapBySlug(params.slug);

  if (!map) {
    return { title: 'Mapa não encontrado' };
  }

  return {
    title: `Lineups de ${map.displayName} — Valorant`,
    description: `Lineups, pontos de execução e vídeos para o mapa ${map.displayName} no Valorant.`,
    openGraph: {
      title: `Lineups de ${map.displayName} | Skillrush`,
      description: `Lineups e hotspots do mapa ${map.displayName}.`,
      images: map.splash ? [{ url: map.splash }] : undefined,
    },
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const map = await getMapBySlug(params.slug);

  if (!map) {
    notFound();
  }

  const lineups = await getLineupsByMap(map.id);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <nav className="mb-4 text-sm text-slate-400">
          <Link href="/" className="hover:text-accent-300">
            Início
          </Link>{' '}
          /{' '}
          <Link href="/maps" className="hover:text-accent-300">
            Mapas
          </Link>{' '}
          / <span className="text-slate-200">{map.displayName}</span>
        </nav>

        <header className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          {map.splash && (
            <Image
              src={resolveImage(map.splash)!}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-35"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />

          <div className="relative flex flex-wrap items-end justify-between gap-4 p-6">
            <div>
              {map.tacticalDescription && (
                <span className="mb-2 inline-block rounded-full bg-accent-500/15 px-2.5 py-1 text-[11px] uppercase tracking-wide text-accent-200">
                  {map.tacticalDescription}
                </span>
              )}

              <h1 className="text-3xl font-bold text-white">Lineups de {map.displayName}</h1>
              <p className="mt-1 text-sm text-slate-300">
                Escolha o agente no topo, clique no hotspot e veja a execução sem sair da página.
              </p>
            </div>

            <Link
              href="/painel"
              className="rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:border-slate-500"
            >
              Painel completo
            </Link>
          </div>
        </header>

        {lineups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
            <p>Ainda não há lineups publicadas para {map.displayName}.</p>
            <Link href="/maps" className="mt-4 inline-block text-accent-300 hover:text-accent-200">
              Ver outros mapas →
            </Link>
          </div>
        ) : (
          <>
            <MapBoard map={map} lineups={lineups} />

            {/* lista completa — também serve de conteúdo para indexação */}
            <section className="mt-12 border-t border-slate-800 pt-8">
              <h2 className="text-lg font-semibold text-white">
                Todas as lineups de {map.displayName}
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {lineups.map((lineup) => (
                  <LineupCard key={lineup.id} lineup={lineup} />
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
