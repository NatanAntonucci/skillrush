import type { Agent } from './agent';
import type { MapData } from './map';
import type { Ability } from './ability';

export interface Lineup {
  id: string;

  title: string;

  description: string;

  videoUrl: string;

  imageUrl?: string;

  difficulty?: string;

  side?: string;

  hotspot: {
    x: number;
    y: number;
    label: string;
  };

  agentId: string;

  mapId: string;

  abilityId?: string;

  abilityName?: string;

  agent?: Agent;

  map?: MapData;

  ability?: Ability;
}