
import Link from 'next/link';
import {BookOpen, Heart} from 'lucide-react';
export default function Footer(){return <footer className="footer"><div className="container footer-inner">
  <div><Link href="/" className="brand"><span className="brand-icon"><BookOpen size={19}/></span><span>worksheet<span className="brand-accent">studio.</span></span></Link><p>Little resources. Big learning moments.</p></div>
  <div className="footer-links"><Link href="/worksheets">Worksheet library</Link><Link href="/create">Worksheet makers</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link></div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Worksheet Studio. All rights reserved.</span><span>Made for curious minds <Heart size={13} fill="currentColor"/></span></div>
</div></footer>}
