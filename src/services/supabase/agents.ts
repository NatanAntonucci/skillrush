import { supabase } from '@/services/supabase/client';
import type { Agent } from '@/types';

export async function fetchAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select(`
      id,
      display_name,
      display_icon,
      description,
      role_display_name,
      role_display_icon,
      abilities (
        id,
        agent_id,
        slot,
        display_name,
        display_icon
      )
    `)
    .order('display_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return (data || []).map((agent: any) => ({
    id: agent.id,

    displayName: agent.display_name,

    displayIcon: agent.display_icon,

    description: agent.description,

    role: agent.role_display_name
      ? {
          displayName: agent.role_display_name,
          displayIcon: agent.role_display_icon,
        }
      : null,

    abilities: Array.isArray(agent.abilities)
      ? agent.abilities.map((ability: any) => ({
          id: ability.id,
          agentId: ability.agent_id,
          slot: ability.slot,
          displayName: ability.display_name,
          displayIcon: ability.display_icon,
        }))
      : [],
  })) as Agent[];
}