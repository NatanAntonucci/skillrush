import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getAllLineups, getLineupBySlug } from '@/services/queries';
import { getVideoEmbedUrl } from '@/utils/video';
import { labelDifficulty, labelSide } from '@/utils/labels';
import { slugify } from '@/utils/slug';

interface LineupPageProps {
  params: { slug: string };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const lineups = await getAllLineups();
  return lineups.map((lineup) => ({ slug: lineup.slug }));
}

export async function generateMetadata({ params }: LineupPageProps): Promise<Metadata> {
  const lineup = await getLineupBySlug(params.slug);

  if (!lineup) {
    return { title: 'Lineup não encontrada' };
  }

  return {
    title: `${lineup.title} — ${lineup.agent?.displayName ?? ''} em ${lineup.map?.displayName ?? ''}`,
    description: lineup.description.slice(0, 160),
    openGraph: {
      title: lineup.title,
      description: lineup.description.slice(0, 160),
    },
  };
}

export default async function LineupPage({ params }: LineupPageProps) {
  const lineup = await getLineupBySlug(params.slug);

  if (!lineup) {
    notFound();
  }

  const embedUrl = getVideoEmbedUrl(lineup.videoUrl);
  const mapSlug = lineup.map?.displayName ? slugify(lineup.map.displayName) : null;
  const agentSlug = lineup.agent?.displayName ? slugify(lineup.agent.displayName) : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <nav className="mb-6 flex flex-wrap gap-1 text-sm text-slate-500">
          <Link href="/maps" className="hover:text-cyan-300">
            Mapas
          </Link>
          {mapSlug && (
            <>
              <span>/</span>
              <Link href={`/maps/${mapSlug}`} className="hover:text-cyan-300">
                {lineup.map?.displayName}
              </Link>
            </>
          )}
          {mapSlug && agentSlug && (
            <>
              <span>/</span>
              <Link href={`/maps/${mapSlug}/${agentSlug}`} className="hover:text-cyan-300">
                {lineup.agent?.displayName}
              </Link>
            </>
          )}
        </nav>

        <header className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {lineup.abilityName && (
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
                {lineup.abilityName}
              </span>
            )}
            {lineup.difficulty && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {labelDifficulty(lineup.difficulty)}
              </span>
            )}
            {lineup.side && (
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">
                {labelSide(lineup.side)}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white">{lineup.title}</h1>
          <p className="text-sm text-slate-400">
            {lineup.agent?.displayName} · {lineup.map?.displayName} · Hotspot {lineup.hotspot.label}
          </p>
        </header>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-black">
          {embedUrl ? (
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={embedUrl}
                title={lineup.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-slate-400">
              <a
                href={lineup.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-slate-700 px-4 py-2 text-cyan-300 hover:border-cyan-500"
              >
                Abrir vídeo
              </a>
            </div>
          )}
        </div>

        <article className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-white">Como executar</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
            {lineup.description}
          </p>
        </article>

        <div className="mt-10 flex flex-wrap gap-3">
          {mapSlug && (
            <Link
              href={`/maps/${mapSlug}`}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            >
              Mais lineups em {lineup.map?.displayName}
            </Link>
          )}
          {agentSlug && (
            <Link
              href={`/agents/${agentSlug}`}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            >
              Sobre {lineup.agent?.displayName}
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
