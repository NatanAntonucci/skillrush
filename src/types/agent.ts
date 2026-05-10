export interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  description?: string;
  role?: {
    displayName: string;
    displayIcon: string | null;
  } | null;
  abilities?: Array<{
    slot: string;
    displayName: string;
    displayIcon: string | null;
  }>;
}
