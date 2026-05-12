'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/services/supabase/client';
import { fetchAgents } from '@/services/supabase/agents';
import { fetchMaps } from '@/services/supabase/maps';
import { fetchAbilitiesByAgent } from '@/services/supabase/abilities';

import type { Agent, Ability, MapData } from '@/types';

const difficultyOptions = ['easy', 'medium', 'hard'];
const sideOptions = ['attack', 'defense'];
const uploadEnabled = process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'false';

export default function UploadPage() {
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = useState(true);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [maps, setMaps] = useState<MapData[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);

  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState('');
  const [mapId, setMapId] = useState('');
  const [abilityId, setAbilityId] = useState('');
  const [abilityName, setAbilityName] = useState('');

  const [difficulty, setDifficulty] = useState(difficultyOptions[0]);
  const [side, setSide] = useState(sideOptions[0]);

  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [hotspotLabel, setHotspotLabel] = useState('A');
  const [hotspotX, setHotspotX] = useState(50);
  const [hotspotY, setHotspotY] = useState(50);

  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMap = useMemo(
    () => maps.find((map) => map.id === mapId) ?? null,
    [maps, mapId],
  );

  const mapImage =
    selectedMap?.displayIcon ||
    selectedMap?.splash ||
    '';

  // 🔐 AUTH GUARD (ESSENCIAL)
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push('/admin/login');
        return;
      }

      setLoadingAuth(false);
    };

    checkAuth();
  }, [router]);

  // LOAD INITIAL DATA
  useEffect(() => {
    async function loadData() {
      try {
        const [agentData, mapData] = await Promise.all([
          fetchAgents(),
          fetchMaps(),
        ]);

        setAgents(agentData);
        setMaps(mapData.filter((item) => item.displayName !== 'Menu'));
      } catch {
        setStatus('Erro ao carregar agentes ou mapas.');
      }
    }

    loadData();
  }, []);

  // LOAD ABILITIES
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
        setStatus('Erro ao carregar utilitários do agente.');
      }
    }

    loadAbilities();
  }, [agentId, abilityId]);

  const selectedAbility = useMemo(
    () => abilities.find((a) => a.id === abilityId) ?? null,
    [abilities, abilityId],
  );

  useEffect(() => {
    setAbilityName(selectedAbility?.displayName ?? '');
  }, [selectedAbility]);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMapClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Prefer to compute relative to the displayed image box (handles letterboxing from object-contain)
    const imgEl = imgRef.current;
    if (imgEl) {
      const imgRect = imgEl.getBoundingClientRect();

      const x = Math.round(((event.clientX - imgRect.left) / imgRect.width) * 100);
      const y = Math.round(((event.clientY - imgRect.top) / imgRect.height) * 100);

      setHotspotX(Math.min(100, Math.max(0, x)));
      setHotspotY(Math.min(100, Math.max(0, y)));
      return;
    }

    // Fallback to container if image not available
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);

    setHotspotX(Math.min(100, Math.max(0, x)));
    setHotspotY(Math.min(100, Math.max(0, y)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    if (!uploadEnabled) {
      setStatus('Upload desativado.');
      setIsSubmitting(false);
      return;
    }

    if (!title || !agentId || !mapId || !abilityId || !description || !videoUrl) {
      setStatus('Preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setStatus('Sessão expirada. Faça login novamente.');
        setIsSubmitting(false);
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/lineups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          agentId,
          mapId,
          abilityId,
          abilityName,
          description,
          videoUrl,
          difficulty,
          side,
          hotspot: {
            x: hotspotX,
            y: hotspotY,
            label: hotspotLabel,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar lineup');
      }

      setStatus('Lineup enviada com sucesso!');

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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao enviar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔐 LOADING AUTH
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Verificando acesso...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-10">

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
        >

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-slate-950 rounded-xl"
            placeholder="Título"
          />

          <div className="grid grid-cols-2 gap-4">
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="p-3 bg-slate-950 rounded-xl">
              <option value="">Agente</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.displayName}</option>
              ))}
            </select>

            <select value={mapId} onChange={(e) => setMapId(e.target.value)} className="p-3 bg-slate-950 rounded-xl">
              <option value="">Mapa</option>
              {maps.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
          </div>

          <select value={abilityId} onChange={(e) => setAbilityId(e.target.value)} className="w-full p-3 bg-slate-950 rounded-xl">
            <option value="">Habilidade</option>
            {abilities.map((a) => (
              <option key={a.id} value={a.id}>{a.displayName}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="p-3 bg-slate-950 rounded-xl">
              {difficultyOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select value={side} onChange={(e) => setSide(e.target.value)} className="p-3 bg-slate-950 rounded-xl">
              {sideOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-3 bg-slate-950 rounded-xl"
            placeholder="YouTube URL"
          />

          <div className="relative rounded-xl overflow-hidden border border-slate-800" style={{ aspectRatio: '16 / 9' }}>
            {mapImage ? (
              <img ref={imgRef} src={mapImage} className="h-full w-full object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full">
                Selecione um mapa
              </div>
            )}

            <button
              type="button"
              onClick={handleMapClick}
              className="absolute inset-0"
            />

            {selectedMap && (
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 bg-cyan-500 px-3 py-1 rounded-full text-black text-xs"
                style={{ left: `${hotspotX}%`, top: `${hotspotY}%` }}
              >
                {hotspotLabel}
              </span>
            )}
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-950 rounded-xl"
            placeholder="Descrição"
          />

          <button
            disabled={isSubmitting}
            className="bg-cyan-500 text-black px-6 py-3 rounded-xl"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>

          {status && <p className="text-sm text-slate-300">{status}</p>}

        </form>

      </section>
    </main>
  );
}