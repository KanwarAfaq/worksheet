'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {BookOpen,Menu,X,ChevronDown,Sun,Moon,PanelLeftClose,PanelLeftOpen,Upload,Plus,LogIn,UserRound} from 'lucide-react';
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
     aria-label="Open subjects and settings sidebar" aria-expanded={sidebar} aria-controls="worksheet-sidebar">
     <Menu size={23}/></button>
   <Link href="/" className="brand" aria-label="Worksheet Studio home">
     <span className="brand-icon"><BookOpen size={19}/></span><span>worksheet<span className="brand-accent">studio.</span></span>
   </Link>
   <nav className="main-subject-nav" aria-label="Browse worksheet subjects">
    {subjects.map(subject=><details className="subject-menu-item" key={subject.slug}>
       <summary>{subject.title}<ChevronDown size={13} aria-hidden="true"/></summary>
       <div className="subject-submenu">
         <Link className="subject-all-link" href={'/'+subject.slug}>All {subject.title}</Link>
         <div className="subject-submenu-caption">GRADES 1–6</div>
         {grades.map(grade=><Link key={grade.slug} href={'/worksheets?subject='+subject.slug+'&grade='+grade.slug}>{grade.title}</Link>)}
       </div>
    </details>)}
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
   <div className="sidebar-section-title">SUBJECTS · GRADES 1–6</div>
   {subjects.map(sub=><details className="sidebar-subject" key={sub.slug}>
     <summary>{sub.title}<ChevronDown size={16}/></summary>
     <Link href={'/'+sub.slug} onClick={()=>setSidebar(false)}>All {sub.title}</Link>
     <div className="sidebar-grades">{grades.map(g=><Link href={'/worksheets?subject='+sub.slug+'&grade='+g.slug}
      onClick={()=>setSidebar(false)} key={g.slug}>{g.title}</Link>)}</div>
   </details>)}

 </aside>
 </>;
}
