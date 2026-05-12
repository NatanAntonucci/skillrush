import { supabaseAdmin } from '@/services/supabase/admin';
import { fetchAgents as fetchRemoteAgents, fetchMaps as fetchRemoteMaps } from '@/services/valorant-api/client';

const competitiveMapNames = new Set([
  'Ascent',
  'Bind',
  'Breeze',
  'Fracture',
  'Haven',
  'Icebox',
  'Lotus',
  'Pearl',
  'Split',
  'Sunset',
]);

export async function syncValorantMetadata() {
  const agentsResponse = await fetchRemoteAgents();
  const mapsResponse = await fetchRemoteMaps();

  const agentRows = agentsResponse.data.map((agent) => ({
    id: agent.uuid,
    display_name: agent.displayName,
    display_icon: agent.displayIcon,
    description: agent.description,
    role_display_name: agent.role?.displayName ?? null,
    role_display_icon: agent.role?.displayIcon ?? null,
  }));

  const abilityRows = agentsResponse.data.flatMap((agent) =>
    (agent.abilities || []).map((ability) => ({
      id: `${agent.uuid}-${ability.slot}`,
      agent_id: agent.uuid,
      slot: ability.slot,
      display_name: ability.displayName,
      display_icon: ability.displayIcon,
    })),
  );

  const mapRows = mapsResponse.data
    .filter((map) => map.displayName !== 'Menu')
    .map((map) => ({
      id: map.uuid,
      display_name: map.displayName,
      display_icon: map.displayIcon,
      list_view_icon: map.listViewIcon,
      splash: map.splash,
      is_competitive: competitiveMapNames.has(map.displayName),
    }));

  const upsertAgents = await supabaseAdmin.from('agents').upsert(agentRows, { onConflict: 'id' });
  if (upsertAgents.error) {
    throw new Error(`Failed to sync agents: ${upsertAgents.error.message}`);
  }

  const upsertAbilities = await supabaseAdmin.from('abilities').upsert(abilityRows, { onConflict: 'id' });
  if (upsertAbilities.error) {
    throw new Error(`Failed to sync abilities: ${upsertAbilities.error.message}`);
  }

  const upsertMaps = await supabaseAdmin.from('maps').upsert(mapRows, { onConflict: 'id' });
  if (upsertMaps.error) {
    throw new Error(`Failed to sync maps: ${upsertMaps.error.message}`);
  }

  return {
    agents: agentRows.length,
    abilities: abilityRows.length,
    maps: mapRows.length,
  };
}
