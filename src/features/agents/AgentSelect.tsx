'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { fetchAgents } from '@/services/supabase/agents';
import { useLineupStore } from '@/stores/lineupStore';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';

import type { Agent } from '@/types';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function AgentSelect() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { selectedAgent, setSelectedAgent } = useLineupStore();
  const restoredFromUrl = useRef(false);

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAgents();
        setAgents(data);
      } catch {
        setError('Não foi possível carregar agentes.');
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

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

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return agents;
    return agents.filter((agent) => normalize(agent.displayName).includes(term));
  }, [agents, query]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Agente</label>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar…"
          className="w-32 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
        />

        {selectedAgent && (
          <button
            type="button"
            onClick={() => setSelectedAgent(selectedAgent)}
            className="ml-auto text-xs text-cyan-300 hover:text-cyan-200"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-3 flex gap-2 overflow-hidden">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="skeleton h-12 w-12 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-2 text-xs text-rose-400">{error}</p>
      ) : (
        <div className="custom-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {filtered.map((agent) => {
            const active = selectedAgent?.id === agent.id;

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                title={agent.displayName}
                aria-label={agent.displayName}
                aria-pressed={active}
                className={`group flex w-12 shrink-0 flex-col items-center gap-1 transition ${
                  active ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border transition ${
                    active
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                      : 'border-slate-800 group-hover:border-slate-600'
                  }`}
                >
                  {agent.displayIcon ? (
                    <Image
                      src={resolveImage(agent.displayIcon)!}
                      alt={agent.displayName}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-300">
                      {agent.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>

                <span
                  className={`w-full truncate text-center text-[10px] leading-tight ${
                    active ? 'text-cyan-200' : 'text-slate-400'
                  }`}
                >
                  {agent.displayName}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-3 text-xs text-slate-400">Nenhum agente encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
