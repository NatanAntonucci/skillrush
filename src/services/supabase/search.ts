import { supabase } from './client';
import { competitiveMaps } from '@/utils/maps';

interface SearchLineup {
  id: string;
  slug: string;
  title: string;
  abilityName: string | null;
  agent: { displayName: string } | null;
  map: { displayName: string } | null;
}

export async function fetchSearchCatalog(signal: AbortSignal) {
  const [agents, maps, lineups] = await Promise.all([
    supabase.from('agents').select('id,displayName:display_name')
      .order('display_name').abortSignal(signal),
    supabase.from('maps').select('id,displayName:display_name,isCompetitive:is_competitive')
      .eq('is_competitive', true).order('display_name').abortSignal(signal),
    supabase.from('lineups').select(
      'id,slug,title,abilityName:ability_name,agent:agents(displayName:display_name),map:maps(displayName:display_name)',
    ).eq('status', 'approved').order('created_at', { ascending: false }).limit(200)
      .abortSignal(signal).returns<SearchLineup[]>(),
  ]);
  if (agents.error) throw agents.error;
  if (maps.error) throw maps.error;
  if (lineups.error) throw lineups.error;
  return { agents: agents.data, maps: competitiveMaps(maps.data), lineups: lineups.data };
}
