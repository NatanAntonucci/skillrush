import type { Agent, MapData, Ability } from '@/types';

export interface Lineup {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  difficulty: string;
  side: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
  agentId: string;
  mapId: string;
  abilityId: string;
  abilityName: string;
  agent?: Agent;
  map?: MapData;
  ability?: Ability;
}
