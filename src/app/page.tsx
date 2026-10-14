
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,BookOpen,Calculator,Palette,Search,Shuffle,SpellCheck,FileText,Star,Check} from 'lucide-react';
import WorksheetCard from '@/components/worksheet-card';
import {samples} from '@/lib/catalog';
export default function Home(){return <>
<section className="hero"><div className="container hero-grid">
  <div className="hero-copy"><div className="eyebrow"><span className="sparkle">✳</span> PRINTABLE LEARNING, MADE SIMPLE</div>
    <h1>Big ideas start with <em>little worksheets.</em></h1>
    <p className="hero-description">Discover fun learning activities for curious kids. Browse ready-made worksheets or create your own in just a few clicks.</p>
    <div className="hero-buttons"><Link href="/worksheets" className="button button-dark">Explore worksheets <ArrowRight size={18}/></Link><Link href="/create" className="button button-outline">Make my own <ArrowUpRight size={17}/></Link></div>
    <div className="hero-note"><span className="tick"><Check size={13}/></span> No sign-up needed <span className="dot">·</span> Free to create and print</div>
  </div>
  <div className="hero-art" aria-label="Illustration of printable worksheets and pencils" role="img">
    <div className="art-bubble art-bubble-1">✷</div><div className="art-bubble art-bubble-2">✳</div>
    <div className="art-paper art-back"><span className="art-topline">MATH PRACTICE</span><span className="math-equation">2 + 3 = ?</span><span className="math-equation">6 − 1 = ?</span><span className="math-equation">4 + 4 = ?</span></div>
    <div className="art-paper art-front"><div className="art-sticker">A+</div><span className="art-topline">WORD SEARCH</span><strong>Learning is fun!</strong><div className="art-grid">{'ANIMALCATDOGPENCILREADBOOKFUNLION'.slice(0,25).split('').map((letter,i)=><span key={i}>{letter}</span>)}</div><span className="art-wordbank">CAT &nbsp; DOG &nbsp; LION</span></div>
    <div className="art-pencil">✎</div>
  </div>
</div></section>
<section className="category-section section"><div className="container">
  <div className="section-heading"><div><div className="section-kicker">BROWSE BY SUBJECT</div><h2>Something fun for <em>every learner.</em></h2></div><p>From first letters to big number adventures, find just-right activities for every little milestone.</p></div>
  <div className="category-grid">
    <Link href="/english" className="category-card category-peach"><span className="category-icon"><BookOpen size={30}/></span><span className="category-number">01 / 03</span><h3>English</h3><p>Letters, spelling, reading & words</p><span className="category-link">Explore English <ArrowUpRight size={17}/></span></Link>
    <Link href="/math" className="category-card category-blue"><span className="category-icon"><Calculator size={30}/></span><span className="category-number">02 / 03</span><h3>Mathematics</h3><p>Counting, addition, patterns & more</p><span className="category-link">Explore Math <ArrowUpRight size={17}/></span></Link>
    <Link href="/coloring" className="category-card category-mint"><span className="category-icon"><Palette size={30}/></span><span className="category-number">03 / 03</span><h3>Coloring</h3><p>Creative pages for little artists</p><span className="category-link">Explore Coloring <ArrowUpRight size={17}/></span></Link>
  </div>
</div></section>
<section className="section maker-section"><div className="container maker-grid"><div className="maker-intro"><div className="section-kicker">YOUR IDEAS, YOUR WORKSHEETS</div><h2>Let's make some <em>learning magic.</em></h2><p>Choose an activity, add your own words and turn them into printable practice in seconds. No account, no fuss.</p><Link href="/create" className="button button-dark">Try worksheet maker <ArrowRight size={17}/></Link></div>
<div className="maker-options">
  <Link href="/create/word-search"><span className="maker-icon maker-yellow"><Search size={25}/></span><span><strong>Word Search</strong><small>Find the hidden words</small></span><ArrowUpRight size={20}/></Link>
  <Link href="/create/word-scramble"><span className="maker-icon maker-lavender"><Shuffle size={25}/></span><span><strong>Word Scramble</strong><small>Unscramble the letters</small></span><ArrowUpRight size={20}/></Link>
  <Link href="/create/missing-letters"><span className="maker-icon maker-pink"><SpellCheck size={25}/></span><span><strong>Missing Letters</strong><small>Fill in the blanks</small></span><ArrowUpRight size={20}/></Link>
</div></div></section>
<section className="section popular-section"><div className="container"><div className="section-heading heading-aligned"><div><div className="section-kicker">LITTLE PICKS, BIG SMILES</div><h2>A peek at the <em>worksheet library.</em></h2></div><Link href="/worksheets" className="text-link">Browse the library <ArrowUpRight size={18}/></Link></div>
<div className="worksheet-grid">{samples.slice(0,3).map(w=><WorksheetCard key={w.slug} item={w}/>)}</div><p className="sample-disclaimer">These are example listings while our downloadable worksheet library is being prepared. The interactive makers above are ready to try.</p></div></section>
<section className="last-cta"><div className="container"><div className="cta-box"><div><span className="section-kicker">READY, SET, CREATE</span><h2>A whole world of learning,<br/><em>one worksheet at a time.</em></h2></div><Link href="/create" className="button button-white">Create a worksheet <ArrowUpRight size={17}/></Link><Star className="cta-star" size={105} strokeWidth={1}/></div></div></section>
</>}
