
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,FileText,ShieldCheck} from 'lucide-react';
import {samples} from '@/lib/catalog';
import {publishedWorksheets,DUPLICATE_OF} from '@/lib/public-catalog';
import {permanentRedirect} from 'next/navigation';
import {Download,Eye,Printer,BookOpen} from 'lucide-react';
import type {Metadata} from 'next';
import {indexableRobots,absoluteUrl,breadcrumbs} from '@/lib/seo';
import StructuredData from '@/components/structured-data';
import PdfPageViewer from '@/components/pdf-page-viewer';
import {printableBySlug} from '@/lib/printables';
import PrintableSheet from '@/components/printable-sheet';
import PrintButton from '@/components/print-button';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const worksheet=(await publishedWorksheets()).find(x=>x.slug===slug);
 if(!worksheet){
  const pr=printableBySlug(slug);
  if(pr)return{title:{absolute:pr.seoTitle},description:pr.seoDescription,alternates:{canonical:'/worksheets/'+encodeURIComponent(slug)},robots:indexableRobots(true),openGraph:{type:'article',title:pr.seoTitle,description:pr.seoDescription,url:'/worksheets/'+encodeURIComponent(slug)}};
  return{title:'Worksheet example',robots:indexableRobots(false)};
 }
 const useful=(worksheet.summary||'').trim().length>=25 && worksheet.availableFormats.length>0;
 const description=(worksheet.summary||worksheet.description||'Free printable learning worksheet').slice(0,155);
 return{
  title:worksheet.title+' — Free '+(worksheet.gradeName||'Printable')+' Worksheet',
  description,alternates:{canonical:'/worksheets/'+encodeURIComponent(slug)},
  robots:indexableRobots(useful),
  openGraph:{type:'article',title:worksheet.title,description,url:'/worksheets/'+encodeURIComponent(slug)}
 };
}

