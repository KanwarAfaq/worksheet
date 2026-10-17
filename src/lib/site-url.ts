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
  // Canonical public domain: all Vercel preview hosts point back to this.
  return 'https://worksheet.live';
}

const explicitFlag=process.env.ENABLE_SEARCH_INDEXING;
export const indexingEnabled=explicitFlag==='true'||
 (explicitFlag!== 'false'&&process.env.VERCEL_ENV==='production');
