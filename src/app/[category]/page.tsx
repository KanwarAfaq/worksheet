
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import WorksheetCard from '@/components/worksheet-card';
import {samples,subjects} from '@/lib/catalog';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
export function generateStaticParams(){return subjects.map(s=>({category:s.slug}));}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category}=await params;const subject=subjects.find(s=>s.slug===category);return {title:subject?subject.title:'Subject'};}
export default async function Category({params}:{params:Promise<{category:string}>}){
const {category}=await params;const sub=subjects.find(s=>s.slug===category);if(!sub)notFound();
return <div className="container inner-page"><div className="section-kicker">EXPLORE BY SUBJECT</div><h1>{sub.title} <em>worksheets.</em></h1><p className="page-lead">{sub.description} Browse our sample previews, or build a printable activity using our free generator.</p><div className="worksheet-grid">{samples.filter(w=>w.subject===category).map(w=><WorksheetCard item={w} key={w.slug}/>)}</div><p className="sample-disclaimer">Sample listings only — library downloads will be enabled after verified files are uploaded.</p><div className="bottom-prompt">Create your own printable <Link href="/create">Open worksheet maker <ArrowRight size={17}/></Link></div></div>;
}
