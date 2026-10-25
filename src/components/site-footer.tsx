import Link from 'next/link';
import {BookOpen,ArrowUpRight} from 'lucide-react';
import {footerRefs} from '@/lib/page-seo';
export default function Footer(){
 return <footer className="footer"><div className="container footer-inner">
   <div className="footer-brand"><Link href="/" className="brand"><span className="brand-icon"><BookOpen size={19}/></span><span>worksheet<span className="brand-accent">studio</span></span></Link>
     <p>Free printable worksheets for Grades 1–6.</p></div>
   <nav className="footer-col" aria-label="Worksheets">
    <h2>Worksheets</h2>
    <Link href="/worksheets">Worksheet library</Link>
    <Link href="/math">Math</Link>
    <Link href="/reading">English</Link>
    <Link href="/colors">Color</Link>
   </nav>
   <nav className="footer-col" aria-label="Makers">
    <h2>Make one</h2>
    <Link href="/create/word-search">Word search</Link>
    <Link href="/create/word-scramble">Word scramble</Link>
    <Link href="/create/missing-letters">Missing letters</Link>
    <Link href="/create/coloring">Coloring pages</Link>
   </nav>
   <nav className="footer-col" aria-label="Learn more">
    <h2>Learn more</h2>
    {footerRefs.map(r=><a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer">{r.label}<ArrowUpRight size={13}/></a>)}
    <Link href="/guides/printing-worksheets">Printing guide</Link>
   </nav>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} Worksheet Studio</span>
    <span className="footer-legal"><Link href="/faq">FAQ</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link></span></div>
  </div></footer>;
}
