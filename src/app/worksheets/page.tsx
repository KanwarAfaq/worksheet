import type {Metadata} from 'next';
import Link from 'next/link';
import WorksheetCard from '@/components/worksheet-card';
import PublishedWorksheetCard from '@/components/published-worksheet-card';
import {publishedWorksheetPage,WORKSHEETS_PER_PAGE} from '@/lib/public-catalog';
import WorksheetPagination from '@/components/worksheet-pagination';
import {samples,subjects,grades,formats} from '@/lib/catalog';
import {ArrowRight,FileText} from 'lucide-react';
import {indexableRobots} from '@/lib/seo';

export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<Filters>}):Promise<Metadata>{
 const f=await searchParams;
 const filtered=Boolean(f.subject||f.grade||f.format||f.q);
 return{title:'Free Printable Worksheet Library — Grades 1–6',
 description:'Browse ready-to-print PDF and image worksheets by subject and grade. Find math, reading, spelling, writing and other learning activities.',
 alternates:{canonical:'/worksheets'},robots:indexableRobots(!filtered)};
}
type Filters={subject?:string;grade?:string;format?:string;q?:string;page?:string};
export default async function Worksheets({searchParams}:{searchParams:Promise<Filters>}){
 const filters=await searchParams;

 const currentPage=Math.max(1,Number.isSafeInteger(Number(filters.page))?Number(filters.page||1):1);
 const subject=subjects.find(s=>s.slug===filters.subject)?.slug||'';
 const grade=grades.find(g=>g.slug===filters.grade)?.slug||'';
 const format=formats.find(f=>f.slug===filters.format)?.slug||'';
 const query=(filters.q||'').trim().toLowerCase().slice(0,100);
 const href=(next:Filters)=>{
  const params=new URLSearchParams();
  const active={subject,grade,format,...next};
  if(query)params.set('q',query);
  if(active.subject)params.set('subject',active.subject);
  if(active.grade)params.set('grade',active.grade);
  if(active.format)params.set('format',active.format);
  const value=params.toString();
  return '/worksheets'+(value?'?'+value:'');
 };
 const visibleSamples=samples.filter(item=>
  (!subject||item.subject===subject) &&
  (!grade||item.grade==='Grade '+grade.split('-')[1]) &&
  !format && (!query||(item.title+' '+item.description+' '+item.category).toLowerCase().includes(query))
 );
 const livePage=await publishedWorksheetPage({subject,grade,format,q:query,page:currentPage});
 const matchingLive=livePage.items;
 const chosenFormat=formats.find(f=>f.slug===format);
 return <div className="container inner-page">
  <h1>Printable <em>worksheets.</em></h1>
 {query&&<div className="library-query-note">Search results for <strong>{query}</strong><Link href="/worksheets">Clear search</Link></div>}
  <form action="/worksheets" className="library-search-form" role="search">
    <input type="search" name="q" defaultValue={query} placeholder="Search worksheets…"
     aria-label="Search worksheets by topic or title"/>
    {subject&&<input type="hidden" name="subject" value={subject}/>}
    {grade&&<input type="hidden" name="grade" value={grade}/>}
    {format&&<input type="hidden" name="format" value={format}/>}
    <button type="submit">Search</button>
  </form>
  <div className="library-filters">
    <div className="library-filter-group"><span>SUBJECT</span><div className="filter-bar">
      <Link href={href({subject:''})} className={'filter-pill '+(!subject?'active':'')}>All</Link>
      {subjects.map(s=><Link href={href({subject:s.slug})} key={s.slug} className={'filter-pill '+(subject===s.slug?'active':'')}>{s.title}</Link>)}
    </div></div>
    <div className="library-filter-group"><span>GRADE</span><div className="filter-bar">
      <Link href={href({grade:''})} className={'filter-pill '+(!grade?'active':'')}>All grades</Link>
      {grades.map(g=><Link href={href({grade:g.slug})} key={g.slug} className={'filter-pill '+(grade===g.slug?'active':'')}>{g.title}</Link>)}
    </div></div>
    <div className="library-filter-group"><span>FILE TYPE</span><div className="filter-bar">
      <Link href={href({format:''})} className={'filter-pill '+(!format?'active':'')}>All types</Link>
      {formats.map(f=><Link href={href({format:f.slug})} key={f.slug} className={'filter-pill '+(format===f.slug?'active':'')}>{f.title}</Link>)}
    </div></div>
  </div>
  {livePage.total>0&&matchingLive.length===0?<div className="category-pending">No worksheets on this page. <Link href={href({})}>Go to results</Link></div>:
  matchingLive.length>0?<>
  <WorksheetPagination base="/worksheets" position="top" page={livePage.page} pages={livePage.pages} total={livePage.total}
   filters={{subject,grade,format,q:query}}/>
  <div className="worksheet-grid">{matchingLive.map(item=><PublishedWorksheetCard item={item} key={item.id}/>)}</div>
  <WorksheetPagination base="/worksheets" position="bottom" page={livePage.page} pages={livePage.pages} total={livePage.total}
   filters={{subject,grade,format,q:query}}/></>:
 chosenFormat?<div className="category-pending"><FileText size={36}/><h3>No published {chosenFormat.title} worksheets yet</h3><p>There are no verified {chosenFormat.title} files for these filters. They appear automatically after uploading and publishing.</p><Link href="/create">Create a printable PDF now <ArrowRight size={16}/></Link></div>:
 visibleSamples.length?<><div className="library-sample-note">EXAMPLE WORKSHEETS — NOT YET DOWNLOADABLE</div>
  <WorksheetPagination base="/worksheets" page={currentPage}
   pages={Math.ceil(visibleSamples.length/WORKSHEETS_PER_PAGE)} total={visibleSamples.length}
   position="top" filters={{subject,grade,format,q:query}}/>
  <div className="worksheet-grid">{visibleSamples.slice((currentPage-1)*WORKSHEETS_PER_PAGE,currentPage*WORKSHEETS_PER_PAGE).map(w=><WorksheetCard item={w} key={w.slug}/>)}</div>
  <WorksheetPagination base="/worksheets" page={currentPage}
   pages={Math.ceil(visibleSamples.length/WORKSHEETS_PER_PAGE)} total={visibleSamples.length}
   position="bottom" filters={{subject,grade,format,q:query}}/></>:
 <div className="category-pending"><h3>No worksheets for these filters yet</h3><p>New worksheets will appear here after publication.</p><Link href="/create">Make your own printable <ArrowRight size={16}/></Link></div>}

  
 </div>;
}
