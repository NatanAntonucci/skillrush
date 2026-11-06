#!/usr/bin/env node
/**
 * Sincroniza agentes, habilidades e mapas da API pública do Valorant com o Supabase.
 *
 * Uso:  npm run sync
 *
 * Requer no .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (nunca vai para o cliente)
 *
 * Este script roda fora do site (máquina local ou GitHub Action). Ele não é
 * importado por nenhum componente — a service role key não entra no bundle.
 */

import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://valorant-api.com/v1';

// Mapas do modo competitivo. Usado apenas como valor inicial: se o mapa já
// existir no banco, a flag atual é preservada (permite curadoria manual).
const COMPETITIVE_MAPS = new Set([
  'Ascent',
  'Bind',
  'Breeze',
  'Corrode',
  'Fracture',
  'Haven',
  'Icebox',
  'Lotus',
  'Pearl',
  'Split',
  'Sunset',
  'Abyss',
  'Summit',
]);

function loadEnv() {
  if (existsSync('.env.local')) {
    const content = readFileSync('.env.local', 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (!process.env[key]) {
        process.env[key] = rawValue.replace(/^["']|["']$/g, '');
      }
    }
  }
}

async function valorantFetch(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`valorant-api ${path} respondeu ${response.status}`);
  }
  return response.json();
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Buscando metadata do Valorant…');
  const [agentsResponse, agentsPtResponse, mapsResponse] = await Promise.all([
    valorantFetch('/agents?isPlayableCharacter=true'),
    valorantFetch('/agents?language=pt-BR&isPlayableCharacter=true'),
    valorantFetch('/maps'),
  ]);

  // Textos em pt-BR (a API já entrega traduzido). Nomes de agente e de mapa são
  // iguais em pt-BR; o que muda mesmo são habilidades e descrições.
  const ptByUuid = new Map((agentsPtResponse.data ?? []).map((agent) => [agent.uuid, agent]));

  const ptAbilityNames = new Map();
  for (const agent of agentsPtResponse.data ?? []) {
    for (const ability of agent.abilities ?? []) {
      ptAbilityNames.set(`${agent.uuid}-${ability.slot}`, ability.displayName);
    }
  }

  const agentRows = agentsResponse.data.map((agent) => ({
    id: agent.uuid,
    display_name: agent.displayName,
    display_icon: agent.displayIcon,
    description: ptByUuid.get(agent.uuid)?.description ?? agent.description,
    role_display_name: agent.role?.displayName ?? null,
    role_display_icon: agent.role?.displayIcon ?? null,
  }));

  const abilityRows = agentsResponse.data.flatMap((agent) =>
    (agent.abilities ?? []).map((ability) => ({
      id: `${agent.uuid}-${ability.slot}`,
      agent_id: agent.uuid,
      slot: ability.slot,
      display_name: ptAbilityNames.get(`${agent.uuid}-${ability.slot}`) ?? ability.displayName,
      display_icon: ability.displayIcon,
    })),
  );

  // snapshot do que já existe, para relatar novidades no final
  const [{ data: existingAgents }, { data: existingAbilities, error: existingAbilitiesError }, { data: existingMaps, error: existingMapsError }] =
    await Promise.all([
      supabase.from('agents').select('id'),
      supabase.from('abilities').select('id'),
      supabase.from('maps').select('id, is_competitive'),
    ]);

  if (existingMapsError) {
    throw new Error(`Falha ao ler mapas existentes: ${existingMapsError.message}`);
  }

  if (existingAbilitiesError) {
    throw new Error(`Falha ao ler habilidades existentes: ${existingAbilitiesError.message}`);
  }

  const knownAgentIds = new Set((existingAgents ?? []).map((row) => row.id));
  const knownAbilityIds = new Set((existingAbilities ?? []).map((row) => row.id));
  const knownMapIds = new Set((existingMaps ?? []).map((row) => row.id));

  const competitiveById = new Map((existingMaps ?? []).map((map) => [map.id, map.is_competitive]));

  const mapRows = mapsResponse.data
    .filter((map) => map.displayName !== 'Menu')
    .map((map) => ({
      id: map.uuid,
      display_name: map.displayName,
      display_icon: map.displayIcon,
      list_view_icon: map.listViewIcon,
      splash: map.splash,
      tactical_description: map.tacticalDescription ?? null,
      is_competitive:
        competitiveById.get(map.uuid) ?? COMPETITIVE_MAPS.has(map.displayName),
    }));

  for (const [table, rows] of [
    ['agents', agentRows],
    ['abilities', abilityRows],
    ['maps', mapRows],
  ]) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) {
      throw new Error(`Falha ao sincronizar ${table}: ${error.message}`);
    }
    console.log(`  ${table}: ${rows.length} registros`);
  }

  const newAgents = agentRows.filter((row) => !knownAgentIds.has(row.id));
  const newAbilities = abilityRows.filter((row) => !knownAbilityIds.has(row.id));
  const newMaps = mapRows.filter((row) => !knownMapIds.has(row.id));

  console.log('\nResumo:');
  console.log(`  agentes: ${agentRows.length}${newAgents.length ? ` (novos: ${newAgents.map((row) => row.display_name).join(', ')})` : ''}`);
  console.log(`  habilidades: ${abilityRows.length}${newAbilities.length ? ` (novas: ${newAbilities.length})` : ''}`);
  console.log(`  mapas: ${mapRows.length}${newMaps.length ? ` (novos: ${newMaps.map((row) => row.display_name).join(', ')})` : ''}`);

  const mapsWithoutCuration = newMaps.filter((row) => !COMPETITIVE_MAPS.has(row.display_name) && !competitiveById.has(row.id));

  if (mapsWithoutCuration.length > 0) {
    console.log('\n⚠ Mapas novos sem curadoria de competitividade:');
    console.log(`   ${mapsWithoutCuration.map((row) => row.display_name).join(', ')}`);
    console.log('   Ajuste em maps.is_competitive (ver docs/BANCO.md).');
  }

  console.log('\nSync concluído.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
