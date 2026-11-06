'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { useAdmin } from '@/hooks/useAdmin';

/**
 * Guarda de interface para as telas administrativas. Esconde o conteúdo,
 * mas a autorização de verdade é feita pelo RLS do Postgres.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const admin = useAdmin();

  if (admin.loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Verificando acesso...
      </main>
    );
  }

  if (!admin.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="text-sm text-slate-400">
            Esta área é exclusiva para administradores e moderadores.
          </p>
          <Link
            href="/admin"
            className="inline-block rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Ir para o login
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
