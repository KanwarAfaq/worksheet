import Link from 'next/link';
import {ArrowUpRight,BookOpen,Download} from 'lucide-react';
import type {PublicWorksheet} from '@/lib/public-catalog';
const labels:Record<string,string>={pdf:'PDF',docx:'Word',pptx:'PPT',png:'PNG',jpg:'JPG',webp:'WebP'};
export default function PublishedWorksheetCard({item}:{item:PublicWorksheet}){
 return <article className="published-worksheet-card">
  <Link className="published-worksheet-art" href={'/worksheets/'+item.slug} aria-label={'View '+item.title}>
    <BookOpen size={42} strokeWidth={1.6}/><span className="published-worksheet-tag">READY TO PRINT</span>
  </Link>
  <div className="published-worksheet-info">
   <div className="sheet-meta"><span>{item.gradeName||'All grades'}</span><span>·</span><span>{item.categoryName}</span></div>
   <Link href={'/worksheets/'+item.slug} className="sheet-title">{item.title}<ArrowUpRight size={16}/></Link>
   <p>{item.summary||'Verified printable worksheet for independent and classroom learning.'}</p>
   <div className="published-formats">{item.availableFormats.map(format=><a href={'/api/worksheets/'+item.id+'/download?format='+format}
    key={format} className="download-format-link" aria-label={'Download '+item.title+' as '+labels[format]}>
    <Download size={14}/>{labels[format]}</a>)}</div>
  </div>
 </article>;
}
