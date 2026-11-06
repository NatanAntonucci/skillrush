import { supabase } from './client';

import type { Lineup, LineupStatus } from '@/types';

interface LineupFilters {
  agentId?: string;
  mapId?: string;
  difficulty?: string | null;
  side?: string | null;
  abilities?: string[];
  status?: LineupStatus | 'all';
  limit?: number;
}

export interface CreateLineupInput {
  title: string;
  agentId: string;
  mapId: string;
  abilityId: string;
  abilityName: string;
  description: string;
  videoUrl: string;
  difficulty: string;
  side: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
}

const LINEUP_SELECT = `
  *,
  agent:agents(*),
  map:maps(*),
  ability:abilities(*)
`;

function mapLineup(row: any): Lineup {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    difficulty: row.difficulty,
    side: row.side,
    status: row.status,
    authorId: row.author_id ?? null,
    createdAt: row.created_at ?? null,
    hotspot: {
      x: row.hotspot_x,
      y: row.hotspot_y,
      label: row.hotspot_label,
    },
    agentId: row.agent_id,
    mapId: row.map_id,
    abilityId: row.ability_id,
    abilityName: row.ability_name,
    agent: row.agent
      ? {
          id: row.agent.id,
          displayName: row.agent.display_name,
          displayIcon: row.agent.display_icon,
          description: row.agent.description,
          role: row.agent.role_display_name
            ? {
                displayName: row.agent.role_display_name,
                displayIcon: row.agent.role_display_icon,
              }
            : null,
        }
      : undefined,
    map: row.map
      ? {
          id: row.map.id,
          displayName: row.map.display_name,
          listViewIcon: row.map.list_view_icon,
          splash: row.map.splash,
          displayIcon: row.map.display_icon,
          isCompetitive: row.map.is_competitive,
        }
      : undefined,
    ability: row.ability
      ? {
          id: row.ability.id,
          agentId: row.ability.agent_id,
          slot: row.ability.slot,
          displayName: row.ability.display_name,
          displayIcon: row.ability.display_icon,
        }
      : undefined,
  };
}

export async function fetchLineups(filters?: LineupFilters) {
  let query = supabase.from('lineups').select(LINEUP_SELECT);

  const status = filters?.status ?? 'approved';
  if (status !== 'all') {
    query = query.eq('status', status);
  }

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
    query = query.in('ability_name', filters.abilities);
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters?.limit ?? 200);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Falha ao carregar lineups: ${error.message}`);
  }

  return (data || []).map(mapLineup);
}

/**
 * Cria uma lineup direto no Supabase, autenticado pela sessão do usuário.
 * A permissão é aplicada pelo RLS: admin/moderador insere `approved`,
 * usuário comum só consegue inserir `pending`.
 */
export async function createLineup(
  input: CreateLineupInput,
  options?: { status?: LineupStatus },
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const { data, error } = await supabase
    .from('lineups')
    .insert({
      title: input.title.trim(),
      agent_id: input.agentId,
      map_id: input.mapId,
      ability_id: input.abilityId,
      ability_name: input.abilityName,
      description: input.description.trim(),
      video_url: input.videoUrl.trim(),
      difficulty: input.difficulty,
      side: input.side,
      hotspot_x: input.hotspot.x,
      hotspot_y: input.hotspot.y,
      hotspot_label: input.hotspot.label,
      author_id: user.id,
      status: options?.status ?? 'pending',
    })
    .select(LINEUP_SELECT)
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar a lineup: ${error.message}`);
  }

  return mapLineup(data);
}

export async function deleteLineup(id: string) {
  const { error } = await supabase.from('lineups').delete().eq('id', id);

  if (error) {
    throw new Error(`Não foi possível excluir a lineup: ${error.message}`);
  }
}

export async function updateLineup(id: string, input: CreateLineupInput) {
  const { data, error } = await supabase
    .from('lineups')
    .update({
      title: input.title.trim(),
      agent_id: input.agentId,
      map_id: input.mapId,
      ability_id: input.abilityId,
      ability_name: input.abilityName,
      description: input.description.trim(),
      video_url: input.videoUrl.trim(),
      difficulty: input.difficulty,
      side: input.side,
      hotspot_x: input.hotspot.x,
      hotspot_y: input.hotspot.y,
      hotspot_label: input.hotspot.label,
    })
    .eq('id', id)
    .select(LINEUP_SELECT)
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar as alterações: ${error.message}`);
  }

  return mapLineup(data);
}

export async function fetchLineupById(id: string) {
  const { data, error } = await supabase
    .from('lineups')
    .select(LINEUP_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao carregar a lineup: ${error.message}`);
  }

  return data ? mapLineup(data) : null;
}
