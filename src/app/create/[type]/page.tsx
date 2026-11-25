
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import Link from 'next/link';
import GeneratorWorkspace from '@/components/generator-workspace';
import {typeNames,typeDescriptions} from '@/lib/catalog';
import {indexableRobots,breadcrumbs} from '@/lib/seo';
import StructuredData from '@/components/structured-data';
export function generateStaticParams(){return Object.keys(typeNames).map(type=>({type}));}
export async function generateMetadata({params}:{params:Promise<{type:string}>}):Promise<Metadata>{const {type}=await params;const seoTitles:Record<string,string>={'word-search':'Free Word Search Maker — Printable Puzzle PDF','word-scramble':'Free Word Scramble Maker — Printable Worksheet PDF','missing-letters':'Missing Letters Worksheet Maker — Free Printable PDF'};return {title:seoTitles[type]||'Free '+(typeNames[type]||'Worksheet')+' Maker — Printable PDF',
 description:type==='word-scramble'
  ? 'Make free word scramble worksheets from your own spelling words. Add optional first-letter hints, preview answers and print or download PDF on A4 or Letter paper.'
  : (typeDescriptions[type]||'Create printable worksheets')+' Customize the words and print a worksheet with a teacher answer key.',
 alternates:type in typeNames?{canonical:'/create/'+type}:undefined,
 robots:indexableRobots(type in typeNames)};}
export default async function Maker({params}:{params:Promise<{type:string}>}){const {type}=await params;if(!(type in typeNames))notFound();return <><StructuredData value={breadcrumbs([
 {label:'Home',url:'/'},{label:'Worksheet makers',url:'/create'},
 {label:typeNames[type],url:'/create/'+type}
 ])}/><GeneratorWorkspace type={type as 'word-search'|'word-scramble'|'missing-letters'}/>
 {type==='word-scramble'&&<section className="container inner-page" aria-labelledby="scramble-guide" style={{paddingTop:28,paddingBottom:48}}>
  <h2 id="scramble-guide">How to make a word scramble worksheet for spelling practice</h2>
  <p>Enter three to twenty-five words you want students to practise. The free word scramble maker rearranges the letters in each word and shows the student activity immediately. You can use a classroom vocabulary list or one of the example word banks to get started without signing in.</p>
  <ol>
   <li><strong>Enter the spelling words:</strong> put each word on a new line, or separate the words with commas.</li>
   <li><strong>Set the worksheet title and instructions:</strong> explain what students should do and choose whether to show first-letter and word-length hints.</li>
   <li><strong>Shuffle a new version:</strong> regenerate the scrambled letters to make another practice sheet from the same words.</li>
   <li><strong>Check the solutions:</strong> switch between the student and answer-key previews before sharing the activity.</li>
   <li><strong>Print or download:</strong> select A4 or US Letter, choose portrait or landscape, and download a PDF. You can include a separate teacher answer key.</li>
  </ol>
  <h2>Choose words students can reasonably solve</h2>
  <p>For beginners, use familiar short nouns and a small word bank. For older learners, try topic vocabulary or academic terms already introduced in class. A scrambled spelling activity is best used as reinforcement, not as a substitute for explaining what the words mean. Review the generated output before printing, particularly when a word contains uncommon spelling or repeated letters.</p>
  <p>You can also try the <Link href="/create/word-search">word search maker</Link>, the <Link href="/create/missing-letters">missing-letters maker</Link> or <Link href="/create/templates">editable worksheet templates</Link>. For printer settings and paper sizing, see the <Link href="/guides/printing-worksheets">printing guide</Link>.</p>
 </section>}
 </>;}
