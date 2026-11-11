export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent-400" />
      </div>

      <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-900">
        <div className="pixel-bar h-full w-full animate-pulse" />
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">carregando</p>
    </div>
  );
}
