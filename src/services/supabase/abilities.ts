import { supabase } from '@/services/supabase/client';
import type { Ability } from '@/types';

export async function fetchAbilitiesByAgent(agentId: string) {
  const { data, error } = await supabase
    .from('abilities')
    .select('id, agent_id, slot, display_name, display_icon')
    .eq('agent_id', agentId)
    .order('slot', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch abilities for agent ${agentId}: ${error.message}`);
  }

  return (data || []).map((ability: any) => ({
    id: ability.id,
    agentId: ability.agent_id,
    slot: ability.slot,
    displayName: ability.display_name,
    displayIcon: ability.display_icon,
  })) as Ability[];
}
