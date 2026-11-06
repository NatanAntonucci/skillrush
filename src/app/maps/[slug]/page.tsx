import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LineupCard } from '@/components/lineup/LineupCard';
import { getCompetitiveMaps, getLineupsByMap, getMapBySlug } from '@/services/queries';
import { slugify } from '@/utils/slug';

import type { Lineup } from '@/types';

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

  const byAgent = new Map<string, { name: string; slug: string; lineups: Lineup[] }>();

  for (const lineup of lineups) {
    const agentName = lineup.agent?.displayName ?? lineup.agentId;
    const slug = slugify(agentName);
    const entry = byAgent.get(slug) ?? { name: agentName, slug, lineups: [] };
    entry.lineups.push(lineup);
    byAgent.set(slug, entry);
  }

  const agents = Array.from(byAgent.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/maps" className="hover:text-cyan-300">
            Mapas
          </Link>{' '}
          / <span className="text-slate-300">{map.displayName}</span>
        </nav>

        <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {map.displayIcon && (
            <Image
              src={map.displayIcon}
              alt={map.displayName}
              width={160}
              height={160}
              className="h-32 w-32 rounded-2xl border border-slate-800 object-cover"
            />
          )}

          <div>
            <h1 className="text-3xl font-bold text-white">Lineups de {map.displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {lineups.length === 0
                ? 'Ainda não há lineups publicadas para este mapa.'
                : `${lineups.length} lineups publicadas neste mapa.`}
            </p>
          </div>
        </header>

        {lineups.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
            Em breve. Enquanto isso, veja os outros mapas.
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {agents.map((agent) => (
              <div key={agent.slug}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
                  <Link
                    href={`/maps/${slugify(map.displayName)}/${agent.slug}`}
                    className="text-sm text-cyan-300 hover:text-cyan-200"
                  >
                    Ver só {agent.name} →
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {agent.lineups.map((lineup) => (
                    <LineupCard key={lineup.id} lineup={lineup} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
