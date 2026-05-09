export interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  role?: {
    displayName: string;
    displayIcon: string | null;
  } | null;
}
