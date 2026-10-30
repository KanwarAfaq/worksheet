
import type {Metadata} from 'next';
import {indexableRobots} from '@/lib/seo';
import Link from 'next/link';
import {Search,Shuffle,SpellCheck,ArrowUpRight,CheckCircle2,Sparkles,Layers3} from 'lucide-react';
export const metadata:Metadata={title:'Free Worksheet Maker: Create Your Own Printable Worksheet Templates',
 description:'Make free printable worksheets using customizable word search, spelling, missing letters and tracing templates, with PDF export.',
 alternates:{canonical:'/create'},robots:indexableRobots()};
const makers=[
  {href:'/create/templates',name:'4 Printable Templates',icon:Layers3,description:'Create tracing sheets, word searches, scrambles and missing-letter worksheets with editable content.',accent:'blue',tag:'NO SIGN-IN REQUIRED'},
  {href:'/create/ai',name:'AI Worksheet Maker',icon:Sparkles,description:'Create original grade-level questions and download student PDFs, PNGs and separate teacher keys.',accent:'mint',tag:'AI-ASSISTED · SIGN-IN'},
  {href:'/create/word-search',name:'Word Search',icon:Search,description:'Make a custom word hunt with a letter grid and teacher answer key.',accent:'yellow',tag:'FIND & DISCOVER'},
  {href:'/create/word-scramble',name:'Word Scramble',icon:Shuffle,description:'Mix up words into a playful spelling challenge with solutions.',accent:'lavender',tag:'MIX & SOLVE'},
  {href:'/create/missing-letters',name:'Missing Letters',icon:SpellCheck,description:'Give words some missing pieces and help learners fill them in.',accent:'pink',tag:'COMPLETE & LEARN'}
];
export default function Create(){return <div className="container inner-page"><h1>Free <em>worksheet maker</em></h1><p className="page-lead">Pick a free worksheet maker. Coloring and classic templates work without sign-in.</p>
<div className="create-grid">{makers.map(m=><Link href={m.href} key={m.href} className={'create-card create-'+m.accent}><span className="create-icon"><m.icon size={32}/></span><span className="section-kicker">{m.tag}</span><h2>{m.name}</h2><p>{m.description}</p><span className="create-open">Start creating <ArrowUpRight size={19}/></span></Link>)}</div>
<div className="create-benefits"><span><CheckCircle2 size={17}/> Free to use</span><span><CheckCircle2 size={17}/> No account needed</span><span><CheckCircle2 size={17}/> Printable A4 & Letter</span><span><CheckCircle2 size={17}/> Answer keys included</span></div></div>}
