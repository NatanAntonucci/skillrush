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
      <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <SectionHeader
          title="Agentes"
          description="Cada agente com suas habilidades e o link para as lineups por mapa."
        />

        <div data-reveal className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${slugify(agent.displayName)}`}
              className="group animate-fade-up rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-accent-500/50"
            >
              <div className="mb-3 flex items-center gap-3">
                {agent.displayIcon && (
                  <Image
                    src={resolveImage(agent.displayIcon)!}
                    alt={agent.displayName}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                )}

                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white group-hover:text-accent-300">
                    {agent.displayName}
                  </h2>
                  <p className="truncate text-xs text-slate-400">
                    {agent.role?.displayName ?? 'Sem função'}
                  </p>
                </div>
              </div>

              {agent.description && (
                <p className="line-clamp-2 text-sm text-slate-400">{agent.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
