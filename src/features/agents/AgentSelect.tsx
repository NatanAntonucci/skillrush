'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAgents } from '@/services/supabase/agents';
import { useLineupStore } from '@/stores/lineupStore';
import type { Agent } from '@/types';

export function AgentSelect() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { selectedAgent, setSelectedAgent } = useLineupStore();

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAgents();
        setAgents(data);
      } catch (err) {
        setError('Não foi possível carregar agentes.');
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(agents.map(a => a.role?.displayName).filter((r): r is string => Boolean(r)));
    return Array.from(roles).sort();
  }, [agents]);

  const filteredAgents = useMemo(() => {
    if (!selectedRole) return agents;
    return agents.filter(a => a.role?.displayName === selectedRole);
  }, [agents, selectedRole]);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-3">Agente</label>
        
        {/* Role Filter */}
        {uniqueRoles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className={`rounded-2xl border px-3 py-1 text-xs motion-safe:transition-transform motion-safe:duration-200 ${
                selectedRole === null
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100 scale-105'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              Todos
            </button>
            {uniqueRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`rounded-2xl border px-3 py-1 text-xs motion-safe:transition-transform motion-safe:duration-200 ${
                  selectedRole === role
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-100 scale-105'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:scale-105'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Carregando agentes...</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition flex-shrink-0 ${
                  selectedAgent?.id === agent.id
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-900/90'
                }`}
                title={agent.displayName}
              >
                {agent.displayIcon ? (
                  <img 
                    src={agent.displayIcon} 
                    alt={agent.displayName} 
                    className="h-12 w-12 rounded-full object-cover border border-slate-700"
                    loading="lazy" 
                  />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                    {agent.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className={`text-xs font-medium text-center max-w-[60px] leading-tight ${
                  selectedAgent?.id === agent.id ? 'text-cyan-100' : 'text-slate-200'
                }`}>
                  {agent.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

