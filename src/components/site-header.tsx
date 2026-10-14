'use client';
import Link from 'next/link';
import {useState} from 'react';
import {BookOpen,Menu,X,ArrowUpRight,ChevronDown} from 'lucide-react';
import {grades,subjects} from '@/lib/catalog';

export default function Header(){
  const [mobileOpen,setMobileOpen]=useState(false);
  return <header className="site-header">
    <div className="container nav-inner">
      <Link href="/" className="brand" aria-label="Worksheet Studio home" onClick={()=>setMobileOpen(false)}>
        <span className="brand-icon"><BookOpen size={20} strokeWidth={2.5}/></span>
        <span>worksheet<span className="brand-accent">studio.</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Site navigation">
        <Link href="/worksheets">All worksheets</Link>
        <Link href="/worksheets?grade=grade-1">Grades 1–6</Link>
        <Link href="/create">Worksheet makers</Link>
      </nav>
      <Link href="/create" className="button button-dark header-cta">Create a worksheet <ArrowUpRight size={16}/></Link>
      <button type="button" className="menu-toggle" onClick={()=>setMobileOpen(open=>!open)}
        aria-expanded={mobileOpen} aria-controls="mobile-subject-nav"
        aria-label={mobileOpen?'Close navigation':'Open navigation'}>
        {mobileOpen?<X/>:<Menu/>}
      </button>
    </div>
    <nav className="subject-navigation" aria-label="Subjects and grade submenus">
      <div className="container subject-navigation-inner">
        {subjects.map(subject=><details className="subject-menu-item" key={subject.slug}>
          <summary>{subject.title}<ChevronDown size={14} aria-hidden="true"/></summary>
          <div className="subject-submenu">
            <Link className="subject-all-link" href={'/'+subject.slug}>All {subject.title} worksheets <ArrowUpRight size={14}/></Link>
            <div className="subject-submenu-caption">BROWSE BY GRADE</div>
            {grades.map(grade=><Link key={grade.slug} href={'/worksheets?subject='+subject.slug+'&grade='+grade.slug}>{grade.title}</Link>)}
          </div>
        </details>)}
      </div>
    </nav>
    {mobileOpen&&<nav id="mobile-subject-nav" className="mobile-nav mobile-subjects" aria-label="Mobile subjects and grades">
      <div className="mobile-shortcuts"><Link href="/worksheets" onClick={()=>setMobileOpen(false)}>All worksheets</Link><Link href="/create" onClick={()=>setMobileOpen(false)}>Worksheet makers</Link></div>
      {subjects.map(subject=><div className="mobile-subject-group" key={subject.slug}>
        <Link className="mobile-subject-title" href={'/'+subject.slug} onClick={()=>setMobileOpen(false)}>{subject.title} <ArrowUpRight size={15}/></Link>
        <div className="mobile-grade-links">
          {grades.map(grade=><Link key={grade.slug} href={'/worksheets?subject='+subject.slug+'&grade='+grade.slug} onClick={()=>setMobileOpen(false)}>{grade.title}</Link>)}
        </div>
      </div>)}
    </nav>}
  </header>;
}
