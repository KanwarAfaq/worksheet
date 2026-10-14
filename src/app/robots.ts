import type { MetadataRoute } from 'next';
import { siteOrigin, indexingEnabled } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/create/'] }],
    sitemap: siteOrigin() + '/sitemap.xml',
  };
}
