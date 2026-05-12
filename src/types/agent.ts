import type { Ability } from './ability';

export interface Agent {
  id: string;

  displayName: string;

  displayIcon: string | null;

  description?: string;

  role?: {
    displayName: string;
    displayIcon: string | null;
  } | null;

  abilities?: Ability[];
}