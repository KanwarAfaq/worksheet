import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {indexableRobots,breadcrumbs,absoluteUrl} from '@/lib/seo';
import StructuredData from '@/components/structured-data';
import {questions} from '@/lib/faq';

export const metadata:Metadata={
 title:'Frequently Asked Questions About Printable Worksheets',
 description:'Answers about Worksheet Studio: free printable PDFs, supported grades, worksheet makers, answer keys, copyright rules, accounts and downloads.',
 alternates:{canonical:'/faq'},robots:indexableRobots()
};
export default function FAQPage(){
 const ld={'@context':'https://schema.org','@type':'FAQPage','@id':absoluteUrl('/faq#faq'),
  mainEntity:questions.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))};
 return <div className="container inner-page seo-prose-page">
  <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:'Frequently asked questions',url:'/faq'}])}/>
  <StructuredData value={ld}/>
  <h1>Worksheet <em>questions, answered</em></h1>
  <p className="page-lead">Quick worksheet answers for parents and teachers: printing, makers, answer keys and accounts.</p>
  <h2>Frequently asked questions about printable worksheets</h2>
  <div className="seo-faq-list">{questions.map(({q,a})=><section className="seo-faq-item" key={q}>
   <h2>{q}</h2><p>{a}</p></section>)}</div>
  <div className="bottom-prompt">Ready to create an activity?<Link href="/create">Try a free maker <ArrowRight size={18}/></Link></div>
 </div>;
}
