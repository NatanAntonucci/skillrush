'use client';

import Link from 'next/link';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminNav } from '@/components/admin/AdminNav';
import { LineupForm } from '@/features/admin/LineupForm';

export default function UploadPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen text-slate-100">
      <AdminNav />
        <section className="mx-auto max-w-4xl px-6 py-10">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Admin</p>
              <h1 className="mt-2 text-2xl font-semibold">Nova lineup</h1>
            </div>

            <div className="flex gap-2">
              <Link
                href="/admin/lineups"
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500"
              >
                Gerenciar
              </Link>

              <Link
                href="/admin/equipe"
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500"
              >
                Equipe
              </Link>
            </div>
          </header>

          <LineupForm mode="create" />
        </section>
      </main>
    </AdminGuard>
  );
}
