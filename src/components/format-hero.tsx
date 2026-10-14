'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {Search,FileText,FilePenLine,SlidersHorizontal,ArrowRight} from 'lucide-react';
import Link from 'next/link';
export default function FormatHero(){
 const [format,setFormat]=useState<'pdf'|'docx'|'all'>('all');
 const [query,setQuery]=useState('');
 const [filters,setFilters]=useState(false);
 const [grade,setGrade]=useState('');
 const [subject,setSubject]=useState('');
 const router=useRouter();
 function submit(event:FormEvent<HTMLFormElement>){
   event.preventDefault();
   const params=new URLSearchParams();
   if(query.trim())params.set('q',query.trim().slice(0,100));
   if(format!=='all')params.set('format',format);
   if(grade)params.set('grade',grade);
   if(subject)params.set('subject',subject);
   router.push('/worksheets'+(params.size?'?'+params.toString():''));
 }
 return <section className="new-search-hero">
   <div className="container">
    <div className="search-heading">
      <div className="section-kicker">FREE PRINTABLE LEARNING RESOURCES</div>
      <h1>Find your next <em>great worksheet.</em></h1>
      <p>Ready-to-print PDFs and editable Word worksheets, organized by subject and grade.</p>
    </div>
    <form className="search-mega-form" onSubmit={submit}>
     <fieldset className="search-file-picker" aria-label="File type">
       <legend className="visually-hidden">Choose file format</legend>
       <button className={format==='all'?'selected':''} type="button" onClick={()=>setFormat('all')}><FileText size={24}/><span>All</span></button>
       <button className={format==='pdf'?'selected':''} type="button" onClick={()=>setFormat('pdf')}><span className="format-mini pdf-mini"><FileText size={22}/></span><span>PDF</span></button>
       <button className={format==='docx'?'selected':''} type="button" onClick={()=>setFormat('docx')}><span className="format-mini word-mini"><FilePenLine size={22}/></span><span>Word</span></button>
     </fieldset>
     <label className="search-input-wrap"><Search size={22}/>
       <input type="search" value={query} onChange={e=>setQuery(e.target.value)}
         placeholder="Search worksheets, topics or skills..." aria-label="Search worksheets"/>
     </label>
     <button className="mega-search-button" type="submit"><Search size={21}/> Search</button>
     <button className={'mega-filter-button '+(filters?'filter-active':'')} type="button"
        onClick={()=>setFilters(x=>!x)} aria-expanded={filters} aria-controls="advanced-search-options">
       <SlidersHorizontal size={22}/><span>Filters</span>
     </button>
    </form>
    {filters&&<div id="advanced-search-options" className="search-extra-filters">
     <label>Grade <select value={grade} onChange={e=>setGrade(e.target.value)}>
       <option value="">All grades</option>{Array.from({length:6},(_,i)=><option key={i} value={'grade-'+(i+1)}>Grade {i+1}</option>)}
     </select></label>
     <label>Subject <select value={subject} onChange={e=>setSubject(e.target.value)}>
       <option value="">All subjects</option>{['math','reading','kindergarten','vocabulary','spelling','grammar','writing','colors'].map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
     </select></label>
     <button type="button" onClick={()=>{setGrade('');setSubject('');setFormat('all');setQuery('');}}>Clear filters</button>
    </div>}
    <div className="search-underlinks"><span>POPULAR:</span>
     <Link href="/worksheets?subject=math&grade=grade-1">Grade 1 Math</Link>
     <Link href="/worksheets?subject=reading">Reading</Link>
     <Link href="/create/word-search">Word search maker <ArrowRight size={13}/></Link>
    </div>
   </div>
  </section>;
}
