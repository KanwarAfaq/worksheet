import {notFound,permanentRedirect} from 'next/navigation';
import type {Metadata} from 'next';
import WorksheetCard from '@/components/worksheet-card';
import {samples,subjects,grades} from '@/lib/catalog';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';

export function generateStaticParams(){return [...subjects.map(s=>({category:s.slug})),{category:'english'},{category:'coloring'}];}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{
 const {category}=await params;
 const subject=subjects.find(s=>s.slug===category);
 return{title:subject?subject.title+' Worksheets':'Worksheets'};
}
export default async function Category({params}:{params:Promise<{category:string}>}){
 const {category}=await params;
 if(category==='english')permanentRedirect('/reading');
 if(category==='coloring')permanentRedirect('/colors');
 const sub=subjects.find(s=>s.slug===category);
 if(!sub)notFound();
 const examples=samples.filter(w=>w.subject===category);
 return <div className="container inner-page">
 <div className="section-kicker">EXPLORE BY SUBJECT</div>
 <h1>{sub.title} <em>worksheets.</em></h1>
 <p className="page-lead">{sub.description} Find activities by grade or create a free printable worksheet with our makers.</p>
 <div className="grade-browser" aria-label="Browse subject by grade">
  <span>CHOOSE A GRADE</span>
  {grades.map(g=><Link href={'/worksheets?subject='+sub.slug+'&grade='+g.slug} key={g.slug}>{g.title}<ArrowRight size={14}/></Link>)}
 </div>
 <div className="section-heading"><div><div className="section-kicker">SAMPLE WORKSHEETS</div><h2>Get <em>inspired.</em></h2></div></div>
 {examples.length?<div className="worksheet-grid">{examples.map(w=><WorksheetCard item={w} key={w.slug}/>)}</div>:
 <div className="category-pending"><h3>{sub.title} worksheets are on the way</h3><p>We are preparing and reviewing original or licensed worksheets. No downloadable files are published in this category yet.</p><Link href="/create">Make a worksheet instead <ArrowRight size={16}/></Link></div>}
 <p className="sample-disclaimer">These are sample catalog listings, not downloadable files. Real PDFs and editable formats will appear once published.</p>
 <div className="bottom-prompt">Need a printable today? <Link href="/create">Try the free worksheet maker <ArrowRight size={17}/></Link></div>
 </div>;
}
