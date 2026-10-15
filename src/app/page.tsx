
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,BookOpen,Calculator,Palette,Search,Shuffle,SpellCheck,FileText,Star,Check} from 'lucide-react';
import WorksheetCard from '@/components/worksheet-card';
import FormatHero from '@/components/format-hero';
import {samples,subjects} from '@/lib/catalog';
import PublishedWorksheetCard from '@/components/published-worksheet-card';
import {publishedWorksheets} from '@/lib/public-catalog';
import type {Metadata} from 'next';
import {indexableRobots} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata:Metadata={
 title:'Free Printable Worksheets for Grades 1–6',
 description:'Find printable math, reading, spelling and writing worksheets for Grades 1–6. Browse PDF activities or make custom word searches and tracing sheets for free.',
 alternates:{canonical:'/'},robots:indexableRobots()
};
export default async function Home(){
 const published=await publishedWorksheets();
 return <>
<FormatHero/>
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
  <div className="section-heading"><div><div className="section-kicker">BROWSE BY SUBJECT</div><h2>Something fun for <em>every learner.</em></h2></div><p>Eight subjects, with clear Grade 1–6 paths to help you discover just-right practice.</p></div>
  <div className="category-grid subjects-eight-grid">
    {subjects.map((sub,i)=><Link href={'/'+sub.slug} key={sub.slug} className={'category-card category-'+sub.tint}>
      <span className="category-icon"><BookOpen size={29}/></span>
      <span className="category-number">{String(i+1).padStart(2,'0')} / 08</span>
      <h3>{sub.title}</h3><p>{sub.description}</p>
      <span className="category-link">Explore {sub.title}<ArrowUpRight size={17}/></span>
    </Link>)}
  </div>
</div></section>
<section className="section maker-section"><div className="container maker-grid"><div className="maker-intro"><div className="section-kicker">YOUR IDEAS, YOUR WORKSHEETS</div><h2>Let's make some <em>learning magic.</em></h2><p>Choose an activity, add your own words and turn them into printable practice in seconds. No account, no fuss.</p><Link href="/create" className="button button-dark">Try worksheet maker <ArrowRight size={17}/></Link></div>
<div className="maker-options">
  <Link href="/create/word-search"><span className="maker-icon maker-yellow"><Search size={25}/></span><span><strong>Word Search</strong><small>Find the hidden words</small></span><ArrowUpRight size={20}/></Link>
  <Link href="/create/word-scramble"><span className="maker-icon maker-lavender"><Shuffle size={25}/></span><span><strong>Word Scramble</strong><small>Unscramble the letters</small></span><ArrowUpRight size={20}/></Link>
  <Link href="/create/missing-letters"><span className="maker-icon maker-pink"><SpellCheck size={25}/></span><span><strong>Missing Letters</strong><small>Fill in the blanks</small></span><ArrowUpRight size={20}/></Link>
</div></div></section>
<section className="section popular-section"><div className="container"><div className="section-heading heading-aligned"><div><div className="section-kicker">LITTLE PICKS, BIG SMILES</div><h2>A peek at the <em>worksheet library.</em></h2></div><Link href="/worksheets" className="text-link">Browse the library <ArrowUpRight size={18}/></Link></div>
<div className="worksheet-grid">{published.length?published.slice(0,6).map(w=><PublishedWorksheetCard key={w.id} item={w}/>):samples.slice(0,3).map(w=><WorksheetCard key={w.slug} item={w}/>)}</div><p className="sample-disclaimer">{published.length?'Published learning resources from the worksheet library.':'Sample listings; they are not downloadable until publication.'}</p></div></section>
<section className="container seo-home-help section" aria-labelledby="home-faq-heading">
 <div className="section-kicker">COMMON QUESTIONS</div>
 <h2 id="home-faq-heading">Plan, create, and print <em>with confidence.</em></h2>
 <div className="seo-home-help-grid">
   <article><h3>Which grades are covered?</h3><p>Browse learning activities for Grades 1–6, plus kindergarten and early-reading practice.</p></article>
   <article><h3>Can I make my own worksheet?</h3><p>Yes. Customize words, instructions and difficulty in free printable worksheet makers.</p></article>
   <article><h3>Are downloads always available?</h3><p>Published worksheets show their actual file formats. Sample listings are clearly marked and have no download button.</p></article>
 </div>
 <Link href="/faq" className="text-link">More questions and answers <ArrowRight size={17}/></Link>
</section>
<section className="last-cta"><div className="container"><div className="cta-box"><div><span className="section-kicker">READY, SET, CREATE</span><h2>A whole world of learning,<br/><em>one worksheet at a time.</em></h2></div><Link href="/create" className="button button-white">Create a worksheet <ArrowUpRight size={17}/></Link><Star className="cta-star" size={105} strokeWidth={1}/></div></div></section>
</>}
