'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { fetchAgents } from '@/services/supabase/agents';
import { useLineupStore } from '@/stores/lineupStore';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';
import type { Agent } from '@/types';

export function AgentSelect() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { selectedAgent, setSelectedAgent } = useLineupStore();
  const restoredFromUrl = useRef(false);

  useEffect(() => {
    if (restoredFromUrl.current || agents.length === 0 || selectedAgent) return;

    const slug = new URLSearchParams(window.location.search).get('agente');
    if (!slug) return;

    const match = agents.find((agent) => slugify(agent.displayName) === slug);
    if (match) {
      restoredFromUrl.current = true;
      setSelectedAgent(match);
    }
  }, [agents, selectedAgent, setSelectedAgent]);

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
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-9">
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-2 w-8 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-9">
          {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className={`flex flex-col items-center gap-1 rounded-xl transition ${
                  selectedAgent?.id === agent.id
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950'
                    : 'hover:opacity-80'
                }`}
                title={agent.displayName}
              >
                {agent.displayIcon ? (
                  <Image
                    src={resolveImage(agent.displayIcon)!}
                    alt={agent.displayName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 text-xs font-semibold text-slate-200">
                    {agent.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className={`text-xs font-medium text-center leading-tight w-full px-1 truncate ${
                  selectedAgent?.id === agent.id ? 'text-cyan-300' : 'text-slate-400'
                }`}>
                  {agent.displayName}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

