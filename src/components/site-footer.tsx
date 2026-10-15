import Link from 'next/link';
import {BookOpen,Heart} from 'lucide-react';
export default function Footer(){
 return <footer className="footer"><div className="container footer-inner">
   <div><Link href="/" className="brand"><span className="brand-icon"><BookOpen size={19}/></span><span>worksheet<span className="brand-accent">studio.</span></span></Link>
     <p>Free worksheets for Grades 1–6.</p></div>
   <nav className="footer-links" aria-label="Helpful site links">
    <Link href="/worksheets">Worksheet library</Link>
    <Link href="/create">Makers</Link>
    <Link href="/faq">FAQ</Link>
    <Link href="/guides/printing-worksheets">Printing guide</Link>
    <Link href="/about">About</Link>
    <Link href="/privacy">Privacy</Link>
   </nav>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} Worksheet Studio. All rights reserved.</span>
    <span>For teachers and families <Heart size={13} fill="currentColor"/></span></div>
  </div></footer>;
}
