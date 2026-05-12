'use client';

import { useMemo } from 'react';

import { useLineupStore } from '@/stores/lineupStore';

function getYoutubeEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
  );

  const videoId = match?.[1];

  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
}

export default function LineupDetails() {
  const { selectedLineup } = useLineupStore();

  const embedUrl = useMemo(() => {
    if (!selectedLineup?.videoUrl) {
      return null;
    }

    return getYoutubeEmbedUrl(selectedLineup.videoUrl);
  }, [selectedLineup]);

  if (!selectedLineup) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-slate-200">
            Nenhuma lineup selecionada
          </p>

          <p className="max-w-md text-sm text-slate-400">
            Clique em uma lineup disponível ou em um hotspot do mapa
            interativo para visualizar os detalhes da jogada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {selectedLineup.abilityName && (
            <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
              {selectedLineup.abilityName}
            </span>
          )}

          {selectedLineup.difficulty && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {selectedLineup.difficulty}
            </span>
          )}

          {selectedLineup.side && (
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">
              {selectedLineup.side}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
            {selectedLineup.title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {selectedLineup.description}
          </p>
        </div>
      </div>

      {/* VIDEO */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-black">
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={embedUrl}
              title={selectedLineup.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-slate-950 text-sm text-slate-400">
            URL de vídeo inválida ou não cadastrada.
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Agente
          </p>

          <div className="mt-3 flex items-center gap-3">
            {selectedLineup.agent?.displayIcon && (
              <img
                src={selectedLineup.agent.displayIcon}
                alt={selectedLineup.agent.displayName}
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
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Mapa
          </p>

          <div className="mt-3 flex items-center gap-3">
            {selectedLineup.map?.listViewIcon && (
              <img
                src={selectedLineup.map.listViewIcon}
                alt={selectedLineup.map.displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}

            <div>
              <p className="font-medium text-white">
                {selectedLineup.map?.displayName ?? 'Não definido'}
              </p>

              <p className="text-sm text-slate-400">
                Hotspot {selectedLineup.hotspot.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}