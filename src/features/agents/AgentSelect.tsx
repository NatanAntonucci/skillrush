'use client';

import { useEffect, useState } from 'react';
import { fetchAgents } from '@/services/valorant-api/client';
import { useLineupStore } from '@/stores/lineupStore';
import type { Agent } from '@/types';

export function AgentSelect() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedAgent, setSelectedAgent } = useLineupStore();

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
    <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
      <label className="block text-sm font-semibold text-slate-200">Agente</label>
      {loading ? (
        <p className="text-sm text-slate-400">Carregando agentes...</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <div className="grid gap-2">
          {agents.map((agent) => (
            <button
              key={agent.uuid}
              type="button"
              onClick={() => setSelectedAgent(agent)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                selectedAgent?.uuid === agent.uuid
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100'
                  : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-600 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-3">
                {agent.displayIcon ? (
                  <img src={agent.displayIcon} alt={agent.displayName} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300">{agent.displayName.slice(0, 2)}</span>
                )}
                <div>
                  <p className="font-medium">{agent.displayName}</p>
                  <p className="text-xs text-slate-400">{agent.role?.displayName ?? 'Sem função'}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
