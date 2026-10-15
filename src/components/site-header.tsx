'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {BookOpen,Menu,X,ChevronDown,Sun,Moon,Upload,Plus,UserRound} from 'lucide-react';
import {grades} from '@/lib/catalog';
import {mainMenus} from '@/lib/navigation';
export default function Header(){
 const pathname=usePathname();
 const [sidebar,setSidebar]=useState(false);
 const [dark,setDark]=useState(false);
 useEffect(()=>{
  setDark(window.localStorage.getItem('worksheet-theme')==='dark');
  document.documentElement.dataset.theme=window.localStorage.getItem('worksheet-theme')==='dark'?'dark':'light';
 },[]);
 useEffect(()=>{setSidebar(window.matchMedia('(min-width: 1250px)').matches);},[]);
 useEffect(()=>{if(window.innerWidth<1250)setSidebar(false);},[pathname]);
 useEffect(()=>{
  const close=(e:KeyboardEvent)=>{if(e.key==='Escape'&&window.innerWidth<1250)setSidebar(false);};
  const resize=()=>{if(window.innerWidth<1250)setSidebar(false);};
  window.addEventListener('keydown',close);window.addEventListener('resize',resize);
  return()=>{window.removeEventListener('keydown',close);window.removeEventListener('resize',resize);};
 },[]);
 function changeTheme(){
  const next=!dark;setDark(next);
  document.documentElement.dataset.theme=next?'dark':'light';
  window.localStorage.setItem('worksheet-theme',next?'dark':'light');
 }
 return <>
  <header className="site-header single-header">
   <div className="container nav-inner single-nav">
    <button className="icon-control sidebar-trigger" type="button" onClick={()=>setSidebar(s=>!s)}
     aria-label={sidebar?'Close sidebar':'Open sidebar'} aria-expanded={sidebar} aria-controls="worksheet-sidebar"><Menu size={24}/></button>
    <Link href="/" className="brand" aria-label="Worksheet Studio home">
     <span className="brand-icon"><BookOpen size={20}/></span><span>worksheet<span className="brand-accent">studio.</span></span>
    </Link>
    <nav className="main-subject-nav simplified-main-menu" aria-label="Main subjects">
     {mainMenus.map(menu=><details className="top-subject-dropdown" key={pathname+menu.key}>
      <summary aria-label={menu.name+' menu'}>{menu.name}<ChevronDown size={18}/></summary>
      <div className="top-subject-panel">
       <Link className="top-subject-all" href={menu.href}>All {menu.name} worksheets</Link>
       <div className="top-subject-links">
        {menu.items.map(item=><Link key={item.name} href={item.href}>{item.name}</Link>)}
       </div>
       <div className="top-subject-grade-title">GRADES 1–6</div>
       <div className="top-subject-grade-links">
        {grades.map(grade=><Link href={'/worksheets?subject='+menu.gradeSubject+'&grade='+grade.slug}
          key={grade.slug}>{grade.title.replace('Grade ','')}</Link>)}
       </div>
      </div>
     </details>)}
    </nav>
    <div className="single-nav-actions">
      <Link className="single-nav-link account-link" href="/contribute"><UserRound size={19}/> Account</Link>
      <Link className="single-nav-link" href="/create"><Plus size={18}/> Create</Link>
      <Link className="single-nav-upload" href="/contribute"><Upload size={18}/> Upload</Link>
    </div>
   </div>
  </header>
  {sidebar&&<div className="sidebar-scrim" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}} aria-hidden="true"/>}
  <aside className={'worksheet-sidebar simple-sidebar '+(sidebar?'is-open':'')} id="worksheet-sidebar" aria-label="Quick navigation">
   <div className="sidebar-top"><strong>Menu</strong>
    <button className="icon-control" type="button" onClick={()=>setSidebar(false)} aria-label="Close sidebar"><X size={21}/></button>
   </div>
   <nav className="simple-sidebar-links" aria-label="Quick links">
    <Link href="/worksheets" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>Worksheets</Link>
    <Link href="/create" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>Create</Link>
    <Link href="/contribute" onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>Upload</Link>
   </nav>
   <details className="simple-sidebar-grades">
    <summary>Grades 1–6 <ChevronDown size={18}/></summary>
    <div>{grades.map(grade=><Link key={grade.slug} href={'/worksheets?grade='+grade.slug}
      onClick={()=>{if(window.innerWidth<1250)setSidebar(false);}}>{grade.title}</Link>)}</div>
   </details>
   <div className="sidebar-theme">
    <span>Theme</span>
    <button className="theme-toggle" type="button" onClick={changeTheme}
      aria-label={dark?'Switch to light mode':'Switch to dark mode'} aria-pressed={dark}>
     {dark?<Moon size={19}/>:<Sun size={19}/>} {dark?'Dark':'Light'}
    </button>
   </div>
  </aside>
 </>;
}
