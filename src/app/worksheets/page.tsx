import type {Metadata} from 'next';
import Link from 'next/link';
import WorksheetCard from '@/components/worksheet-card';
import {samples,subjects,grades,formats} from '@/lib/catalog';
import {ArrowRight,FileText} from 'lucide-react';

export const metadata:Metadata={title:'Worksheet Library',description:'Browse worksheet topics by subject, school grade and document format.'};
type Filters={subject?:string;grade?:string;format?:string};
export default async function Worksheets({searchParams}:{searchParams:Promise<Filters>}){
 const filters=await searchParams;
 const subject=subjects.find(s=>s.slug===filters.subject)?.slug||'';
 const grade=grades.find(g=>g.slug===filters.grade)?.slug||'';
 const format=formats.find(f=>f.slug===filters.format)?.slug||'';
 const href=(next:Filters)=>{
  const params=new URLSearchParams();
  const active={subject,grade,format,...next};
  if(active.subject)params.set('subject',active.subject);
  if(active.grade)params.set('grade',active.grade);
  if(active.format)params.set('format',active.format);
  const value=params.toString();
  return '/worksheets'+(value?'?'+value:'');
 };
 const visibleSamples=samples.filter(item=>
  (!subject||item.subject===subject) &&
  (!grade||item.grade==='Grade '+grade.split('-')[1]) &&
  !format
 );
 const chosenFormat=formats.find(f=>f.slug===format);
 return <div className="container inner-page">
  <div className="section-kicker">THE WORKSHEET LIBRARY</div><h1>Find a little <em>inspiration.</em></h1>
  <p className="page-lead">Browse by subject, grade, or file type. Real downloads will appear here as verified files are added to the library.</p>
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
  {chosenFormat?<div className="category-pending"><FileText size={36}/><h3>{chosenFormat.title} worksheets are coming soon</h3><p>There are no verified, published {chosenFormat.extension.toUpperCase()} files available yet. The {chosenFormat.title} filter will display them when our secure publishing workflow is ready.</p><Link href="/create">Create a printable PDF now <ArrowRight size={16}/></Link></div>:
  visibleSamples.length?<div className="worksheet-grid">{visibleSamples.map(w=><WorksheetCard item={w} key={w.slug}/>)}</div>:
  <div className="category-pending"><h3>No sample worksheets for these filters</h3><p>We're preparing original and licensed worksheets for all eight subjects and Grades 1–6.</p><Link href="/create">Make your own printable <ArrowRight size={16}/></Link></div>}
  <p className="sample-disclaimer">Catalog previews are examples only. They do not represent uploaded or publicly downloadable files.</p>
  <div className="bottom-prompt">Need a custom activity? <Link href="/create">Open the free worksheet maker <ArrowRight size={17}/></Link></div>
 </div>;
}
