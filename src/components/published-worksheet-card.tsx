import Link from 'next/link';
import {ArrowUpRight,FileText,Download,FilePenLine} from 'lucide-react';
import type {PublicWorksheet} from '@/lib/public-catalog';
import WorksheetActions from '@/components/worksheet-actions';
const labels:Record<string,string>={pdf:'PDF',png:'PNG',jpg:'JPG',webp:'WebP'};
export default function PublishedWorksheetCard({item}:{item:PublicWorksheet}){
 const cover=item.availableFormats.includes('pdf')?'pdf':item.availableFormats.find(f=>['png','jpg','webp'].includes(f));
 return <article className="resource-card">
   <Link href={'/worksheets/'+item.slug} className="resource-preview" aria-label={'View '+item.title}>
    <div className="resource-preview-inner">
      {cover==='pdf'?
       <iframe loading="lazy" title={'First page preview of '+item.title} aria-hidden="true"
        src={'/api/worksheets/'+item.id+'/preview?format=pdf#page='+(item.previewPage||1)+'&zoom=page-fit'}
        tabIndex={-1} className="pdf-page-preview"/>:
       cover?<img alt="" loading="lazy" src={'/api/worksheets/'+item.id+'/preview?format='+cover}/>:
       <div className="word-page-preview"><div className="word-preview-line"/><strong>{item.title}</strong>
        <p>{item.summary||'Worksheet learning activity'}</p><div className="word-preview-lines"/>
        <FilePenLine size={38}/></div>}
    </div>
    <span className="resource-page-badge">{cover==='pdf'?'PDF':cover?'IMAGE':'WORKSHEET'}</span>
   </Link>
   <div className="resource-card-copy">
    <div className="resource-byline"><span className="resource-avatar">W</span><span>Worksheet Studio Community</span></div>
    <Link className="resource-card-title" href={'/worksheets/'+item.slug}>{item.title}<ArrowUpRight size={16}/></Link>
    <p>{item.summary||'Print-ready learning activity.'}</p>
    <div className="resource-card-tags"><span>{item.categoryName}</span><span>{item.gradeName||'All grades'}</span></div>
   </div>
   <WorksheetActions id={item.id}/>
   <div className="resource-card-footer">
    <span>Free resource</span>
    <div>{item.availableFormats.filter(f=>['pdf','png','jpg','webp'].includes(f)).map(f=>
      <a key={f} href={'/api/worksheets/'+item.id+'/download?format='+f} aria-label={'Download '+labels[f]}
       className="resource-download"><Download size={14}/>{labels[f]}</a>)}
      <Link href={'/worksheets/'+item.slug} aria-label="Worksheet details"><FileText size={18}/></Link>
    </div>
   </div>
  </article>;
}
