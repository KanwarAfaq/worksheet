'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,Menu,X,ChevronDown,Sun,Moon,Upload,Plus,UserRound} from 'lucide-react';
import {grades} from '@/lib/catalog';
import {mainMenus} from '@/lib/navigation';
export default function Header(){
 const pathname=usePathname();
 const [sidebar,setSidebar]=useState(false);
 const [dark,setDark]=useState(false);
 const [openMenu,setOpenMenu]=useState<string|null>(null);
 const navRef=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  setDark(window.localStorage.getItem('worksheet-theme')==='dark');
  document.documentElement.dataset.theme=window.localStorage.getItem('worksheet-theme')==='dark'?'dark':'light';
 },[]);
 useEffect(()=>{setSidebar(window.matchMedia('(min-width: 1250px)').matches);},[]);
 useEffect(()=>{if(window.innerWidth<1250)setSidebar(false);setOpenMenu(null);},[pathname]);
 useEffect(()=>{
  const close=(event:PointerEvent)=>{
   if(navRef.current&&!navRef.current.contains(event.target as Node))setOpenMenu(null);
  };
  const keyboard=(event:KeyboardEvent)=>{
   if(event.key==='Escape')setOpenMenu(null);
  };
  document.addEventListener('pointerdown',close);
  document.addEventListener('keydown',keyboard);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',keyboard);};
 },[]);
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
    <nav className="main-subject-nav simplified-main-menu" aria-label="Main subjects" ref={navRef}
      onMouseLeave={()=>setOpenMenu(null)}>
     {mainMenus.map(menu=><div className={'top-subject-dropdown '+(openMenu===menu.key?'is-active':'')}
       key={menu.key} onMouseEnter={()=>{if(window.matchMedia('(hover:hover)').matches)setOpenMenu(menu.key);}}>
      <button type="button" className="top-menu-trigger" aria-expanded={openMenu===menu.key}
       aria-controls={'menu-'+menu.key} onClick={()=>setOpenMenu(current=>current===menu.key?null:menu.key)}>
       {menu.name}<ChevronDown size={17}/></button>
      {openMenu===menu.key&&<div className="top-subject-panel" id={'menu-'+menu.key}
        onClick={()=>setOpenMenu(null)}>
       <Link className="top-subject-all" href={menu.href}>All {menu.name}</Link>
       <div className="top-subject-links">{menu.items.map(item=>
        <Link key={item.name} href={item.href}>{item.name}</Link>)}</div>
       <div className="top-subject-grade-title">GRADES 1–6</div>
       <div className="top-subject-grade-links">{grades.map(grade=>
        <Link href={'/worksheets?subject='+menu.gradeSubject+'&grade='+grade.slug}
        key={grade.slug}>{grade.title.replace('Grade ','')}</Link>)}</div>
      </div>}
     </div>)}
    </nav>
    <div className="single-nav-actions">
      <button className="icon-control header-theme" type="button" onClick={changeTheme}
        aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Light mode':'Dark mode'}>
        {dark?<Sun size={21}/>:<Moon size={21}/>}</button>
      <Link className="icon-control header-profile" href="/contribute" aria-label="Profile and account" title="Profile"><UserRound size={21}/></Link>
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
 
  </aside>
 </>;
}
