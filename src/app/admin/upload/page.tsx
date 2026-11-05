'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';

import { fetchAgents } from '@/services/supabase/agents';
import { fetchMaps } from '@/services/supabase/maps';
import { fetchAbilitiesByAgent } from '@/services/supabase/abilities';
import { createLineup } from '@/services/supabase/lineups';
import { useAdmin } from '@/hooks/useAdmin';
import { pointToPercentage } from '@/utils/video';

import type { Agent, Ability, MapData } from '@/types';

const difficultyOptions = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
];

const sideOptions = [
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defesa' },
];

export default function UploadPage() {
  const admin = useAdmin();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);

  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState('');
  const [mapId, setMapId] = useState('');
  const [abilityId, setAbilityId] = useState('');
  const [abilityName, setAbilityName] = useState('');

  const [difficulty, setDifficulty] = useState(difficultyOptions[0].value);
  const [side, setSide] = useState(sideOptions[0].value);

  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [hotspotLabel, setHotspotLabel] = useState('A');
  const [hotspotX, setHotspotX] = useState(50);
  const [hotspotY, setHotspotY] = useState(50);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const selectedMap = useMemo(
    () => maps.find((map) => map.id === mapId) ?? null,
    [maps, mapId],
  );

  const mapImage = selectedMap?.displayIcon || selectedMap?.splash || '';

  useEffect(() => {
    if (!admin.isAdmin) return;

    async function loadData() {
      try {
        const [agentData, mapData] = await Promise.all([fetchAgents(), fetchMaps()]);
        setAgents(agentData);
        setMaps(mapData.filter((item) => item.displayName !== 'Menu'));
      } catch {
        setError('Erro ao carregar agentes ou mapas.');
      }
    }

    loadData();
  }, [admin.isAdmin]);

  useEffect(() => {
    if (!agentId) {
      setAbilities([]);
      setAbilityId('');
      setAbilityName('');
      return;
    }

    async function loadAbilities() {
      try {
        const data = await fetchAbilitiesByAgent(agentId);
        setAbilities(data);

        if (!data.some((ability) => ability.id === abilityId)) {
          setAbilityId('');
          setAbilityName('');
        }
      } catch {
        setError('Erro ao carregar utilitários do agente.');
      }
    }

    loadAbilities();
  }, [agentId, abilityId]);

  const selectedAbility = useMemo(
    () => abilities.find((ability) => ability.id === abilityId) ?? null,
    [abilities, abilityId],
  );

  useEffect(() => {
    setAbilityName(selectedAbility?.displayName ?? '');
  }, [selectedAbility]);

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    const image = imgRef.current;
    if (!image) return;

    const point = pointToPercentage(event.clientX, event.clientY, image);
    if (!point) return;

    setHotspotX(point.x);
    setHotspotY(point.y);
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
      await createLineup(
        {
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
        },
        { status: 'approved' },
      );

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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao publicar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (admin.loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Verificando acesso...
      </main>
    );
  }

  if (!admin.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="text-sm text-slate-400">
            Esta área é exclusiva para administradores e moderadores.
          </p>
          <Link
            href="/admin"
            className="inline-block rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Ir para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Admin</p>
          <h1 className="mt-2 text-2xl font-semibold">Nova lineup</h1>
          <p className="mt-1 text-sm text-slate-400">
            Publicada como {admin.role === 'admin' ? 'administrador' : 'moderador'} • {admin.email}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
            placeholder="Título (ex.: Smoke A-site da base)"
            maxLength={120}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              value={agentId}
              onChange={(event) => setAgentId(event.target.value)}
              className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
            >
              <option value="">Agente</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.displayName}</option>
              ))}
            </select>

            <select
              value={mapId}
              onChange={(event) => setMapId(event.target.value)}
              className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
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
            className="w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
          >
            <option value="">Habilidade</option>
            {abilities.map((ability) => (
              <option key={ability.id} value={ability.id}>{ability.displayName}</option>
            ))}
          </select>

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={side}
              onChange={(event) => setSide(event.target.value)}
              className="rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
            >
              {sideOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <input
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            className="w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
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
                  className="pointer-events-none h-full w-full object-contain select-none"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Selecione um mapa
                </div>
              )}

              {selectedMap && (
                <span
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-black"
                  style={{ left: `${hotspotX}%`, top: `${hotspotY}%` }}
                >
                  {hotspotLabel}
                </span>
              )}
            </div>

            <input
              value={hotspotLabel}
              onChange={(event) => setHotspotLabel(event.target.value.slice(0, 3).toUpperCase())}
              className="mt-3 w-24 rounded-xl bg-slate-950 p-2 text-center outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
              placeholder="A"
              aria-label="Rótulo do hotspot"
            />
          </div>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[110px] w-full rounded-xl bg-slate-950 p-3 outline-none ring-1 ring-slate-800 focus:ring-cyan-500"
            placeholder="Como executar, de onde jogar, referências visuais…"
            maxLength={2000}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar lineup'}
          </button>

          {status && <p className="text-sm text-emerald-400">{status}</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>
      </section>
    </main>
  );
}
