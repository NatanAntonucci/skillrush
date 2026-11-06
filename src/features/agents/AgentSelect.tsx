'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, Search, X } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { selectedAgent, setSelectedAgent } = useLineupStore();
  const containerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return agents;
    return agents.filter((agent) => normalize(agent.displayName).includes(term));
  }, [agents, query]);

  function select(agent: Agent | null) {
    if (agent) {
      setSelectedAgent(agent);
    }
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative min-w-0 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Agente</span>

        {selectedAgent && (
          <button
            type="button"
            onClick={() => setSelectedAgent(selectedAgent)}
            className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-slate-200"
          >
            <X size={12} />
            Limpar
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loading}
        className="mt-2 flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-left transition hover:border-slate-600 disabled:opacity-60"
      >
        {selectedAgent?.displayIcon ? (
          <Image
            src={resolveImage(selectedAgent.displayIcon)!}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <span className="h-8 w-8 rounded-md bg-slate-800" />
        )}

        <span className="min-w-0 flex-1 truncate text-sm text-white">
          {selectedAgent?.displayName ?? (loading ? 'Carregando…' : 'Escolher agente')}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="animate-fade-up absolute left-0 top-full z-50 mt-2 w-[min(22rem,100%)] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
          <div className="relative border-b border-slate-800">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar agente…"
              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="custom-scrollbar max-h-64 overflow-y-auto p-2">
            {error && <p className="p-2 text-xs text-rose-400">{error}</p>}

            <div className="grid grid-cols-6 gap-1.5">
              {filtered.map((agent) => {
                const active = selectedAgent?.id === agent.id;

                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => select(agent)}
                    title={agent.displayName}
                    aria-label={agent.displayName}
                    aria-pressed={active}
                    className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border transition ${
                      active
                        ? 'border-accent-400 ring-2 ring-accent-400/30'
                        : 'border-transparent hover:border-slate-600'
                    }`}
                  >
                    {agent.displayIcon ? (
                      <Image
                        src={resolveImage(agent.displayIcon)!}
                        alt={agent.displayName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-300">
                        {agent.displayName.slice(0, 2).toUpperCase()}
                      </span>
                    )}

                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                        <Check size={16} className="text-accent-300" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="p-3 text-center text-xs text-slate-400">Nenhum agente encontrado.</p>
            )}
          </div>

          <p className="border-t border-slate-800 px-3 py-2 text-[11px] text-slate-500">
            {agents.length} agentes · clique no ícone para escolher
          </p>
        </div>
      )}
    </div>
  );
}
