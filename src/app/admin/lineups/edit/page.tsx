'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNav } from '@/components/admin/AdminNav';
import { LineupForm } from '@/features/admin/LineupForm';
import { fetchLineupById } from '@/services/supabase/lineups';

import type { Lineup } from '@/types';

function EditLineup() {
  const [id, setId] = useState<string | null>(null);
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lido no efeito (e não via useSearchParams) para a página continuar estática no export.
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get('id'));
  }, []);

  useEffect(() => {
    if (!id) {
      if (id === null) return;
      setError('Lineup não informada.');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await fetchLineupById(id as string);

        if (!data) {
          setError('Lineup não encontrada.');
        } else {
          setLineup(data);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar a lineup.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <main className="min-h-screen text-slate-100">
      <AdminNav />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold">Editar lineup</h1>
          </div>

          <Link
            href="/admin/lineups"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500"
          >
            Voltar
          </Link>
        </header>

        {loading && <p className="text-sm text-slate-400">Carregando...</p>}
        {error && <p className="text-sm text-rose-400">{error}</p>}
        {!loading && lineup && <LineupForm mode="edit" lineup={lineup} />}
      </section>
    </main>
  );
}

export default function EditLineupPage() {
  return (
    <AdminGuard>
      <EditLineup />
    </AdminGuard>
  );
}
