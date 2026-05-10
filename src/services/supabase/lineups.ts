import { supabase } from './client';
import type { Lineup } from '@/types';

interface LineupFilters {
  agentId?: string;
  mapId?: string;
  difficulty?: string | null;
  side?: string | null;
  abilities?: string[];
  limit?: number;
}

interface CreateLineupPayload {
  title: string;
  agentId: string;
  mapId: string;
  ability: string;
  description: string;
  videoUrl: string;
  difficulty?: string;
  side?: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
}

export async function fetchLineups(filters?: LineupFilters) {
  let query = supabase.from('lineups').select('*');

  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }

  if (filters?.mapId) {
    query = query.eq('map_id', filters.mapId);
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters?.side) {
    query = query.eq('side', filters.side);
  }

  if (filters?.abilities?.length) {
    query = query.in('ability', filters.abilities);
  }

  query = query.order('created_at', { ascending: false }).limit(filters?.limit ?? 50);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch lineups: ${error.message}`);
  }

  return (data || []).map((lineup: any) => ({
    id: lineup.id,
    title: lineup.title,
    agentId: lineup.agent_id,
    mapId: lineup.map_id,
    ability: lineup.ability,
    description: lineup.description,
    videoUrl: lineup.video_url,
    difficulty: lineup.difficulty ?? null,
    side: lineup.side ?? null,
    hotspot: {
      x: lineup.hotspot_x,
      y: lineup.hotspot_y,
      label: lineup.hotspot_label,
    },
  })) as Lineup[];
}

export async function createLineup(payload: CreateLineupPayload) {
  const { data, error } = await supabase.from('lineups').insert([
    {
      title: payload.title,
      agent_id: payload.agentId,
      map_id: payload.mapId,
      ability: payload.ability,
      description: payload.description,
      video_url: payload.videoUrl,
      difficulty: payload.difficulty,
      side: payload.side,
      hotspot_x: payload.hotspot.x,
      hotspot_y: payload.hotspot.y,
      hotspot_label: payload.hotspot.label,
    },
  ]);

  if (error) {
    throw new Error(`Failed to create lineup: ${error.message}`);
  }

  return data?.[0] as any;
}

export async function fetchLineupById(id: string) {
  const { data, error } = await supabase.from('lineups').select('*').eq('id', id).single();

  if (error) {
    throw new Error(`Failed to fetch lineup: ${error.message}`);
  }

  return {
    id: data.id,
    title: data.title,
    agentId: data.agent_id,
    mapId: data.map_id,
    ability: data.ability,
    description: data.description,
    videoUrl: data.video_url,
    difficulty: data.difficulty ?? null,
    side: data.side ?? null,
    hotspot: {
      x: data.hotspot_x,
      y: data.hotspot_y,
      label: data.hotspot_label,
    },
  } as Lineup;
}
