'use client';

import { useState } from 'react';
import type { Lineup } from '@/types/lineup';
import { X, Play } from 'lucide-react';

interface LineupDetailsModalProps {
  lineup: Lineup;
  onClose: () => void;
}

export function LineupDetailsModal({ lineup, onClose }: LineupDetailsModalProps) {
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId
  ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
  : url;
  };

  const embedUrl = getYoutubeEmbedUrl(lineup.videoUrl);
  const isYoutubeUrl = embedUrl.includes('youtube.com');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="mx-auto my-10 w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl shadow-slate-950/60">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-6">
          <div className="flex-1">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Detalhes da lineup</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{lineup.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{lineup.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-xs uppercase text-slate-400">Habilidade</span>
                <strong className="text-lg text-cyan-100">{lineup.abilityName}</strong>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-xs uppercase text-slate-400">Hotspot</span>
                <strong className="text-lg text-violet-100">{lineup.hotspot.label}</strong>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-xs uppercase text-slate-400">Dificuldade</span>
                <strong className="text-lg text-slate-100">{lineup.difficulty ?? 'Não definida'}</strong>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <span className="text-xs uppercase text-slate-400">Lado</span>
                <strong className="text-lg text-slate-100">{lineup.side ?? 'Não definido'}</strong>
              </div>
            </div>

            {/* Video */}
            {isYoutubeUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-black">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="animate-pulse text-slate-400">
                      <Play size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Carregando vídeo...</p>
                    </div>
                  </div>
                )}
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={lineup.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsVideoLoading(false)}
                />
              </div>
            ) : (
              <div className="aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 flex items-center justify-center">
                <p className="text-slate-400 text-sm">URL de vídeo inválida</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <div>
              <p className="text-xs uppercase text-slate-400 mb-3">Informações</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Posição X</dt>
                  <dd className="text-slate-200 font-medium">{lineup.hotspot.x}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Posição Y</dt>
                  <dd className="text-slate-200 font-medium">{lineup.hotspot.y}%</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
