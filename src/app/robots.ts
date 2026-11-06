import type { MetadataRoute } from 'next';

import { siteUrl } from '@/utils/site';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
