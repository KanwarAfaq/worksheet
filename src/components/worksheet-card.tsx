import Link from 'next/link';
import {ArrowUpRight,FileText} from 'lucide-react';
import type {Worksheet} from '@/lib/catalog';
export default function WorksheetCard({item}:{item:Worksheet}){
 return <article className="resource-card sample-resource-card">
   <Link href={'/worksheets/'+item.slug} className={'resource-preview sample-preview '+item.accent} aria-label={'View '+item.title}>
    <div className="sample-sheet-page">
      <div className="sample-page-heading">{item.title}</div>
      <div className="sample-page-lines"><i/><i/><i/></div>
      <div className="sample-page-art">{item.icon}</div>
      <div className="sample-page-lines"><i/><i/><i/></div>
    </div><span className="resource-page-badge">EXAMPLE</span>
   </Link>
   <div className="resource-card-copy">
    <div className="resource-byline"><span className="resource-avatar">W</span><span>Worksheet Studio</span></div>
    <Link className="resource-card-title" href={'/worksheets/'+item.slug}>{item.title}<ArrowUpRight size={16}/></Link>
    <p>{item.description}</p>
    <div className="resource-card-tags"><span>{item.category}</span><span>{item.grade}</span></div>
   </div>
   <div className="resource-card-footer"><span>Example — not downloadable</span><Link href={'/worksheets/'+item.slug}>Details <ArrowUpRight size={14}/></Link></div>
  </article>;
}
