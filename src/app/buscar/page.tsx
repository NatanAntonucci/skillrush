'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import type { fetchSearchCatalog } from '@/services/supabase/search';
import { slugify } from '@/utils/slug';

type SearchCatalog = Awaited<ReturnType<typeof fetchSearchCatalog>>;

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<SearchCatalog | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const needsCatalog = Boolean(query.trim()) && !catalog;
  const loading = needsCatalog && !error;

  useEffect(() => {
    const readQuery = () => setQuery(new URLSearchParams(window.location.search).get('q') ?? '');
    readQuery();
    window.addEventListener('popstate', readQuery);
    return () => window.removeEventListener('popstate', readQuery);
  }, []);

  useEffect(() => {
    if (!needsCatalog) return;
    const controller = new AbortController();
    setError(false);
    async function load() {
      try {
        const { fetchSearchCatalog } = await import('@/services/supabase/search');
        if (controller.signal.aborted) return;
        const data = await fetchSearchCatalog(controller.signal);
        if (!controller.signal.aborted) setCatalog(data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [needsCatalog, attempt]);

  function updateQuery(value: string) {
    setQuery(value);
    const term = value.trim();
    const url = term ? `/buscar?q=${encodeURIComponent(term)}` : '/buscar';
    window.history.replaceState(window.history.state, '', url);
  }

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term || !catalog) return { agents: [], maps: [], lineups: [] };

    return {
      agents: catalog.agents.filter((agent) => normalize(agent.displayName).includes(term)).slice(0, 6),
      maps: catalog.maps.filter((map) => normalize(map.displayName).includes(term)).slice(0, 6),
      lineups: catalog.lineups
        .filter(
          (lineup) =>
            normalize(lineup.title).includes(term) ||
            normalize(lineup.abilityName ?? '').includes(term) ||
            normalize(lineup.agent?.displayName ?? '').includes(term) ||
            normalize(lineup.map?.displayName ?? '').includes(term),
        )
        .slice(0, 10),
    };
  }, [catalog, query]);

  const hasResults =
    results.agents.length + results.maps.length + results.lineups.length > 0;

  return (
    <main className="min-h-screen text-slate-100">
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Buscar</h1>
        <p className="mt-1 text-sm text-slate-400">
          Agente, mapa ou nome da lineup. Ex.: “sova”, “bind”, “smoke A”.
        </p>

        <input
          autoFocus
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Buscar…"
          className="mt-6 w-full rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-lg text-white outline-none placeholder:text-slate-500 focus:border-accent-500"
        />

        {loading && <p className="mt-8 text-sm text-slate-400">Carregando dados…</p>}

        {error && needsCatalog && (
          <p role="alert" className="mt-8 text-sm text-slate-400">
            Não foi possível carregar a busca.{' '}
            <button onClick={() => setAttempt((current) => current + 1)} className="text-accent-300">
              Tentar novamente
            </button>
          </p>
        )}

        {catalog && query.trim() && !hasResults && (
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
