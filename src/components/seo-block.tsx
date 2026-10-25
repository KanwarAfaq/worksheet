'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight} from 'lucide-react';
import {pageSeo,defaultSeo} from '@/lib/page-seo';
const hidden=/^\/(admin|account|contribute|create\/ai)(\/|$)/;
export default function SeoBlock(){
 const path=usePathname()||'/';
 if(hidden.test(path))return null;
 const seo=pageSeo[path.replace(/\/$/,'')||'/']||defaultSeo;
 return <aside className="container seo-block" aria-label="Related resources">
  <img src={seo.art} alt={seo.alt} width={520} height={path==='/'||seo.art.includes('worksheets')?420:320} loading="lazy" decoding="async"/>
  <div className="seo-block-copy">
   <h2>{seo.h2}</h2><p>{seo.note}</p>
   <div className="seo-block-links">
    {seo.related.map(r=><Link key={r.href} href={r.href}>{r.label}</Link>)}
    {seo.refs.map(r=><a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer">{r.label}<ArrowUpRight size={14}/></a>)}
   </div>
  </div>
 </aside>;
}
