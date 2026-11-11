'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';

import { fetchAgents } from '@/services/supabase/agents';
import { fetchMaps } from '@/services/supabase/maps';
import { fetchAbilitiesByAgent } from '@/services/supabase/abilities';
import { createLineup, deleteLineup, updateLineup } from '@/services/supabase/lineups';
import { competitiveMaps } from '@/utils/maps';
import { resolveImage } from '@/utils/images';
import { pointToPercentage } from '@/utils/video';

import type { Ability, Agent, Lineup, MapData } from '@/types';

const difficultyOptions = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
];

const sideOptions = [
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defesa' },
];

interface LineupFormProps {
  mode: 'create' | 'edit';
  lineup?: Lineup | null;
}

export function LineupForm({ mode, lineup }: LineupFormProps) {
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);

  const [title, setTitle] = useState(lineup?.title ?? '');
  const [agentId, setAgentId] = useState(lineup?.agentId ?? '');
  const [mapId, setMapId] = useState(lineup?.mapId ?? '');
  const [abilityId, setAbilityId] = useState(lineup?.abilityId ?? '');
  const [abilityName, setAbilityName] = useState(lineup?.abilityName ?? '');

  const [difficulty, setDifficulty] = useState(lineup?.difficulty ?? 'easy');
  const [side, setSide] = useState(lineup?.side ?? 'attack');

  const [description, setDescription] = useState(lineup?.description ?? '');
  const [videoUrl, setVideoUrl] = useState(lineup?.videoUrl ?? '');

  const [hotspotLabel, setHotspotLabel] = useState(lineup?.hotspot.label ?? 'A');
  const [hotspotX, setHotspotX] = useState(lineup?.hotspot.x ?? 50);
  const [hotspotY, setHotspotY] = useState(lineup?.hotspot.y ?? 50);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageBox, setImageBox] = useState({ left: 0, top: 0, width: 100, height: 100 });

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height || !image.naturalWidth || !image.naturalHeight) return;

    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const width = ((image.naturalWidth * scale) / rect.width) * 100;
    const height = ((image.naturalHeight * scale) / rect.height) * 100;

    setImageBox({ left: (100 - width) / 2, top: (100 - height) / 2, width, height });
  }

  const selectedMap = useMemo(
    () => maps.find((map) => map.id === mapId) ?? null,
    [maps, mapId],
  );

  const mapImage = resolveImage(selectedMap?.displayIcon || selectedMap?.splash || '') ?? '';

  useEffect(() => {
    async function loadData() {
      try {
        const [agentData, mapData] = await Promise.all([fetchAgents(), fetchMaps()]);
        setAgents(agentData);
        setMaps(competitiveMaps(mapData));
      } catch {
        setError('Erro ao carregar agentes ou mapas.');
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!agentId) {
      setAbilities([]);
      if (mode === 'create') {
        setAbilityId('');
        setAbilityName('');
      }
      return;
    }

    async function loadAbilities() {
      try {
        const data = await fetchAbilitiesByAgent(agentId);
        setAbilities(data);

        if (!data.some((ability) => ability.id === abilityId) && mode === 'create') {
          setAbilityId('');
          setAbilityName('');
        }
      } catch {
        setError('Erro ao carregar utilitários do agente.');
      }
    }

    loadAbilities();
  }, [agentId, abilityId, mode]);

  const selectedAbility = useMemo(
    () => abilities.find((ability) => ability.id === abilityId) ?? null,
    [abilities, abilityId],
  );

  useEffect(() => {
    if (selectedAbility) {
      setAbilityName(selectedAbility.displayName);
    }
  }, [selectedAbility]);

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    const image = imgRef.current;
    if (!image) return;

    const point = pointToPercentage(event.clientX, event.clientY, image);
    if (!point) return;

    setHotspotX(point.x);
    setHotspotY(point.y);
  }

  function buildPayload() {
    return {
      title,
      agentId,
      mapId,
      abilityId,
      abilityName,
      description,
      videoUrl,
      difficulty,
      side,
      hotspot: { x: hotspotX, y: hotspotY, label: hotspotLabel },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!title || !agentId || !mapId || !abilityId || !description || !videoUrl) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'edit' && lineup) {
        await updateLineup(lineup.id, buildPayload());
        setStatus('Alterações salvas.');
        router.push('/admin/lineups');
      } else {
        await createLineup(buildPayload(), { status: 'approved' });
        setStatus('Lineup publicada com sucesso.');

        setTitle('');
        setAgentId('');
        setMapId('');
        setAbilityId('');
        setAbilityName('');
        setDescription('');
        setVideoUrl('');
        setHotspotLabel('A');
        setHotspotX(50);
        setHotspotY(50);
        setAbilities([]);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!lineup) return;

    const confirmed = window.confirm(`Excluir "${lineup.title}"? Essa ação não pode ser desfeita.`);
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteLineup(lineup.id);
      router.push('/admin/lineups');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao excluir.');
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        placeholder="Título (ex.: Smoke A-site da base)"
        maxLength={120}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <select
          value={agentId}
          onChange={(event) => setAgentId(event.target.value)}
          className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        >
          <option value="">Agente</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.displayName}</option>
          ))}
        </select>

        <select
          value={mapId}
          onChange={(event) => setMapId(event.target.value)}
          className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        >
          <option value="">Mapa</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>{map.displayName}</option>
          ))}
        </select>
      </div>

      <select
        value={abilityId}
        onChange={(event) => setAbilityId(event.target.value)}
        className="w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
      >
        <option value="">Habilidade</option>
        {abilities.map((ability) => (
          <option key={ability.id} value={ability.id}>{ability.displayName}</option>
        ))}
      </select>

      <div className="grid gap-4 sm:grid-cols-2">
        <select
          value={difficulty ?? 'easy'}
          onChange={(event) => setDifficulty(event.target.value)}
          className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        >
          {difficultyOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={side ?? 'attack'}
          onChange={(event) => setSide(event.target.value)}
          className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        >
          {sideOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <input
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        className="w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        placeholder="URL do vídeo (YouTube, Twitch, Streamable)"
      />

      <div>
        <p className="mb-2 text-sm text-slate-400">
          Clique no mapa para marcar onde a lineup acontece
          {selectedMap ? ` (${hotspotX}%, ${hotspotY}%)` : ''}
        </p>

        <div
          className="relative cursor-crosshair overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
          style={{ aspectRatio: '16 / 9' }}
          onClick={handleMapClick}
        >
          {mapImage ? (
            <img
              ref={imgRef}
              src={mapImage}
              alt={selectedMap?.displayName ?? 'Mapa'}
              onLoad={handleImageLoad}
              className="pointer-events-none h-full w-full select-none object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Selecione um mapa
            </div>
          )}

          {selectedMap && (
            // o marcador vive na área desenhada da imagem, não na caixa do container
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${imageBox.left}%`,
                top: `${imageBox.top}%`,
                width: `${imageBox.width}%`,
                height: `${imageBox.height}%`,
              }}
            >
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-black"
                style={{ left: `${hotspotX}%`, top: `${hotspotY}%` }}
              >
                {hotspotLabel}
              </span>
            </div>
          )}
        </div>

        <input
          value={hotspotLabel}
          onChange={(event) => setHotspotLabel(event.target.value.slice(0, 3).toUpperCase())}
          className="mt-3 w-24 rounded-xl bg-slate-950 p-2 text-center outline-none ring-1 ring-slate-800 focus:ring-accent-500"
          placeholder="A"
          aria-label="Rótulo do hotspot"
        />
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="min-h-[110px] w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-accent-500"
        placeholder="Como executar, de onde jogar, referências visuais…"
        maxLength={2000}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-accent-400 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Publicar lineup'}
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl border border-rose-800/60 px-5 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-950/40 disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir lineup'}
          </button>
        )}
      </div>

      {status && <p className="text-sm text-emerald-400">{status}</p>}
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </form>
  );
}
