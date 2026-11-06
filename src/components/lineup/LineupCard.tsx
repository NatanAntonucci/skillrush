import Image from 'next/image';
import Link from 'next/link';

import { labelDifficulty, labelSide } from '@/utils/labels';

import type { Lineup } from '@/types';

export function LineupCard({ lineup }: { lineup: Lineup }) {
  return (
    <Link
      href={`/lineups/${lineup.slug}`}
      className="group flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-cyan-500/50 hover:bg-slate-900"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black/40 p-1">
        {lineup.ability?.displayIcon && (
          <Image
            src={lineup.ability.displayIcon}
            alt={lineup.abilityName}
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white group-hover:text-cyan-300">{lineup.title}</p>

        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{lineup.description}</p>

        <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-500">
          {lineup.agent?.displayName && <span>{lineup.agent.displayName}</span>}
          {lineup.map?.displayName && <span>· {lineup.map.displayName}</span>}
          {lineup.abilityName && <span>· {lineup.abilityName}</span>}
          {lineup.difficulty && <span>· {labelDifficulty(lineup.difficulty)}</span>}
          {lineup.side && <span>· {labelSide(lineup.side)}</span>}
        </div>
      </div>
    </Link>
  );
}
