'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {BookOpen,Menu,Sun,Moon,Upload,Plus,UserRound} from 'lucide-react';
import {grades,subjects} from '@/lib/catalog';
export default function Header(){
 const [sidebar,setSidebar]=useState(false);
 const pathname=usePathname();
 useEffect(()=>{setSidebar(window.matchMedia('(min-width: 1250px)').matches);},[]);
 useEffect(()=>{if(window.matchMedia('(max-width: 1249px)').matches)setSidebar(false);},[pathname]);
 const [dark,setDark]=useState(false);
 useEffect(()=>{
   const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setSidebar(false);};
   window.addEventListener('keydown',onKey);
   const onResize=()=>{if(window.innerWidth<1250)setSidebar(false);};
   window.addEventListener('resize',onResize);
   return()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('resize',onResize);};
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
     aria-label={sidebar?"Collapse navigation":"Expand navigation"} aria-expanded={sidebar} aria-controls="worksheet-sidebar">
     <Menu size={23}/></button>
   <Link href="/" className="brand" aria-label="Worksheet Studio home">
     <span className="brand-icon"><BookOpen size={19}/></span><span>worksheet<span className="brand-accent">studio.</span></span>
   </Link>
   <nav className="main-subject-nav" aria-label="Worksheet subjects">
    {subjects.map(subject=><Link key={subject.slug} href={'/'+subject.slug} aria-current={pathname==='/'+subject.slug?'page':undefined}>{subject.title}</Link>)}
   </nav>
   <div className="single-nav-actions"><button type="button" className="icon-control header-theme-control" onClick={changeTheme} aria-label={dark?"Switch to light theme":"Switch to dark theme"} title={dark?"Light theme":"Dark theme"}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button><Link className="single-nav-link account-link" href="/contribute"><UserRound size={16}/> Account</Link>
     <Link className="single-nav-link" href="/create"><Plus size={15}/> Create</Link>
     <Link className="single-nav-upload" href="/contribute"><Upload size={16}/> Upload</Link>
   </div>
  </div>
 </header>
 {sidebar&&<div className="sidebar-scrim" onClick={()=>setSidebar(false)} aria-hidden="true"/>}
 <aside className={'worksheet-sidebar '+(sidebar?'is-open':'')} id="worksheet-sidebar" aria-label="Browse and appearance">
   <div className="sidebar-top"><strong>Worksheet Studio</strong></div>
   <div className="sidebar-section-title">QUICK LINKS</div>
   <Link href="/worksheets" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>All worksheets</Link>
   <Link href="/create" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>Worksheet maker</Link>
   <Link href="/contribute" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>Upload a worksheet</Link>
   <Link href="/create/ai" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>AI worksheet maker</Link>
   <div className="sidebar-section-title">BROWSE</div>
   <details className="sidebar-menu-group"><summary>Subjects <span>⌄</span></summary><div className="sidebar-subject-links">{subjects.map(sub=><Link href={'/'+sub.slug} key={sub.slug} aria-current={pathname==='/'+sub.slug?'page':undefined} onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>{sub.title}</Link>)}</div></details>
   <details className="sidebar-menu-group"><summary>Grades 1–6 <span>⌄</span></summary><div className="sidebar-grades">{grades.map(g=><Link key={g.slug} href={"/worksheets?grade="+g.slug} onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>{g.title}</Link>)}</div></details>
   <details className="sidebar-menu-group"><summary>Worksheet templates <span>⌄</span></summary><div className="sidebar-subject-links"><Link href="/create/templates" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>4 editable templates</Link><Link href="/create/ai" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>AI worksheet creator</Link></div></details>

 </aside>
 </>;
}
