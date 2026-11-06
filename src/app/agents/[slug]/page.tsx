import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { LineupCard } from '@/components/lineup/LineupCard';
import { getAgentBySlug, getAgents, getLineupsByAgent } from '@/services/queries';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

interface AgentPageProps {
  params: { slug: string };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const agents = await getAgents();
  return agents.map((agent) => ({ slug: slugify(agent.displayName) }));
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = await getAgentBySlug(params.slug);

  if (!agent) {
    return { title: 'Agente não encontrado' };
  }

  return {
    title: `${agent.displayName} — habilidades e lineups`,
    description:
      agent.description?.slice(0, 150) ??
      `Habilidades e lineups do agente ${agent.displayName} no Valorant.`,
    openGraph: {
      title: `${agent.displayName} | Skillrush`,
      images: agent.displayIcon ? [{ url: agent.displayIcon }] : undefined,
    },
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const agent = await getAgentBySlug(params.slug);

  if (!agent) {
    notFound();
  }

  const lineups = await getLineupsByAgent(agent.id);

  const byMap = new Map<string, { name: string; slug: string; lineups: typeof lineups }>();

  for (const lineup of lineups) {
    const mapName = lineup.map?.displayName ?? lineup.mapId;
    const slug = slugify(mapName);
    const entry = byMap.get(slug) ?? { name: mapName, slug, lineups: [] };
    entry.lineups.push(lineup);
    byMap.set(slug, entry);
  }

  const maps = Array.from(byMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/agents" className="hover:text-accent-300">
            Agentes
          </Link>{' '}
          / <span className="text-slate-300">{agent.displayName}</span>
        </nav>

        <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {agent.displayIcon && (
            <Image
              src={resolveImage(agent.displayIcon)!}
              alt={agent.displayName}
              width={112}
              height={112}
              className="h-28 w-28 rounded-full border border-slate-800 object-cover"
            />
          )}

          <div>
            <h1 className="text-3xl font-bold text-white">{agent.displayName}</h1>
            <p className="mt-1 text-sm uppercase tracking-wide text-accent-300">
              {agent.role?.displayName ?? 'Sem função'}
            </p>
            {agent.description && (
              <p className="mt-3 max-w-2xl text-sm text-slate-400">{agent.description}</p>
            )}
          </div>
        </header>

        {agent.abilities && agent.abilities.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">Habilidades</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {agent.abilities.map((ability) => (
                <div
                  key={ability.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  {ability.displayIcon && (
                    <Image
                      src={resolveImage(ability.displayIcon)!}
                      alt={ability.displayName}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-contain"
                    />
                  )}

                  <div>
                    <p className="font-medium text-white">{ability.displayName}</p>
                    <p className="text-xs text-slate-500">{ability.slot}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Lineups por mapa</h2>

          {lineups.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
              Ainda não há lineups publicadas para {agent.displayName}.
            </p>
          ) : (
            <div className="space-y-8">
              {maps.map((map) => (
                <div key={map.slug}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{map.name}</h3>
                    <Link
                      href={`/maps/${map.slug}/${slugify(agent.displayName)}`}
                      className="text-sm text-accent-300 hover:text-accent-200"
                    >
                      Página do mapa →
                    </Link>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {map.lineups.map((lineup) => (
                      <LineupCard key={lineup.id} lineup={lineup} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
