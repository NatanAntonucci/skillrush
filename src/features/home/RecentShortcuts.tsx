'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useRecent } from '@/hooks/useRecent';

export function RecentShortcuts() {
  const { recent, ready } = useRecent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!ready || !mounted) {
    return (
      <div className="flex gap-3">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-900" />
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-900" />
      </div>
    );
  }

  if (recent.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Seus últimos mapas aparecem aqui depois da primeira consulta.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {recent.map((entry) => (
        <Link
          key={`${entry.mapSlug}-${entry.agentSlug ?? 'all'}`}
          href={`/maps/${entry.mapSlug}${entry.agentSlug ? `?agente=${entry.agentSlug}` : ''}`}
          className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-accent-500/60 hover:text-white"
        >
          {entry.mapName}
          {entry.agentName ? ` · ${entry.agentName}` : ''}
        </Link>
      ))}
    </div>
  );
}
