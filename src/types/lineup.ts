export interface Lineup {
  id: string;
  title: string;
  agentId: string;
  mapId: string;
  ability: string;
  description: string;
  videoUrl: string;
  hotspot: {
    x: number;
    y: number;
    label: string;
  };
}
