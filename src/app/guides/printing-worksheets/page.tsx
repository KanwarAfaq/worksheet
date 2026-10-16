import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {absoluteUrl,breadcrumbs,indexableRobots} from '@/lib/seo';
import StructuredData from '@/components/structured-data';

export const metadata:Metadata={
 title:'How to Print a Worksheet: A4, US Letter and Answer Keys',
 description:'Step-by-step instructions for printing worksheets at home or school, choosing paper sizes, checking previews and keeping teacher answer keys separate.',
 alternates:{canonical:'/guides/printing-worksheets'},robots:indexableRobots()
};
export default function PrintingGuide(){
 const steps=[
  {h:'Choose the right worksheet',t:'Pick the subject and grade, then read the worksheet description to make sure the skills and difficulty match your learners. Only published resources have download buttons.'},
  {h:'Open the preview',t:'For a PDF or image, use the worksheet preview to check the content, page orientation and readability before printing. If a Word file is available elsewhere, inspect its layout in a word processor.'},
  {h:'Match the paper size',t:'A4 measures 210 × 297 mm and US Letter measures 8.5 × 11 inches. In the classic worksheet makers, choose A4 or Letter before you export. For uploaded files, prefer the size the document was designed for.'},
  {h:'Check printer scaling and margins',t:'Use “Fit to printable area” only when text is being cropped. Confirm that line spacing, writing boxes and grid squares remain large enough for students to use.'},
  {h:'Separate student pages and answer keys',t:'If the activity provides an answer key, keep it in a separate teacher copy. Check exported PDFs to avoid accidentally distributing solutions to students.'},
  {h:'Use worksheets thoughtfully',t:'Pair printables with explanation, discussion and feedback rather than relying on repeated drills alone. Adjust instructions or word lists in the maker for the learning goal.'}
 ];
 return <div className="container inner-page seo-prose-page">
  <StructuredData value={breadcrumbs([{label:'Home',url:'/'},{label:'Printing guide',url:'/guides/printing-worksheets'}])}/>
  <StructuredData value={{'@context':'https://schema.org','@type':'HowTo',name:'How to print a worksheet',
   description:'Choose, preview, and print worksheets with the correct page size and a separate answer key.',
   step:steps.map((s,i)=>({'@type':'HowToStep',position:i+1,name:s.h,text:s.t,url:absoluteUrl('/guides/printing-worksheets#step-'+(i+1))}))}}/>
  <div className="section-kicker">PRACTICAL PRINTING GUIDE</div>
  <h1>How to print <em>a worksheet.</em></h1>
  <p className="page-lead">Learn how to print a worksheet: choose and preview classroom worksheets, then print on A4 or US Letter paper. For additional printing help, see <a href="https://helpx.adobe.com/acrobat/using/print-pdfs.html" target="_blank" rel="noopener noreferrer">Adobe's PDF printing guide</a>.</p>
  <ol className="seo-guide-steps">{steps.map((step,i)=><li id={'step-'+(i+1)} key={i}>
    <h2>{step.h}</h2><p>{step.t}</p>
   </li>)}</ol>
  <div className="bottom-prompt">Want to make your own printable?<Link href="/create">Open worksheet makers <ArrowRight size={18}/></Link></div>
 </div>;
}
