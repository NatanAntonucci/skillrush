'use client';

import { useEffect, useState } from 'react';
import { fetchAgents } from '@/services/valorant-api/client';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Agent } from '@/types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAgents();
        setAgents(response.data);
      } catch (err) {
        setError('Não foi possível carregar agentes.');
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <SectionHeader
          title="Página de agentes"
          description="Veja a lista completa de agentes com suas descrições e utilitários."
        />

        {loading ? (
          <div className="mt-8 text-center">
            <p className="text-slate-400">Carregando agentes...</p>
          </div>
        ) : error ? (
          <div className="mt-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent.uuid} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
                <div className="flex items-center gap-4 mb-4">
                  {agent.displayIcon && (
                    <img src={agent.displayIcon} alt={agent.displayName} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agent.displayName}</h3>
                    <p className="text-sm text-slate-400">{agent.role?.displayName ?? 'Sem função'}</p>
                  </div>
                </div>
                {agent.description && (
                  <p className="text-sm text-slate-300 mb-4">{agent.description}</p>
                )}
                {agent.abilities && agent.abilities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-2">Utilitários:</p>
                    <div className="space-y-2">
                      {agent.abilities.map((ability) => (
                        <div key={ability.slot} className="flex items-center gap-2">
                          {ability.displayIcon && (
                            <img src={ability.displayIcon} alt={ability.displayName} className="h-6 w-6 rounded" loading="lazy" />
                          )}
                          <span className="text-sm text-slate-300">{ability.displayName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
