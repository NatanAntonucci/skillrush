export interface MapData {
  id: string;

  displayName: string;

  displayIcon: string | null;

  listViewIcon: string | null;

  splash: string | null;

  tacticalDescription?: string | null;

  isCompetitive?: boolean;
}