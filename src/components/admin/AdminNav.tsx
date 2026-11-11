'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, ListChecks, Plus, Users } from 'lucide-react';

const tabs = [
  { label: 'Lineups', href: '/admin/lineups', icon: ListChecks },
  { label: 'Nova lineup', href: '/admin/upload', icon: Plus },
  { label: 'Equipe', href: '/admin/equipe', icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-14 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sm:top-16">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-accent-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-950">
            admin
          </span>
          <span className="hidden text-sm text-slate-400 sm:inline">Skillrush</span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Seções do admin">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-accent-500/15 text-accent-200 ring-1 ring-accent-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}

          <Link
            href="/"
            className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-900 hover:text-slate-200"
          >
            <ExternalLink size={15} />
            <span className="hidden sm:inline">Ver site</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
