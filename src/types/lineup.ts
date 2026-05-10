export interface Lineup {
  id: string;
  title: string;
  agentId: string;
  mapId: string;
  ability: string;
  description: string;
  videoUrl: string;
  difficulty?: string;
  side?: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
}
