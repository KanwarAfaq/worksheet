
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,FileText,ShieldCheck} from 'lucide-react';
import {samples} from '@/lib/catalog';
export function generateStaticParams(){return samples.map(s=>({slug:s.slug}));}
export default async function WorksheetDetail({params}:{params:Promise<{slug:string}>}){
const {slug}=await params;
const item=samples.find(w=>w.slug===slug);if(!item)notFound();
return <div className="container inner-page detail-page"><Link href="/worksheets" className="back-link"><ArrowLeft size={16}/> Back to library</Link>
<div className="detail-grid"><div className={'detail-preview '+item.accent}><div className="detail-paper"><div className="paper-rule short"/><h2>{item.title}</h2><p>{item.description}</p><div className="detail-symbol">{item.icon}</div><div className="paper-rule"/><div className="paper-rule short"/></div></div>
<div className="detail-copy"><div className="section-kicker">{item.subject.toUpperCase()} / {item.category.toUpperCase()}</div><h1>{item.title}</h1><p className="page-lead">{item.description}</p>
<div className="detail-facts"><span><strong>Grade</strong>{item.grade}</span><span><strong>Length</strong>{item.pages} pages</span><span><strong>Difficulty</strong>{item.difficulty}</span></div>
<div className="notice-box"><ShieldCheck size={20}/><span>This is a sample catalog listing. The actual downloadable file is not available yet, so we won't show a broken download button.</span></div>
<Link href="/create" className="button button-dark">Make a printable worksheet <ArrowUpRight size={17}/></Link>
</div></div>
</div>}
