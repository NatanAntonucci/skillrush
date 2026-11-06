import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LineupCard } from '@/components/lineup/LineupCard';
import {
  getAllLineups,
  getAgentBySlug,
  getLineupsByMapAndAgent,
  getMapBySlug,
} from '@/services/queries';
import { slugify } from '@/utils/slug';

interface AgentMapPageProps {
  params: { slug: string; agent: string };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const lineups = await getAllLineups();

  const seen = new Set<string>();
  const params: { slug: string; agent: string }[] = [];

  for (const lineup of lineups) {
    if (!lineup.map?.displayName || !lineup.agent?.displayName) continue;

    const slug = slugify(lineup.map.displayName);
    const agent = slugify(lineup.agent.displayName);
    const key = `${slug}/${agent}`;

    if (seen.has(key)) continue;
    seen.add(key);
    params.push({ slug, agent });
  }

  return params;
}

export async function generateMetadata({ params }: AgentMapPageProps): Promise<Metadata> {
  const [map, agent] = await Promise.all([getMapBySlug(params.slug), getAgentBySlug(params.agent)]);

  if (!map || !agent) {
    return { title: 'Página não encontrada' };
  }

  return {
    title: `Lineups de ${agent.displayName} em ${map.displayName}`,
    description: `Lineups de ${agent.displayName} no mapa ${map.displayName}, com vídeo e posicionamento.`,
  };
}

export default async function AgentMapPage({ params }: AgentMapPageProps) {
  const [map, agent] = await Promise.all([getMapBySlug(params.slug), getAgentBySlug(params.agent)]);

  if (!map || !agent) {
    notFound();
  }

  const lineups = await getLineupsByMapAndAgent(map.id, agent.id);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/maps" className="hover:text-cyan-300">
            Mapas
          </Link>{' '}
          /{' '}
          <Link href={`/maps/${slugify(map.displayName)}`} className="hover:text-cyan-300">
            {map.displayName}
          </Link>{' '}
          / <span className="text-slate-300">{agent.displayName}</span>
        </nav>

        <h1 className="text-3xl font-bold text-white">
          {agent.displayName} em {map.displayName}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {lineups.length === 0
            ? 'Nenhuma lineup publicada para este agente neste mapa.'
            : `${lineups.length} lineup(s) de ${agent.displayName} em ${map.displayName}.`}
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {lineups.map((lineup) => (
            <LineupCard key={lineup.id} lineup={lineup} />
          ))}
        </div>
      </section>
    </main>
  );
}
