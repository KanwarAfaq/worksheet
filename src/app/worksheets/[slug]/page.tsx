
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,FileText,ShieldCheck} from 'lucide-react';
import {samples} from '@/lib/catalog';
import {publishedWorksheets} from '@/lib/public-catalog';
import {Download,Eye,Printer,BookOpen} from 'lucide-react';
export const dynamic='force-dynamic';
export default async function WorksheetDetail({params}:{params:Promise<{slug:string}>}){
const {slug}=await params;
const published=(await publishedWorksheets()).find(item=>item.slug===slug);
if(published)return <div className="container inner-page detail-page">
  <Link href="/worksheets" className="back-link"><ArrowLeft size={16}/> Back to library</Link>
  <div className="detail-grid">
   <div className="detail-preview mint"><div className="detail-paper"><div className="paper-rule short"/><h2>{published.title}</h2><p>{published.summary||'Ready-to-print practice'}</p><div className="detail-symbol"><BookOpen size={76}/></div><div className="paper-rule"/><div className="paper-rule short"/></div></div>
   <div className="detail-copy">
    <div className="section-kicker">{published.categoryName.toUpperCase()} · VERIFIED WORKSHEET</div>
    <h1>{published.title}</h1>
    <p className="page-lead">{published.description||published.summary||'A printable learning activity for students.'}</p>
    <div className="detail-facts"><span><strong>Grade</strong>{published.gradeName||'All grades'}</span><span><strong>File formats</strong>{published.availableFormats.map(x=>x.toUpperCase()).join(', ')}</span></div>
    <div className="published-detail-actions">
     {published.availableFormats.map(format=><a key={format} className="button button-dark" href={'/api/worksheets/'+published.id+'/download?format='+format}><Download size={17}/> Download {format.toUpperCase()}</a>)}
     {published.availableFormats.includes('pdf')&&<a className="button button-outline" href={'/api/worksheets/'+published.id+'/preview'} target="_blank" rel="noopener noreferrer"><Eye size={17}/> View PDF</a>}
     {published.availableFormats.includes('pdf')&&<a className="button button-outline" href={'/api/worksheets/'+published.id+'/print'} target="_blank" rel="noopener noreferrer"><Printer size={17}/> Print PDF</a>}
    </div>
    <p className="sample-disclaimer">Files are delivered securely through Worksheet Studio, not a public storage bucket.</p>
   </div>
  </div>
 </div>;
const item=samples.find(w=>w.slug===slug);if(!item)notFound();
return <div className="container inner-page detail-page"><Link href="/worksheets" className="back-link"><ArrowLeft size={16}/> Back to library</Link>
<div className="detail-grid"><div className={'detail-preview '+item.accent}><div className="detail-paper"><div className="paper-rule short"/><h2>{item.title}</h2><p>{item.description}</p><div className="detail-symbol">{item.icon}</div><div className="paper-rule"/><div className="paper-rule short"/></div></div>
<div className="detail-copy"><div className="section-kicker">{item.subject.toUpperCase()} / {item.category.toUpperCase()}</div><h1>{item.title}</h1><p className="page-lead">{item.description}</p>
<div className="detail-facts"><span><strong>Grade</strong>{item.grade}</span><span><strong>Length</strong>{item.pages} pages</span><span><strong>Difficulty</strong>{item.difficulty}</span></div>
<div className="notice-box"><ShieldCheck size={20}/><span>This is a sample catalog listing. The actual downloadable file is not available yet, so we won't show a broken download button.</span></div>
<Link href="/create" className="button button-dark">Make a printable worksheet <ArrowUpRight size={17}/></Link>
</div></div>
</div>}
