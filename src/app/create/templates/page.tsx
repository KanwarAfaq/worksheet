import type {Metadata} from 'next';
import Link from 'next/link';
import {indexableRobots} from '@/lib/seo';
import TemplateMaker from '@/components/template-maker';

export const metadata:Metadata={
 title:'Free Custom Worksheet Templates – Edit & Print',
 description:'Create your own worksheet template free: edit words, titles and instructions for tracing, word search, scramble or missing letters. Download PDF or PNG.',
 alternates:{canonical:'/create/templates'},
 robots:indexableRobots()
};

export default function Page(){
 return <>
  <TemplateMaker/>
  <section className="container inner-page" aria-labelledby="custom-worksheet-guide" style={{paddingTop:24,paddingBottom:48}}>
   <h2 id="custom-worksheet-guide">How to create your own printable worksheet template</h2>
   <p>Start by choosing one of the four editable templates above. Letter tracing helps learners practise handwriting; word search encourages vocabulary recognition; word scramble asks learners to reorder letters; and missing letters supports spelling practice. Each template uses the same simple editor, so you can prepare multiple activities from one word list.</p>
   <ol>
    <li><strong>Choose an activity.</strong> Select tracing, word search, word scramble or missing letters, depending on the lesson goal.</li>
    <li><strong>Add your own words.</strong> Replace the sample word bank with classroom vocabulary or age-appropriate spelling words, one item per line.</li>
    <li><strong>Personalize the page.</strong> Edit the worksheet title and student instructions. The live preview updates as you work.</li>
    <li><strong>Review the puzzle.</strong> Check words, spelling and the preview. You can shuffle a worksheet to create another version.</li>
    <li><strong>Download and print.</strong> Save the student worksheet as PDF or PNG. For applicable activities, download the separate teacher PDF and check the answers before class.</li>
   </ol>
   <h2>Which worksheet format should teachers choose?</h2>
   <p>For early handwriting lessons, start with a short tracing sheet and a manageable set of letters or words. Word searches and scrambles can reinforce familiar vocabulary, while missing-letter sheets practise remembering letter order. Adjust the word list to each learner rather than relying on a generic grade label.</p>
   <p>The classic templates are free and work without sign-in. The PDF output uses A4 portrait pages, and PNG is available for an individual page. Review the result before sharing, especially longer words and puzzle layouts.</p>
   <p>Explore the <Link href="/create">other worksheet makers</Link>, read the <Link href="/guides/printing-worksheets">worksheet printing guide</Link>, or browse <Link href="/worksheets">ready-to-print worksheets</Link>.</p>
  </section>
 </>;
}
