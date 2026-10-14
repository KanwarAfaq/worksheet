/**
 * Canonical site origin. Prefer an explicit production URL, then the current
 * Vercel production hostname, and finally the initial preview hostname.
 * Set NEXT_PUBLIC_SITE_URL to the purchased custom domain at launch.
 */
export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      const url = new URL(explicit);
      if (url.protocol === 'https:' || url.hostname === 'localhost') return url.origin;
    } catch { /* Invalid URL: use the deployment hostname instead. */ }
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return 'https://' + vercel.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return 'https://worksheet-tau-six.vercel.app';
}

export const indexingEnabled = process.env.ENABLE_SEARCH_INDEXING === 'true';
