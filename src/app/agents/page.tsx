import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { getAgents } from '@/services/queries';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

export const metadata: Metadata = {
  title: 'Agentes — lineups de Valorant',
  description: 'Lista de agentes de Valorant com habilidades e lineups relacionadas.',
};

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <SectionHeader
          title="Agentes"
          description="Cada agente com suas habilidades e o link para as lineups por mapa."
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${slugify(agent.displayName)}`}
              className="group rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40 transition hover:border-cyan-500/50"
            >
              <div className="mb-4 flex items-center gap-4">
                {agent.displayIcon && (
                  <Image
                    src={resolveImage(agent.displayIcon)!}
                    alt={agent.displayName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}

                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                    {agent.displayName}
                  </h2>
                  <p className="text-sm text-slate-400">{agent.role?.displayName ?? 'Sem função'}</p>
                </div>
              </div>

              {agent.description && (
                <p className="line-clamp-3 text-sm text-slate-300">{agent.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
