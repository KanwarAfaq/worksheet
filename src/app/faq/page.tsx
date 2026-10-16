import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {indexableRobots,breadcrumbs,absoluteUrl} from '@/lib/seo';
import StructuredData from '@/components/structured-data';

export const metadata:Metadata={
 title:'Frequently Asked Questions About Printable Worksheets',
 description:'Answers about Worksheet Studio: free printable PDFs, supported grades, worksheet makers, answer keys, copyright rules, accounts and downloads.',
 alternates:{canonical:'/faq'},robots:indexableRobots()
};
const questions=[
 {q:'Are Worksheet Studio worksheets free?',a:'The worksheet makers are free to use. Published resources in the public library are free to download. Some tools, such as the AI-assisted worksheet maker, require an account and may have usage limits.'},
 {q:'Which grades are supported?',a:'The site organizes worksheets for Grades 1 through 6. The catalog also includes kindergarten and early-learning activities. Choose a subject and grade to find suitable practice.'},
 {q:'Can I download a worksheet as PDF?',a:'Yes. Published PDF worksheets have a download link. Classic worksheet makers let you generate and save a PDF in your browser. A library listing shows only the file types that are actually available.'},
 {q:'Can I edit worksheets before printing?',a:'The classic worksheet makers allow you to edit the word list, title, instructions and activity settings. Uploaded PDF files are generally print-ready rather than editable documents.'},
 {q:'Do worksheets include teacher answer keys?',a:'Some generators offer a separate answer key. Uploaded worksheets may have a private teacher answer key; availability depends on the worksheet and access permissions.'},
 {q:'Do I need an account to make a worksheet?',a:'The classic worksheet makers work without signing in. An account is required to upload worksheets or use account-based features, including the AI-assisted maker.'},
 {q:'How many worksheets can I upload for free?',a:'Verified accounts currently have up to five free worksheet slots. New submissions are reviewed before they are made public; private subscriptions are not available yet.'},
 {q:'May I upload worksheets created by someone else?',a:'Only upload files you created or have explicit rights to redistribute. A file being available on another website does not automatically grant permission to republish it.'},
 {q:'Does the site work with A4 and US Letter paper?',a:'The classic worksheet makers support A4 and US Letter layouts. When printing an uploaded file, check the paper size and scaling in your printer dialog.'}
];
export default function FAQPage(){
 const ld={'@context':'https://schema.org','@type':'FAQPage','@id':absoluteUrl('/faq#faq'),
  mainEntity:questions.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))};
 return <div className="container inner-page seo-prose-page">
  <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:'Frequently asked questions',url:'/faq'}])}/>
  <StructuredData value={ld}/>
  <div className="section-kicker">HELP & ANSWERS</div>
  <h1>Worksheet <em>questions, answered.</em></h1>
  <p className="page-lead">Quick answers for parents, teachers and anyone preparing printable learning activities.</p>
  <h2>Frequently asked questions about printable worksheets</h2>
  <div className="seo-faq-list">{questions.map(({q,a})=><section className="seo-faq-item" key={q}>
   <h2>{q}</h2><p>{a}</p></section>)}</div>
  <div className="bottom-prompt">Ready to create an activity?<Link href="/create">Try a free maker <ArrowRight size={18}/></Link></div>
 </div>;
}
