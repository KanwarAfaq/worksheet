import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight,BookOpen,Search,Shuffle,SpellCheck,PencilLine} from 'lucide-react';
import FormatHero from '@/components/format-hero';
import PublishedWorksheetCard from '@/components/published-worksheet-card';
import WorksheetCard from '@/components/worksheet-card';
import {publishedWorksheets} from '@/lib/public-catalog';
import {subjects,samples} from '@/lib/catalog';
import {indexableRobots} from '@/lib/seo';
import {questions} from '@/lib/faq';
export const dynamic='force-dynamic';
export const metadata:Metadata={
 title:'Free Printable Worksheets & Worksheet Maker (Grades 1–6)',
 description:'Free printable worksheets for Grades 1–6, plus a free worksheet maker: create your own word search, word scramble, missing-letters and tracing pages with answer keys.',
 alternates:{canonical:'/'},robots:indexableRobots()
};
const makers=[
 {href:'/create/word-search',label:'Word search',icon:Search},
 {href:'/create/word-scramble',label:'Word scramble',icon:Shuffle},
 {href:'/create/missing-letters',label:'Missing letters',icon:SpellCheck},
 {href:'/create/templates',label:'Tracing',icon:PencilLine},
];
export default async function Home(){
 const published=await publishedWorksheets();
 return <>
   <FormatHero/>

   <section className="simple-home-section container">
    <div className="simple-section-heading"><h2>Browse printable worksheets by subject</h2><Link href="/worksheets">View all <ArrowRight size={18}/></Link></div>
    <div className="simple-subjects three-main-subjects">{subjects.filter(subject=>['math','reading','colors'].includes(subject.slug)).map(subject=>
      <Link key={subject.slug} href={'/'+subject.slug} className={'simple-subject '+subject.tint}>
       <BookOpen size={29}/><strong>{subject.slug==='reading'?'English':subject.slug==='colors'?'Color':subject.title}</strong>
      </Link>)}</div>
   </section>
   <section className="simple-home-section simple-maker-section">
    <div className="container">
      <div className="simple-section-heading"><h2>Make your own printable worksheet</h2><Link href="/create">All makers <ArrowRight size={18}/></Link></div>
      <div className="simple-makers">{makers.map(m=><Link href={m.href} key={m.href}>
        <m.icon size={30}/><strong>{m.label}</strong><ArrowRight size={18}/>
      </Link>)}</div>
    </div>
   </section>
   <section className="simple-home-section container">
    <div className="simple-section-heading"><h2>Free printable worksheets to try</h2><Link href="/worksheets">Browse all <ArrowRight size={18}/></Link></div>
    <div className="worksheet-grid">{published.length?
      published.slice(0,6).map(item=><PublishedWorksheetCard key={item.id} item={item}/>):
      samples.slice(0,3).map(item=><WorksheetCard key={item.slug} item={item}/>)}
    </div>
    {!published.length&&<p className="sample-disclaimer">Examples only. Downloadable worksheets will appear here when published.</p>}
   </section>
 <section className="simple-home-section container" aria-labelledby="home-faq">
    <div className="simple-section-heading"><h2 id="home-faq">Printable worksheet questions</h2><Link href="/faq">All questions <ArrowRight size={18}/></Link></div>
    <ul className="seo-faq-list home-faq">{questions.slice(0,4).map(({q,a})=><li className="seo-faq-item" key={q}><h3>{q}</h3><p>{a}</p></li>)}</ul>
   </section>
 </>;
}
