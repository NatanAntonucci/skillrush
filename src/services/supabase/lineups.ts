import { supabase } from './client';
import type { Lineup } from '@/types';

export async function fetchLineups(filters?: { agentId?: string; mapId?: string }) {
  let query = supabase.from('lineups').select('*');

  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }

  if (filters?.mapId) {
    query = query.eq('map_id', filters.mapId);
  }

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
    hotspot: {
      x: lineup.hotspot_x,
      y: lineup.hotspot_y,
      label: lineup.hotspot_label,
    },
  })) as Lineup[];
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
    hotspot: {
      x: data.hotspot_x,
      y: data.hotspot_y,
      label: data.hotspot_label,
    },
  } as Lineup;
}
