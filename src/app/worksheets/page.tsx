
import type {Metadata} from 'next';
import Link from 'next/link';
import WorksheetCard from '@/components/worksheet-card';
import {samples} from '@/lib/catalog';
import {ArrowRight} from 'lucide-react';
export const metadata:Metadata={title:'Worksheet Library',description:'Browse sample worksheets for reading, mathematics and coloring.'};
export default async function Worksheets({searchParams}:{searchParams:Promise<{subject?:string}>}){
const {subject}=await searchParams;
const list=samples.filter(x=>!subject||x.subject===subject);
return <div className="container inner-page"><div className="section-kicker">THE WORKSHEET LIBRARY</div><h1>Find a little <em>inspiration.</em></h1><p className="page-lead">Explore sample worksheet ideas while our curated downloadable library is in preparation. Want something unique? Make your own worksheet today.</p>
<div className="filter-bar">{[['All',''],['English','english'],['Math','math'],['Coloring','coloring']].map(([label,value])=><Link key={label} className={'filter-pill '+((subject||'')===value?'active':'')} href={value?'/worksheets?subject='+value:'/worksheets'}>{label}</Link>)}</div>
<div className="worksheet-grid">{list.map(item=><WorksheetCard item={item} key={item.slug}/>)}</div>
<p className="sample-disclaimer">Sample cards demonstrate the catalog layout; files have not been uploaded or published yet.</p>
<div className="bottom-prompt">Need a custom activity? <Link href="/create">Open the free worksheet maker <ArrowRight size={17}/></Link></div>
</div>}
