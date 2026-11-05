import type { Agent, MapData, Ability } from '@/types';

export type LineupStatus = 'approved' | 'pending' | 'rejected';

export interface Lineup {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  difficulty: string | null;
  side: string | null;
  status: LineupStatus;
  authorId: string | null;
  createdAt: string | null;
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
