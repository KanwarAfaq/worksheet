
import Link from 'next/link';
import {ArrowUpRight,FileText} from 'lucide-react';
import type {Worksheet} from '@/lib/catalog';
export default function WorksheetCard({item}: {item:Worksheet}){
  return <article className="worksheet-card">
    <Link href={'/worksheets/'+item.slug} className={'sheet-cover '+item.accent} aria-label={'View '+item.title}>
      <div className="sheet-paper"><div className="paper-rule short"/><div className="paper-rule"/><span className="paper-illustration">{item.icon}</span><div className="paper-rule"/><div className="paper-rule short"/></div>
      <span className="cover-arrow"><ArrowUpRight size={17}/></span>
    </Link>
    <div className="sheet-meta"><span>{item.grade}</span><span>·</span><span>{item.category}</span></div>
    <Link href={'/worksheets/'+item.slug} className="sheet-title">{item.title}</Link>
    <div className="sheet-bottom"><span><FileText size={14}/> {item.pages} page sample</span><span className="tag-light">{item.subject==='math'?'Math':item.subject[0].toUpperCase()+item.subject.slice(1)}</span></div>
  </article>;
}
