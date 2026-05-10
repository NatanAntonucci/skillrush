'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { fetchAgents, fetchMaps } from '@/services/valorant-api/client';
import type { Agent, MapData } from '@/types';

const difficultyOptions = ['Fácil', 'Médio', 'Difícil'];
const sideOptions = ['Ataque', 'Defesa'];
const uploadEnabled = process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'false';

export default function UploadPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState('');
  const [mapId, setMapId] = useState('');
  const [ability, setAbility] = useState('');
  const [difficulty, setDifficulty] = useState(difficultyOptions[0]);
  const [side, setSide] = useState(sideOptions[0]);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [hotspotLabel, setHotspotLabel] = useState('A');
  const [hotspotX, setHotspotX] = useState(50);
  const [hotspotY, setHotspotY] = useState(50);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAgent = agents.find(a => a.uuid === agentId);
  const agentAbilities = selectedAgent?.abilities?.map(a => a.displayName) || [];

  useEffect(() => {
    async function loadData() {
      try {
        const [agentResponse, mapResponse] = await Promise.all([fetchAgents(), fetchMaps()]);
        setAgents(agentResponse.data);
        setMaps(mapResponse.data.filter((item) => item.displayName !== 'Menu'));
      } catch (error) {
        setStatus('Erro ao carregar agentes ou mapas.');
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    if (!uploadEnabled) {
      setStatus('Envio de lineups está temporariamente desativado.');
      setIsSubmitting(false);
      return;
    }

    if (!title || !agentId || !mapId || !ability || !description || !videoUrl) {
      setStatus('Preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { createLineup } = await import('@/services/supabase/lineups');

      await createLineup({
        title,
        agentId,
        mapId,
        ability,
        description,
        videoUrl,
        difficulty,
        side,
        hotspot: {
          x: hotspotX,
          y: hotspotY,
          label: hotspotLabel,
        },
      });

      setStatus('Lineup enviada com sucesso! Atualize a página principal para ver a nova lineup.');
      setTitle('');
      setAbility('');
      setDescription('');
      setVideoUrl('');
      setHotspotLabel('A');
      setHotspotX(50);
      setHotspotY(50);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao enviar a lineup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Upload de lineup</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Adicione uma jogada à base de lineups</h1>
          <p className="max-w-3xl text-slate-400">
            Use um link do YouTube para o vídeo da lineup. Pode ser `https://www.youtube.com/watch?v=...` ou `https://youtu.be/...`.
          </p>
        </div>

        {uploadEnabled ? (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Título</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Nome da lineup"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Agente</span>
              <select
                value={agentId}
                onChange={(event) => setAgentId(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Selecione um agente</option>
                {agents.map((agent) => (
                  <option key={agent.uuid} value={agent.uuid}>{agent.displayName}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Mapa</span>
              <select
                value={mapId}
                onChange={(event) => setMapId(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Selecione um mapa</option>
                {maps.map((map) => (
                  <option key={map.uuid} value={map.uuid}>{map.displayName}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Habilidade</span>
              <select
                value={ability}
                onChange={(event) => setAbility(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                disabled={!agentId}
              >
                <option value="">Selecione uma habilidade</option>
                {agentAbilities.map((abil) => (
                  <option key={abil} value={abil}>{abil}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Dificuldade</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Lado</span>
              <select
                value={side}
                onChange={(event) => setSide(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                {sideOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Link do vídeo</span>
              <input
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Hotspot</span>
              <input
                value={hotspotLabel}
                onChange={(event) => setHotspotLabel(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="A, B, C..."
              />
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Hotspot X (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={hotspotX}
                onChange={(event) => setHotspotX(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Hotspot Y (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={hotspotY}
                onChange={(event) => setHotspotY(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            <span>Descrição</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              placeholder="Explique a jogada, utilitário e posicionamento."
            />
          </label>

          {status && (
            <div className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-200">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar lineup'}
          </button>
        </form>
      ) : (
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300 shadow-xl shadow-slate-950/40">
          <p className="text-lg font-semibold text-white">Upload protegido</p>
          <p className="mt-3 text-slate-400">
            O sistema de envio de lineups está temporariamente disponível apenas para administradores.
            Quando for a hora, podemos ativar esse acesso por um controle de roles/admin.
          </p>
        </div>
      )}
      </section>
    </main>
  );
}
