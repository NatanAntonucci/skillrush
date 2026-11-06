'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { deleteLineup, fetchLineups } from '@/services/supabase/lineups';
import { labelDifficulty, labelSide, labelStatus } from '@/utils/labels';
import { resolveImage } from '@/utils/images';

import type { Lineup } from '@/types';

function LineupsManager() {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchLineups({ status: 'all', limit: 200 });
      setLineups(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar lineups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(lineup: Lineup) {
    const confirmed = window.confirm(`Excluir "${lineup.title}"? Essa ação não pode ser desfeita.`);
    if (!confirmed) return;

    setDeletingId(lineup.id);

    try {
      await deleteLineup(lineup.id);
      setLineups((current) => current.filter((item) => item.id !== lineup.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao excluir.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold">Lineups</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/equipe"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500"
            >
              Equipe
            </Link>

            <Link
              href="/admin/upload"
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-400"
            >
              Nova lineup
            </Link>
          </div>
        </header>

        {loading && <p className="text-sm text-slate-400">Carregando...</p>}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        {!loading && lineups.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
            Nenhuma lineup cadastrada ainda.
          </p>
        )}

        <div className="space-y-3">
          {lineups.map((lineup) => (
            <article
              key={lineup.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
            >
              {lineup.ability?.displayIcon && (
                <Image src={resolveImage(lineup.ability.displayIcon)!} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{lineup.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {lineup.agent?.displayName ?? '—'} · {lineup.map?.displayName ?? '—'} ·{' '}
                  {lineup.abilityName} · {labelDifficulty(lineup.difficulty)} ·{' '}
                  {labelSide(lineup.side) || 'sem lado'}
                </p>
              </div>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {labelStatus(lineup.status)}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/lineups/edit?id=${lineup.id}`}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
                >
                  Editar
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(lineup)}
                  disabled={deletingId === lineup.id}
                  className="rounded-lg border border-rose-800/60 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-950/40 disabled:opacity-50"
                >
                  {deletingId === lineup.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function AdminLineupsPage() {
  return (
    <AdminGuard>
      <LineupsManager />
    </AdminGuard>
  );
}
