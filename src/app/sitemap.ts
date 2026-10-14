
import type {MetadataRoute} from 'next';
import {samples,subjects} from '@/lib/catalog';
export default function sitemap():MetadataRoute.Sitemap{
const base=(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000').replace(/\/$/,'');
return ['/', '/worksheets','/create','/about','/privacy',...subjects.map(s=>'/'+s.slug),...Object.keys({'word-search':1,'word-scramble':1,'missing-letters':1}).map(x=>'/create/'+x)].map(path=>({url:base+path,changeFrequency:'monthly',priority:path==='/'?1:.6}));
}
// Catalog sample/detail pages are intentionally excluded until real approved downloads exist.
