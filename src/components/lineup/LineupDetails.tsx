'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import { useLineupStore } from '@/stores/lineupStore';
import { ShareMenu } from '@/components/share/ShareMenu';
import { getVideoEmbedUrl } from '@/utils/video';
import { labelDifficulty, labelSide } from '@/utils/labels';
import { resolveImage } from '@/utils/images';

export default function LineupDetails() {
  const { selectedLineup } = useLineupStore();

  const embedUrl = useMemo(() => {
    if (!selectedLineup?.videoUrl) return null;
    return getVideoEmbedUrl(selectedLineup.videoUrl);
  }, [selectedLineup]);

  if (!selectedLineup) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center sm:min-h-[420px]">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-slate-200">Nenhuma lineup selecionada</p>
          <p className="max-w-md text-sm text-slate-400">
            Clique em uma lineup disponível ou em um hotspot do mapa interativo para visualizar os
            detalhes da jogada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {selectedLineup.abilityName && (
              <span className="rounded-full bg-accent-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent-200">
                {selectedLineup.abilityName}
              </span>
            )}

            {selectedLineup.difficulty && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {labelDifficulty(selectedLineup.difficulty)}
              </span>
            )}

            {selectedLineup.side && (
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">
                {labelSide(selectedLineup.side)}
              </span>
            )}
          </div>

          <ShareMenu title={selectedLineup.title} path={`/lineups/${selectedLineup.slug}`} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">{selectedLineup.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{selectedLineup.description}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-black">
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              loading="lazy"
              className="h-full w-full"
              src={embedUrl}
              title={selectedLineup.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-sm text-slate-400">
            <p>Não foi possível embutir este vídeo.</p>
            <a
              href={selectedLineup.videoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-slate-700 px-4 py-1.5 text-xs text-accent-300 hover:border-accent-500"
            >
              Abrir vídeo original
            </a>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Agente</p>

          <div className="mt-3 flex items-center gap-3">
            {selectedLineup.agent?.displayIcon && (
              <Image
                src={resolveImage(selectedLineup.agent.displayIcon)!}
                alt={selectedLineup.agent.displayName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}

            <div>
              <p className="font-medium text-white">
                {selectedLineup.agent?.displayName ?? 'Não definido'}
              </p>
              <p className="text-sm text-slate-400">
                {selectedLineup.agent?.role?.displayName ?? 'Sem função'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Mapa</p>

          <div className="mt-3 flex items-center gap-3">
            {selectedLineup.map?.listViewIcon && (
              <Image
                src={resolveImage(selectedLineup.map.listViewIcon)!}
                alt={selectedLineup.map.displayName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}

            <div>
              <p className="font-medium text-white">
                {selectedLineup.map?.displayName ?? 'Não definido'}
              </p>
              <p className="text-sm text-slate-400">Hotspot {selectedLineup.hotspot.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
