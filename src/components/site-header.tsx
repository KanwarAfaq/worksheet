
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Menu, X, ArrowUpRight } from 'lucide-react';
export default function Header(){
  const [open,setOpen]=useState(false);
  const nav=[['Worksheets','/worksheets'],['English','/english'],['Math','/math'],['Coloring','/coloring']];
  return <header className="site-header">
    <div className="container nav-inner">
      <Link href="/" className="brand" aria-label="Worksheet Studio home" onClick={()=>setOpen(false)}>
        <span className="brand-icon"><BookOpen size={20} strokeWidth={2.5}/></span>
        <span>worksheet<span className="brand-accent">studio.</span></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([title,url])=><Link href={url} key={url}>{title}</Link>)}
      </nav>
      <Link href="/create" className="button button-dark header-cta">Create a worksheet <ArrowUpRight size={16}/></Link>
      <button className="menu-toggle" type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<nav className="mobile-nav" aria-label="Mobile navigation">
      {nav.map(([title,url])=><Link href={url} key={url} onClick={()=>setOpen(false)}>{title}</Link>)}
      <Link href="/create" onClick={()=>setOpen(false)}>Create a worksheet ↗</Link>
    </nav>}
  </header>;
}
