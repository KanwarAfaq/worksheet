import type {Metadata} from 'next';
import Link from 'next/link';
import {indexableRobots} from '@/lib/seo';
export const metadata:Metadata={
 title:'About Worksheet Studio',
 description:'Worksheet Studio helps parents and educators create free printable practice and discover community resources for Grades 1–6.',
 alternates:{canonical:'/about'},robots:indexableRobots()
};
export default function About(){
 return <section className="container inner-page prose-page seo-prose-page">
 <div className="section-kicker">ABOUT WORKSHEET STUDIO</div>
 <h1>Small pages. <em>Big possibilities.</em></h1>
 <p>Worksheet Studio provides free printable worksheet tools and is a free-first learning resource for families and educators. It offers worksheet makers, a categorized printable library, and optional accounts for creating and submitting resources.</p>
 <h2>Our approach to free printable worksheets</h2>
 <p>Choose a subject and grade, review the worksheet description, then preview a supported file before printing. Our classic makers help you customize the word list and directions yourself. Some account-based features, including AI-assisted generation, may require sign-in and usage limits.</p>
 <h2>Quality and rights</h2>
 <p>Submissions require a statement of redistribution rights and pass through a review process. Such checks do not by themselves guarantee that every uploaded resource is accurate or owned by its uploader. If you notice an issue, please report it through the support contact provided once the full public launch is complete.</p>
 <p>Need help getting started? See our <Link href="/faq">common questions</Link> or read the <Link href="/guides/printing-worksheets">printing guide</Link>.</p>
 </section>;
}
