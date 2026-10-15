import {notFound,permanentRedirect} from 'next/navigation';
import type {Metadata} from 'next';
import WorksheetCard from '@/components/worksheet-card';
import PublishedWorksheetCard from '@/components/published-worksheet-card';
import {publishedWorksheets} from '@/lib/public-catalog';
import {samples,subjects,grades} from '@/lib/catalog';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {indexableRobots,breadcrumbs} from '@/lib/seo';
import StructuredData from '@/components/structured-data';

export const dynamic='force-dynamic';
export function generateStaticParams(){return [...subjects.map(s=>({category:s.slug})),{category:'english'},{category:'coloring'}];}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{
 const {category}=await params;
 const subject=subjects.find(s=>s.slug===category);
 const hasContent=subject ? (await publishedWorksheets()).some(w=>w.categorySlug===category && (w.summary||'').trim().length>=25&&w.availableFormats.length>0):false;
 return{title:subject?'Free '+subject.title+' Worksheets for Grades 1–6':'Worksheets',
  description:subject?subject.description+' Browse ready-to-print activities and free makers for Grades 1–6.':'Free printable worksheet resources.',
  alternates:subject?{canonical:'/'+category}:undefined,
  robots:indexableRobots(hasContent)};
}
export default async function Category({params}:{params:Promise<{category:string}>}){
 const {category}=await params;
 if(category==='english')permanentRedirect('/reading');
 if(category==='coloring')permanentRedirect('/colors');
 const sub=subjects.find(s=>s.slug===category);
 if(!sub)notFound();
 const examples=samples.filter(w=>w.subject===category);
 const published=(await publishedWorksheets()).filter(w=>w.categorySlug===category);
 return <div className="container inner-page">
 <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:sub.title+' worksheets',url:'/'+sub.slug}])}/>
 <div className="section-kicker">EXPLORE BY SUBJECT</div>
 <h1>{sub.title} <em>worksheets.</em></h1>
 <p className="page-lead">{sub.description} Find activities by grade or create a free printable worksheet with our makers.</p>
 <div className="grade-browser" aria-label="Browse subject by grade">
  <span>CHOOSE A GRADE</span>
  {grades.map(g=><Link href={'/worksheets?subject='+sub.slug+'&grade='+g.slug} key={g.slug}>{g.title}<ArrowRight size={14}/></Link>)}
 </div>
 <div className="section-heading"><div><div className="section-kicker">{published.length?'PUBLISHED WORKSHEETS':'EXAMPLE WORKSHEETS'}</div><h2>{published.length?'Explore published':'Get inspired by'} <em>worksheets.</em></h2></div></div>
 {published.length>0?<div className="worksheet-grid">{published.map(w=><PublishedWorksheetCard item={w} key={w.id}/>)}</div>:
 examples.length?<><div className="library-sample-note">EXAMPLE WORKSHEETS — NOT YET DOWNLOADABLE</div><div className="worksheet-grid">{examples.map(w=><WorksheetCard item={w} key={w.slug}/>)}</div></>:
 <div className="category-pending"><h3>{sub.title} worksheets are on the way</h3><p>We are preparing and reviewing original or licensed worksheets. No downloadable files are published in this category yet.</p><Link href="/create">Make a worksheet instead <ArrowRight size={16}/></Link></div>}
 <p className="sample-disclaimer">Published documents have download links. Example listings are not downloadable.</p>
 <div className="bottom-prompt">Need a printable today? <Link href="/create">Try the free worksheet maker <ArrowRight size={17}/></Link></div>
 </div>;
}
