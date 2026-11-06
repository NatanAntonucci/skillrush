export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent-400" />
      </div>
      <p className="text-sm text-slate-400">Carregando…</p>
    </div>
  );
}
