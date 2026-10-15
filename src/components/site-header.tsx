'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {BookOpen,Menu,X,Sun,Moon,Upload,Plus,UserRound} from 'lucide-react';
import {grades,subjects} from '@/lib/catalog';
export default function Header(){
 const [sidebar,setSidebar]=useState(false);
 const [dark,setDark]=useState(false);
 useEffect(()=>{
   const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setSidebar(false);};
   window.addEventListener('keydown',onKey);
   return()=>window.removeEventListener('keydown',onKey);
 },[]);
 useEffect(()=>{
   const saved=window.localStorage.getItem('worksheet-theme');
   const enabled=saved==='dark';
   setDark(enabled);
   document.documentElement.dataset.theme=enabled?'dark':'light';
 },[]);
 function changeTheme(){
   setDark(v=>{
     const next=!v;
     document.documentElement.dataset.theme=next?'dark':'light';
     window.localStorage.setItem('worksheet-theme',next?'dark':'light');
     return next;
   });
 }
 return <>
 <header className="site-header single-header">
  <div className="container nav-inner single-nav">
   <button className="icon-control sidebar-trigger" type="button" onClick={()=>setSidebar(v=>!v)}
     aria-label={sidebar?"Close worksheet sidebar":"Open worksheet sidebar"} aria-expanded={sidebar} aria-controls="worksheet-sidebar">
     {sidebar?<X size={23}/>:<Menu size={23}/>}</button>
   <Link href="/" className="brand" aria-label="Worksheet Studio home">
     <span className="brand-icon"><BookOpen size={19}/></span><span>worksheet<span className="brand-accent">studio.</span></span>
   </Link>
   <nav className="main-subject-nav" aria-label="Worksheet subjects">
    {subjects.map(subject=><Link key={subject.slug} href={'/'+subject.slug}>{subject.title}</Link>)}
   </nav>
   <div className="single-nav-actions"><button type="button" className="icon-control header-theme-control" onClick={changeTheme} aria-label={dark?"Switch to light theme":"Switch to dark theme"} title={dark?"Light theme":"Dark theme"}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button><Link className="single-nav-link account-link" href="/contribute"><UserRound size={16}/> Account</Link>
     <Link className="single-nav-link" href="/create"><Plus size={15}/> Create</Link>
     <Link className="single-nav-upload" href="/contribute"><Upload size={16}/> Upload</Link>
   </div>
  </div>
 </header>
 {sidebar&&<div className="sidebar-scrim" onClick={()=>setSidebar(false)} aria-hidden="true"/>}
 <aside className={'worksheet-sidebar '+(sidebar?'is-open':'')} id="worksheet-sidebar" aria-label="Browse and appearance">
   <div className="sidebar-top"><strong>Explore Worksheet Studio</strong>
     <button type="button" className="icon-control" aria-label="Close sidebar" onClick={()=>setSidebar(false)}><X size={23}/></button>
   </div>
   <div className="sidebar-section-title">QUICK LINKS</div>
   <Link href="/worksheets" onClick={()=>setSidebar(false)}>All worksheets</Link>
   <Link href="/create" onClick={()=>setSidebar(false)}>Worksheet maker</Link>
   <Link href="/contribute" onClick={()=>setSidebar(false)}>Upload a worksheet</Link>
   <div className="sidebar-section-title">BROWSE BY SUBJECT & GRADE</div>
   <div className="sidebar-subject-links">{subjects.map(sub=><Link href={'/'+sub.slug} key={sub.slug} onClick={()=>setSidebar(false)}>{sub.title}</Link>)}</div>
   <div className="sidebar-section-title">ALL GRADES</div>
   <div className="sidebar-grades">{grades.map(g=><Link key={g.slug} href={"/worksheets?grade="+g.slug} onClick={()=>setSidebar(false)}>{g.title}</Link>)}</div>
 </aside>
 </>;
}
