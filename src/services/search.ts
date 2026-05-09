/**
 * Generic search service supporting local and API-based search
 * Supports searching: News, Projects, Events, Training, Partners
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com/v1';

// Cache to avoid multiple requests
const searchCache = new Map<string, { timestamp: number; results: SearchResults }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface SearchResultItem {
  id: number;
  title: string;
  excerpt?: string;
  type: 'news' | 'project' | 'event' | 'training' | 'partner' | 'page';
  link?: string;
  image?: string;
  keywords?: string[];
}

export interface SearchResults {
  query: string;
  results: SearchResultItem[];
  total: number;
}

// ---------------------------------------------------------------------------
// Local fallback content - used when API is unavailable
// ---------------------------------------------------------------------------

const LOCAL_CONTENT: SearchResultItem[] = [
  {
    id: 1,
    type: 'page',
    title: 'About Us',
    excerpt: 'Learn about our organization, mission, and vision.',
    link: '#about',
    keywords: ['about', 'organization', 'who are we', 'information'],
  },
  {
    id: 2,
    type: 'page',
    title: 'Our History',
    excerpt: 'Explore the timeline and journey of our organization.',
    link: '#history',
    keywords: ['history', 'timeline', 'trajectory', 'journey'],
  },
  {
    id: 3,
    type: 'page',
    title: 'Mission & Values',
    excerpt: 'Discover our mission, vision, and core values.',
    link: '#mission',
    keywords: ['mission', 'vision', 'values', 'purpose', 'principles'],
  },
  {
    id: 4,
    type: 'page',
    title: 'Services',
    excerpt: 'Explore the services and programs we offer.',
    link: '#services',
    keywords: ['services', 'programs', 'offerings', 'capabilities'],
  },
  {
    id: 5,
    type: 'page',
    title: 'Transparency',
    excerpt: 'Access financial reports, documents, and accountability information.',
    link: '#transparency',
    keywords: ['transparency', 'reports', 'financial', 'accountability', 'documents'],
  },
  {
    id: 6,
    type: 'page',
    title: 'Documents',
    excerpt: 'Access our statutes, policies, and institutional documents.',
    link: '#documents',
    keywords: ['documents', 'statutes', 'policies', 'regulations'],
  },
  {
    id: 7,
    type: 'page',
    title: 'Integrity',
    excerpt: 'Learn about our integrity program and ethical guidelines.',
    link: '#integrity',
    keywords: ['integrity', 'ethics', 'code of conduct', 'compliance'],
  },
  {
    id: 8,
    type: 'page',
    title: 'Privacy Policy',
    excerpt: 'Information about data processing and privacy compliance.',
    link: '#privacy',
    keywords: ['privacy', 'data', 'gdpr', 'compliance', 'personal data'],
  },
  {
    id: 9,
    type: 'page',
    title: 'Team',
    excerpt: 'Meet our leadership team and organization structure.',
    link: '#team',
    keywords: ['team', 'leadership', 'staff', 'organization', 'executives'],
  },
  {
    id: 10,
    type: 'page',
    title: 'Impact',
    excerpt: 'See our impact metrics and achievement results.',
    link: '#impact',
    keywords: ['impact', 'results', 'metrics', 'achievements'],
  },
  {
    id: 11,
    type: 'page',
    title: 'News',
    excerpt: 'Stay updated with our latest news and announcements.',
    link: '#news',
    keywords: ['news', 'updates', 'announcements', 'publications'],
  },
  {
    id: 12,
    type: 'page',
    title: 'Events',
    excerpt: 'Discover upcoming events and activities.',
    link: '#events',
    keywords: ['events', 'activities', 'calendar', 'happenings'],
  },
  {
    id: 13,
    type: 'page',
    title: 'Contact',
    excerpt: 'Get in touch with us through multiple communication channels.',
    link: '#contact',
    keywords: ['contact', 'support', 'get in touch', 'information'],
  },
  {
    id: 14,
    type: 'page',
    title: 'Partnerships',
    excerpt: 'Learn about our partnerships and collaboration opportunities.',
    link: '#partnerships',
    keywords: ['partnerships', 'collaborations', 'partners', 'strategic alliances'],
  },
  {
    id: 15,
    type: 'page',
    title: 'Get Involved',
    excerpt: 'Discover ways to support and contribute to our mission.',
    link: '#collaborate',
    keywords: ['collaborate', 'support', 'donate', 'contribute', 'join'],
  },
];

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function searchLocalContent(query: string): SearchResultItem[] {
  const normalizedQuery = normalizeText(query.trim());
  if (normalizedQuery.length < 2) return [];

  type Scored = { item: SearchResultItem; score: number };
  const scored: Scored[] = [];

  for (const item of LOCAL_CONTENT) {
    let score = 0;

    const title = normalizeText(item.title);
    if (title.includes(normalizedQuery)) {
      score += 100;
    }

    const excerpt = item.excerpt ? normalizeText(item.excerpt) : '';
    if (excerpt.includes(normalizedQuery)) {
      score += 50;
    }

    if (item.keywords) {
      for (const keyword of item.keywords) {
        if (normalizeText(keyword).includes(normalizedQuery)) {
          score += 25;
        }
      }
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  return scored.sort((a, b) => b.score - a.score).map(s => s.item);
}

/**
 * Perform a search across local content and optionally API
 * Falls back to local content if API is unavailable or not configured
 */
export async function performSearch(query: string): Promise<SearchResults> {
  // Check cache
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  // Try to search locally first (always available)
  const localResults = searchLocalContent(query);

  const results: SearchResults = {
    query,
    results: localResults,
    total: localResults.length,
  };

  // Cache result
  searchCache.set(query, { timestamp: Date.now(), results });

  return results;
}

/**
 * Clear search cache (useful when content changes)
 */
export function clearSearchCache(): void {
  searchCache.clear();
}
