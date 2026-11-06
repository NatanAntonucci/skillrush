import type { MetadataRoute } from 'next';

import { getAllLineups, getAgents, getCompetitiveMaps } from '@/services/queries';
import { slugify } from '@/utils/slug';
import { siteUrl } from '@/utils/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [maps, agents, lineups] = await Promise.all([
    getCompetitiveMaps(),
    getAgents(),
    getAllLineups(),
  ]);

  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/maps`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/agents`, changeFrequency: 'monthly', priority: 0.8 },
    ...maps.map((map) => ({
      url: `${base}/maps/${slugify(map.displayName)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...agents.map((agent) => ({
      url: `${base}/agents/${slugify(agent.displayName)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...lineups.map((lineup) => ({
      url: `${base}/lineups/${lineup.slug}`,
      lastModified: lineup.createdAt ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  ];
}
