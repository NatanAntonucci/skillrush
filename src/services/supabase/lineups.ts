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
  abilityId: string;
  abilityName: string;
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
  let query = supabase
    .from('lineups')
    .select(`
      *,
      agent:agents(*),
      map:maps(*),
      ability:abilities(*)
    `);

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
    query = query.in('ability_id', filters.abilities);
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters?.limit ?? 50);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch lineups: ${error.message}`);
  }

  return (data || []).map((lineup: any) => ({
    id: lineup.id,

    title: lineup.title,

    description: lineup.description,

    videoUrl: lineup.video_url,

    difficulty: lineup.difficulty,

    side: lineup.side,

    hotspot: {
      x: lineup.hotspot_x,
      y: lineup.hotspot_y,
      label: lineup.hotspot_label,
    },

    agentId: lineup.agent_id,

    mapId: lineup.map_id,

    abilityId: lineup.ability_id,

    abilityName: lineup.ability_name,

    agent: lineup.agent
      ? {
          id: lineup.agent.id,
          displayName: lineup.agent.display_name,
          displayIcon: lineup.agent.display_icon,
          description: lineup.agent.description,
        }
      : undefined,

    map: lineup.map
      ? {
          id: lineup.map.id,
          displayName: lineup.map.display_name,
          listViewIcon: lineup.map.list_view_icon,
          splash: lineup.map.splash,
        }
      : undefined,

    ability: lineup.ability
      ? {
          id: lineup.ability.id,
          agentId: lineup.ability.agent_id,
          slot: lineup.ability.slot,
          displayName: lineup.ability.display_name,
          displayIcon: lineup.ability.display_icon,
        }
      : undefined,
  })) as Lineup[];
}

export async function createLineup(payload: CreateLineupPayload) {
  const { data, error } = await supabase
    .from('lineups')
    .insert([
      {
        title: payload.title,
        agent_id: payload.agentId,
        map_id: payload.mapId,
        ability_id: payload.abilityId,
        ability_name: payload.abilityName,
        description: payload.description,
        video_url: payload.videoUrl,
        difficulty: payload.difficulty,
        side: payload.side,
        hotspot_x: payload.hotspot.x,
        hotspot_y: payload.hotspot.y,
        hotspot_label: payload.hotspot.label,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lineup: ${error.message}`);
  }

  return data;
}

export async function fetchLineupById(id: string) {
  const { data, error } = await supabase
    .from('lineups')
    .select(`
      *,
      agent:agents(*),
      map:maps(*),
      ability:abilities(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch lineup: ${error.message}`);
  }

  return data;
}