'use client';

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Zap } from 'lucide-react';

import { MapHotspot } from './MapHotspot';
import { ShareMenu } from '@/components/share/ShareMenu';
import { useRecent } from '@/hooks/useRecent';
import { applyFilters } from '@/utils/filters';
import { labelDifficulty, labelSide } from '@/utils/labels';
import { resolveImage } from '@/utils/images';
import { slugify } from '@/utils/slug';
import { getVideoEmbedUrl, getVideoThumbnail } from '@/utils/video';

import type { Lineup, MapData } from '@/types';

interface ImageBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const FULL_BOX: ImageBox = { left: 0, top: 0, width: 100, height: 100 };

function groupCount<T>(items: T[], key: (item: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return map;
}

export function MapBoard({
  map,
  lineups,
  initialAgentSlug,
}: {
  map: MapData;
  lineups: Lineup[];
  initialAgentSlug?: string;
}) {
  const [agentSlug, setAgentSlug] = useState(initialAgentSlug ?? '');
  const [ability, setAbility] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [side, setSide] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quick, setQuick] = useState(false);
  const [box, setBox] = useState<ImageBox>(FULL_BOX);

  const { remember } = useRecent();
  const remembered = useRef(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('agente');
    if (fromUrl) setAgentSlug(fromUrl);
  }, []);

  const mapImage = resolveImage(map.displayIcon || map.splash) ?? '';

  const agents = useMemo(() => {
    const counts = groupCount(lineups, (lineup) => lineup.agent?.displayName);
    return Array.from(counts.entries())
      .map(([name, total]) => ({ name, slug: slugify(name), total }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [lineups]);

  const agentAbilities = useMemo(() => {
    const scoped = agentSlug
      ? lineups.filter((lineup) => slugify(lineup.agent?.displayName ?? '') === agentSlug)
      : lineups;

    return Array.from(new Set(scoped.map((lineup) => lineup.abilityName).filter(Boolean)));
  }, [lineups, agentSlug]);

  const filtered = useMemo(() => {
    return applyFilters(lineups, {
      abilities: ability ? [ability] : [],
      difficulty,
      side,
    }).filter((lineup) => !agentSlug || slugify(lineup.agent?.displayName ?? '') === agentSlug);
  }, [lineups, agentSlug, ability, difficulty, side]);

  const selected = useMemo(
    () => filtered.find((lineup) => lineup.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  useEffect(() => {
    if (remembered.current) return;
    remembered.current = true;

    remember({
      mapSlug: slugify(map.displayName),
      mapName: map.displayName,
      agentSlug: initialAgentSlug,
      agentName: initialAgentSlug
        ? lineups.find((lineup) => slugify(lineup.agent?.displayName ?? '') === initialAgentSlug)
            ?.agent?.displayName
        : undefined,
    });
  }, [remember, map.displayName, initialAgentSlug, lineups]);

  useEffect(() => {
    if (selectedId && !filtered.some((lineup) => lineup.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!selected) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedId(null);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height || !image.naturalWidth || !image.naturalHeight) return;

    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const width = ((image.naturalWidth * scale) / rect.width) * 100;
    const height = ((image.naturalHeight * scale) / rect.height) * 100;

    setBox({ left: (100 - width) / 2, top: (100 - height) / 2, width, height });
  }

  const embedUrl = selected ? getVideoEmbedUrl(selected.videoUrl) : null;
  const thumbnail = selected ? getVideoThumbnail(selected.videoUrl) : null;
  const steps = selected
    ? selected.description
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* MAPA + FILTROS */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAgentSlug('');
              setAbility(null);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              agentSlug === ''
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
            }`}
          >
            Todos
          </button>

          {agents.map((agent) => (
            <button
              key={agent.slug}
              type="button"
              onClick={() => {
                setAgentSlug(agent.slug === agentSlug ? '' : agent.slug);
                setAbility(null);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                agentSlug === agent.slug
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              {agent.name}
              <span className="ml-1 text-xs text-slate-400">{agent.total}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {agentAbilities.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setAbility(ability === name ? null : name)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                ability === name
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600'
              }`}
            >
              {name}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-slate-800" />

          {(['easy', 'medium', 'hard'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(difficulty === value ? null : value)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                difficulty === value
                  ? 'border-violet-400 bg-violet-500/15 text-violet-100'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600'
              }`}
            >
              {labelDifficulty(value)}
            </button>
          ))}

          {(['attack', 'defense'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSide(side === value ? null : value)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                side === value
                  ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600'
              }`}
            >
              {labelSide(value)}
            </button>
          ))}
        </div>

        <div className="relative mt-4 aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <Image
            key={mapImage}
            src={mapImage}
            alt={map.displayName}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            onLoad={handleImageLoad}
            className="object-contain"
          />

          <div
            className="absolute"
            style={{
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
          >
            {filtered.map((lineup) => (
              <MapHotspot
                key={lineup.id}
                x={lineup.hotspot.x}
                y={lineup.hotspot.y}
                abilityIcon={resolveImage(lineup.ability?.displayIcon)}
                label={lineup.hotspot.label}
                isSelected={selectedId === lineup.id}
                onClick={() => setSelectedId(lineup.id)}
              />
            ))}
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          {filtered.length} lineup(s) neste mapa
          {agentSlug ? ` para ${agents.find((agent) => agent.slug === agentSlug)?.name}` : ''}.
        </p>
      </div>

      {/* LISTA + DETALHE */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Lineups
          </h2>

          <button
            type="button"
            onClick={() => setQuick((current) => !current)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
              quick
                ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                : 'border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Zap size={13} />
            Modo rápido
          </button>
        </div>

        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">
              Nenhuma lineup com esses filtros. Tente remover algum.
            </p>
          )}

          {filtered.map((lineup) => (
            <button
              key={lineup.id}
              type="button"
              onClick={() => setSelectedId(lineup.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                selectedId === lineup.id
                  ? 'border-cyan-500/60 bg-cyan-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black/40 p-1">
                {lineup.ability?.displayIcon && (
                  <Image
                    src={resolveImage(lineup.ability.displayIcon)!}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-contain"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{lineup.title}</span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {lineup.agent?.displayName} · {labelDifficulty(lineup.difficulty)}
                  {lineup.side ? ` · ${labelSide(lineup.side)}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={() => setSelectedId(null)}
          >
            <div
              className="animate-fade-up max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-slate-800 bg-slate-950 p-4 sm:max-w-3xl sm:rounded-3xl sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{selected.title}</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {selected.agent?.displayName} · {selected.abilityName} · Hotspot{' '}
                  {selected.hotspot.label}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Fechar detalhes"
              >
                <X size={18} />
              </button>
            </div>

            {!quick && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-black">
                {embedUrl ? (
                  <div className="aspect-video">
                    <iframe
                      className="h-full w-full"
                      src={embedUrl}
                      title={selected.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : thumbnail ? (
                  <img src={thumbnail} alt="" className="aspect-video w-full object-cover" />
                ) : null}
              </div>
            )}

            {quick && thumbnail && (
              <img src={thumbnail} alt="" className="mt-3 aspect-video w-full rounded-xl object-cover" />
            )}

            {steps.length > 0 && (
              <ol className="mt-3 space-y-2 text-sm text-slate-300">
                {steps.map((step, index) => (
                  <li key={`${index}-${step.slice(0, 12)}`} className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-200">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <ShareMenu title={selected.title} path={`/lineups/${selected.slug}`} align="left" />

              <Link
                href={`/lineups/${selected.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
              >
                Página da lineup
              </Link>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
