const BASE_URL = 'https://valorant-api.com/v1';

async function valorantFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Valorant API request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchAgents() {
  return valorantFetch<{ data: Array<{
    uuid: string;
    displayName: string;
    displayIcon: string | null;
    description: string;
    role: { displayName: string; displayIcon: string | null } | null;
    abilities: Array<{
      slot: string;
      displayName: string;
      displayIcon: string | null;
    }>;
  }> }>('/agents?isPlayableCharacter=true');
}

export async function fetchMaps() {
  return valorantFetch<{ data: Array<{
    uuid: string;
    displayName: string;
    displayIcon: string | null;
    listViewIcon: string | null;
    splash: string | null;
  }> }>('/maps');
}
