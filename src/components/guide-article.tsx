import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {absoluteUrl,breadcrumbs,siteName} from '@/lib/seo';
import StructuredData from '@/components/structured-data';
import {guideBySlug,guides} from '@/lib/guides';

export function guideMetadata(slug:string){
 const g=guideBySlug(slug);
 return {title:g.title,description:g.description,alternates:{canonical:'/guides/'+slug}};
}
export default function GuideArticle({slug}:{slug:string}){
 const g=guideBySlug(slug);
 const path='/guides/'+slug;
 const others=guides.filter(x=>x.slug!==slug);
 return <div className="container inner-page seo-prose-page">
  <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:'Guides',url:'/guides/printing-worksheets'},{label:g.navLabel,url:path}])}/>
  <StructuredData value={{'@context':'https://schema.org','@type':'Article',headline:g.title,description:g.description,
   mainEntityOfPage:absoluteUrl(path),url:absoluteUrl(path),inLanguage:'en',isAccessibleForFree:true,
   author:{'@type':'Organization',name:siteName},publisher:{'@type':'Organization',name:siteName,url:absoluteUrl('/')}}}/>
  <StructuredData value={{'@context':'https://schema.org','@type':'FAQPage','@id':absoluteUrl(path+'#faq'),
   mainEntity:g.faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))}}/>
  <h1>{g.h1} <em>{g.h1em}</em></h1>
  <p className="page-lead">{g.lead}</p>
  {g.sections.map(s=><section key={s.h}>
   <h2>{s.h}</h2>
   {s.p.map((t,i)=><p key={i}>{t}</p>)}
   {s.list&&<ul>{s.list.map(li=><li key={li}>{li}</li>)}</ul>}
  </section>)}
  <h2>Worksheets and tools to try</h2>
  <ul>{g.links.map(l=><li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
  <h2>Frequently asked questions</h2>
  <div className="seo-faq-list">{g.faq.map(({q,a})=><section className="seo-faq-item" key={q}><h3>{q}</h3><p>{a}</p></section>)}</div>
  <h2>More guides</h2>
  <ul>{others.map(o=><li key={o.slug}><Link href={'/guides/'+o.slug}>{o.navLabel}</Link></li>)}
   <li><Link href="/guides/printing-worksheets">Printing guide</Link></li></ul>
  <div className="bottom-prompt">Want to make your own printable?<Link href="/create">Open worksheet makers <ArrowRight size={18}/></Link></div>
 </div>;
}
