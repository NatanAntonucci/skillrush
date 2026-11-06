'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { fetchAgents } from '@/services/supabase/agents';
import { fetchMaps } from '@/services/supabase/maps';
import { fetchLineups } from '@/services/supabase/lineups';
import { competitiveMaps } from '@/utils/maps';
import { slugify } from '@/utils/slug';

import type { Agent, Lineup, MapData } from '@/types';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q') ?? '';
    setQuery(initial);

    async function load() {
      try {
        const [agentData, mapData, lineupData] = await Promise.all([
          fetchAgents(),
          fetchMaps(),
          fetchLineups({ limit: 200 }),
        ]);

        setAgents(agentData);
        setMaps(competitiveMaps(mapData));
        setLineups(lineupData);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    const term = query.trim();
    const url = term ? `/buscar?q=${encodeURIComponent(term)}` : '/buscar';
    window.history.replaceState(null, '', url);
  }, [query]);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return { agents: [], maps: [], lineups: [] };

    return {
      agents: agents.filter((agent) => normalize(agent.displayName).includes(term)).slice(0, 6),
      maps: maps.filter((map) => normalize(map.displayName).includes(term)).slice(0, 6),
      lineups: lineups
        .filter(
          (lineup) =>
            normalize(lineup.title).includes(term) ||
            normalize(lineup.abilityName ?? '').includes(term) ||
            normalize(lineup.agent?.displayName ?? '').includes(term) ||
            normalize(lineup.map?.displayName ?? '').includes(term),
        )
        .slice(0, 10),
    };
  }, [agents, maps, lineups, query]);

  const hasResults =
    results.agents.length + results.maps.length + results.lineups.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Buscar</h1>
        <p className="mt-1 text-sm text-slate-400">
          Agente, mapa ou nome da lineup. Ex.: “sova”, “bind”, “smoke A”.
        </p>

        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar…"
          className="mt-6 w-full rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-lg text-white outline-none placeholder:text-slate-500 focus:border-accent-500"
        />

        {loading && <p className="mt-8 text-sm text-slate-400">Carregando dados…</p>}

        {!loading && query.trim() && !hasResults && (
          <p className="mt-8 text-sm text-slate-400">
            Nada encontrado para “{query}”. Tente o nome do agente ou do mapa.
          </p>
        )}

        {results.maps.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Mapas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {results.maps.map((map) => (
                <Link
                  key={map.id}
                  href={`/maps/${slugify(map.displayName)}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:border-accent-500/60"
                >
                  {map.displayName}
                </Link>
              ))}
            </div>
          </section>
        )}

        {results.agents.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Agentes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {results.agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${slugify(agent.displayName)}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:border-accent-500/60"
                >
                  {agent.displayName}
                </Link>
              ))}
            </div>
          </section>
        )}

        {results.lineups.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400">Lineups</h2>
            <div className="mt-3 space-y-2">
              {results.lineups.map((lineup) => (
                <Link
                  key={lineup.id}
                  href={`/lineups/${lineup.slug}`}
                  className="block rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 hover:border-accent-500/60"
                >
                  <span className="font-medium text-white">{lineup.title}</span>
                  <span className="ml-2 text-slate-400">
                    {lineup.agent?.displayName} · {lineup.map?.displayName} · {lineup.abilityName}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
