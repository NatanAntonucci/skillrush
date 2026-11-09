import { supabase } from '@/services/supabase/client';
import { fetchAgents } from '@/services/supabase/agents';
import { fetchLineupBySlug, fetchLineups } from '@/services/supabase/lineups';
import { fetchMaps } from '@/services/supabase/maps';
import { competitiveMaps } from '@/utils/maps';
import { slugify } from '@/utils/slug';

import type { Agent, Lineup, MapData } from '@/types';

/** Mapas competitivos (fonte: `maps.is_competitive`). */
export async function getCompetitiveMaps(): Promise<MapData[]> {
  const maps = await fetchMaps();
  return competitiveMaps(maps);
}

export async function getMapBySlug(slug: string): Promise<MapData | null> {
  const maps = await getCompetitiveMaps();
  return maps.find((map) => slugify(map.displayName) === slug) ?? null;
}

export async function getAgents(): Promise<Agent[]> {
  const agents = await fetchAgents();
  return agents.sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const agents = await getAgents();
  return agents.find((agent) => slugify(agent.displayName) === slug) ?? null;
}

export async function getLineupsByMap(mapId: string): Promise<Lineup[]> {
  return fetchLineups({ mapId, limit: 500 });
}

export async function getLineupsByMapAndAgent(mapId: string, agentId: string): Promise<Lineup[]> {
  return fetchLineups({ mapId, agentId, limit: 500 });
}

export async function getLineupsByAgent(agentId: string): Promise<Lineup[]> {
  return fetchLineups({ agentId, limit: 500 });
}

export async function getLineupBySlug(slug: string): Promise<Lineup | null> {
  return fetchLineupBySlug(slug);
}

interface LineupIndexEntry {
  mapId: string;
  slug: string;
  createdAt: string | null;
  map: { displayName: string } | null;
  agent: { displayName: string } | null;
}

/** Só os campos usados nas rotas públicas, contagens e sitemap. */
export async function getLineupIndex() {
  const { data, error } = await supabase.from('lineups')
    .select('mapId:map_id,slug,createdAt:created_at,map:maps(displayName:display_name),agent:agents(displayName:display_name)')
    .eq('status', 'approved').order('created_at', { ascending: false }).limit(1000)
    .returns<LineupIndexEntry[]>();
  if (error) throw new Error(`Falha ao carregar índice de lineups: ${error.message}`);
  return data;
}

export async function getMapLineupCounts() {
  const counts = new Map<string, number>();
  for (const lineup of await getLineupIndex()) {
    counts.set(lineup.mapId, (counts.get(lineup.mapId) ?? 0) + 1);
  }
  return counts;
}
