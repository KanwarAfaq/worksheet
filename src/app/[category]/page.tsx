import {notFound,permanentRedirect} from 'next/navigation';
import type {Metadata} from 'next';
import WorksheetCard from '@/components/worksheet-card';
import PublishedWorksheetCard from '@/components/published-worksheet-card';
import {publishedWorksheets,publishedWorksheetPage} from '@/lib/public-catalog';
import WorksheetPagination from '@/components/worksheet-pagination';
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
export default async function Category({params,searchParams}:{params:Promise<{category:string}>;searchParams:Promise<{page?:string}>}){
 const {category}=await params;
 const {page:rawPage}=await searchParams;
 const page=Math.max(1,Number.isSafeInteger(Number(rawPage))?Number(rawPage||1):1);
 if(category==='english')permanentRedirect('/reading');
 if(category==='coloring')permanentRedirect('/colors');
 const sub=subjects.find(s=>s.slug===category);
 if(!sub)notFound();
 const examples=samples.filter(w=>w.subject===category);
 const result=await publishedWorksheetPage({subject:category,page});
 const published=result.items;
 return <div className="container inner-page">
 <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:sub.title+' worksheets',url:'/'+sub.slug}])}/>
 {category==='colors'&&<div className="color-category-cta">
   <div><h2>Coloring Page Maker</h2><p>Pick up to 4 pictures and print your own page.</p></div>
   <Link href="/create/coloring" className="button button-dark">Create coloring page <ArrowRight size={19}/></Link>
 </div>}
 <div className="section-kicker">EXPLORE BY SUBJECT</div>
 <h1>{sub.title} <em>worksheets.</em></h1>
 <p className="page-lead">{sub.description} Find activities by grade or create a free printable worksheet with our makers.</p>
 <div className="grade-browser" aria-label="Browse subject by grade">
  <span>CHOOSE A GRADE</span>
  {grades.map(g=><Link href={'/worksheets?subject='+sub.slug+'&grade='+g.slug} key={g.slug}>{g.title}<ArrowRight size={14}/></Link>)}
 </div>
 <div className="section-heading"><div><div className="section-kicker">{published.length?'PUBLISHED WORKSHEETS':'EXAMPLE WORKSHEETS'}</div><h2>{published.length?'Explore published':'Get inspired by'} <em>worksheets.</em></h2></div></div>
 {published.length>0?<> <div className="worksheet-grid">{published.map(w=><PublishedWorksheetCard item={w} key={w.id}/>)}</div>
 <WorksheetPagination base={'/'+category} page={result.page} pages={result.pages} total={result.total}/></>:
 examples.length?<><div className="library-sample-note">EXAMPLE WORKSHEETS — NOT YET DOWNLOADABLE</div><div className="worksheet-grid">{examples.slice((page-1)*12,page*12).map(w=><WorksheetCard item={w} key={w.slug}/>)}</div></>:
 <div className="category-pending"><h3>{sub.title} worksheets are on the way</h3><p>We are preparing and reviewing original or licensed worksheets. No downloadable files are published in this category yet.</p><Link href="/create">Make a worksheet instead <ArrowRight size={16}/></Link></div>}
 <p className="sample-disclaimer">Published documents have download links. Example listings are not downloadable.</p>
 <div className="bottom-prompt">Make your own activity
   <Link href={category==='colors'?'/create/coloring':'/create'}>{category==='colors'?'Open coloring maker':'Open worksheet maker'} <ArrowRight size={17}/></Link></div>
 </div>;
}
