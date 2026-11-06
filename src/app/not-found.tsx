import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-slate-950 px-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">404</p>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-sm text-slate-400">
          O endereço pode ter mudado ou nunca existiu.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Voltar para a home
        </Link>
      </div>
    </main>
  );
}
