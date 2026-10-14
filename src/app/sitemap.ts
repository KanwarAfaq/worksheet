import type { MetadataRoute } from 'next';
import { subjects } from '@/lib/catalog';
import { siteOrigin, indexingEnabled } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  // Avoid indexing an unfinished library or sample worksheet detail pages.
  if (!indexingEnabled) return [];
  const origin = siteOrigin();
  const routes = ['/', '/worksheets', '/create', '/about', '/privacy',
    ...subjects.map(subject => '/' + subject.slug)];
  return routes.map(path => ({
    url: origin + path,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.6,
  }));
}