export const dynamic='force-dynamic';
export default async function WorksheetDetail({params}:{params:Promise<{slug:string}>}){
const {slug}=await params;
if(DUPLICATE_OF[slug])permanentRedirect('/worksheets/'+DUPLICATE_OF[slug]);
const published=(await publishedWorksheets()).find(item=>item.slug===slug);
if(published){
 const resource={
  '@context':'https://schema.org','@type':'LearningResource',
  '@id':absoluteUrl('/worksheets/'+encodeURIComponent(published.slug))+'#resource',
  name:published.title,description:published.summary||published.description||'Printable worksheet',
  url:absoluteUrl('/worksheets/'+encodeURIComponent(published.slug)),
  inLanguage:'en',isAccessibleForFree:true,learningResourceType:'Worksheet',
  educationalLevel:published.gradeName||undefined,
  about:published.categoryName,
  datePublished:published.publishedAt||undefined,
  dateModified:published.updatedAt||undefined,
  provider:{'@type':'Organization',name:'Worksheet Studio',url:absoluteUrl('/')},
  encodingFormat:published.availableFormats.map(f=>({
    pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',webp:'image/webp',
    docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  })[f]).filter(Boolean)
 };
 return <div className="container inner-page detail-page">
  <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:'Worksheets',url:'/worksheets'},
    {label:published.categoryName,url:'/'+published.categorySlug},
    {label:published.title,url:'/worksheets/'+encodeURIComponent(published.slug)}])}/>
  <StructuredData value={resource}/>
  <Link href="/worksheets" className="back-link"><ArrowLeft size={16}/> Back to library</Link>
  <div className="detail-grid">
   {published.availableFormats.includes('pdf')?<PdfPageViewer worksheetId={published.id} initialPage={published.previewPage}/>:
    published.availableFormats.some(f=>['png','jpg','webp'].includes(f))?
    <div className="detail-real-preview" aria-label="Actual uploaded worksheet preview">
      <img src={'/api/worksheets/'+published.id+'/preview?format='+published.availableFormats.find(f=>['png','jpg','webp'].includes(f))}
        alt={'Preview of '+published.title} loading="eager"/>
    </div>:
    <div className="detail-preview mint"><div className="detail-paper"><div className="paper-rule short"/><h2>{published.title}</h2><p>{published.summary||'Ready-to-print practice'}</p><div className="detail-symbol"><BookOpen size={76}/></div></div></div>}
   <div className="detail-copy">
    <div className="section-kicker">{published.categoryName.toUpperCase()} · VERIFIED WORKSHEET</div>
    <h1>{published.title}</h1>
    <p className="page-lead">{published.description||published.summary||'A printable learning activity for students.'}</p>
    <div className="detail-facts"><span><strong>Grade</strong>{published.gradeName||'All grades'}</span><span><strong>File formats</strong>{published.availableFormats.map(x=>x.toUpperCase()).join(', ')}</span></div>
    <div className="published-detail-actions">
     {published.availableFormats.map(format=><a key={format} className="button button-dark" href={'/api/worksheets/'+published.id+'/download?format='+format}><Download size={17}/> Download {format.toUpperCase()}</a>)}
     {published.availableFormats.some(f=>['pdf','png','jpg','webp'].includes(f))&&<a className="button button-outline" href={'/api/worksheets/'+published.id+'/preview?format='+(published.availableFormats.find(f=>['pdf','png','jpg','webp'].includes(f))||'pdf')} target="_blank" rel="noopener noreferrer"><Eye size={17}/> Preview file</a>}
     {published.availableFormats.some(f=>['pdf','png','jpg','webp'].includes(f))&&<a className="button button-outline" href={'/api/worksheets/'+published.id+'/print?format='+(published.availableFormats.find(f=>['pdf','png','jpg','webp'].includes(f))||'pdf')} target="_blank" rel="noopener noreferrer"><Printer size={17}/> Print/Save</a>}
    </div>
    
   </div>
  </div>
 </div>;
}
const printable=printableBySlug(slug);
if(printable){
 const url=absoluteUrl('/worksheets/'+encodeURIComponent(printable.slug));
 const resource={'@context':'https://schema.org','@type':'LearningResource','@id':url+'#resource',name:printable.title,description:printable.seoDescription,url,inLanguage:'en',isAccessibleForFree:true,learningResourceType:'Worksheet',educationalLevel:printable.grade,teaches:printable.skills,about:printable.category,provider:{'@type':'Organization',name:'Worksheet Studio',url:absoluteUrl('/')}};
 const faq={'@context':'https://schema.org','@type':'FAQPage',mainEntity:[
  {'@type':'Question',name:'Is this worksheet free to print?',acceptedAnswer:{'@type':'Answer',text:'Yes. Use the print button and choose A4 or US Letter. The answer key is on the last page.'}},
  {'@type':'Question',name:'What grade is this worksheet for?',acceptedAnswer:{'@type':'Answer',text:printable.title+' is designed for '+printable.grade+' ('+printable.difficulty.toLowerCase()+' level).'}}]};
 return <div className="container inner-page detail-page">
  <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:'Worksheets',url:'/worksheets'},{label:printable.title,url:'/worksheets/'+encodeURIComponent(printable.slug)}])}/>
  <StructuredData value={resource}/><StructuredData value={faq}/>
  <Link href="/worksheets" className="back-link"><ArrowLeft size={16}/> Back to library</Link>
  <div className="section-kicker">{printable.subject.toUpperCase()} · {printable.category.toUpperCase()} · {printable.grade.toUpperCase()}</div>
  <h1>{printable.title}</h1>
  <p className="page-lead">{printable.description} Free to print on A4 or US Letter.</p>
  <div className="published-detail-actions"><PrintButton/></div>
  <div className="pw-wrap" style={{marginTop:20}}><PrintableSheet p={printable}/><PrintableSheet p={printable} answers/></div>
  <div className="pw-facts">
   <div><h2>How to use this worksheet</h2><ol>{printable.howToUse.map(t=><li key={t}>{t}</li>)}</ol></div>
   <div><h2>Skills practised</h2><ul>{printable.skills.map(t=><li key={t}>{t}</li>)}</ul></div>
   <div><h2>More worksheets</h2><ul><li><Link href="/worksheets">Browse all printable worksheets</Link></li><li><Link href="/create">Make your own word search, scramble or missing letters sheet</Link></li><li><Link href="/guides/printing-worksheets">How to print worksheets (A4 and US Letter)</Link></li></ul></div>
  </div>
 </div>;
}
const item=samples.find(w=>w.slug===slug);if(!item)notFound();
return <div className="container inner-page detail-page"><Link href="/worksheets" className="back-link"><ArrowLeft size={16}/> Back to library</Link>
<div className="detail-grid"><div className={'detail-preview '+item.accent}><div className="detail-paper"><div className="paper-rule short"/><h2>{item.title}</h2><p>{item.description}</p><div className="detail-symbol">{item.icon}</div><div className="paper-rule"/><div className="paper-rule short"/></div></div>
<div className="detail-copy"><div className="section-kicker">{item.subject.toUpperCase()} / {item.category.toUpperCase()}</div><h1>{item.title}</h1><p className="page-lead">{item.description}</p>
<div className="detail-facts"><span><strong>Grade</strong>{item.grade}</span><span><strong>Length</strong>{item.pages} pages</span><span><strong>Difficulty</strong>{item.difficulty}</span></div>
<div className="notice-box"><ShieldCheck size={20}/><span>This is a sample catalog listing. The actual downloadable file is not available yet, so we won't show a broken download button.</span></div>
<Link href="/create" className="button button-dark">Make a printable worksheet <ArrowUpRight size={17}/></Link>
</div></div>
</div>}
