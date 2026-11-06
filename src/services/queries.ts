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

/** Todas as lineups publicadas — usado em sitemap e generateStaticParams. */
export async function getAllLineups(): Promise<Lineup[]> {
  return fetchLineups({ limit: 1000 });
}
