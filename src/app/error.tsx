'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-slate-950 px-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Erro</p>
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="text-sm text-slate-400">
          Não foi possível carregar esta página. Tente novamente — se persistir, avise o
          administrador.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-accent-400"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:border-slate-500"
          >
            Ir para a home
          </a>
        </div>
      </div>
    </main>
  );
}
