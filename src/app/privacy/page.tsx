import type {Metadata} from 'next';
import {indexableRobots} from '@/lib/seo';
export const metadata:Metadata={
 title:'Privacy and Data Use',
 description:'Learn what data Worksheet Studio uses for accounts, saved worksheets, private storage and site operation.',
 alternates:{canonical:'/privacy'},robots:indexableRobots()
};
export default function Privacy(){
 return <section className="container inner-page prose-page seo-prose-page">
  <div className="section-kicker">SITE PRIVACY</div>
  <h1>Privacy <em>and your worksheets.</em></h1>
  <p>Worksheet Studio offers public worksheet pages, free worksheet makers, and optional user accounts. Classic worksheet makers process your entered words in the browser; creating an account, uploading files or using account-based AI features involves server-side services.</p>
  <h2>Accounts and activity</h2>
  <p>Authentication is provided through Supabase. Signing in can involve an email address, authentication identifiers and login events. Account features may store a profile photo, saved and liked worksheet references, uploaded worksheet metadata and user-created resources.</p>
  <h2>Uploaded files</h2>
  <p>Uploaded worksheets and profile files are stored in private Cloudflare R2 storage. Publicly approved worksheets are delivered through first-party website endpoints; unpublished content is not available in the public catalog. Only upload materials you have the right to share, and do not include identifying information about students.</p>
  <h2>Service providers and logs</h2>
  <p>Vercel hosts the website. Supabase processes database and authentication data. Cloudflare provides private file storage. These providers may process technical information such as IP addresses and request logs as needed to operate and secure the service. The AI-assisted maker may submit worksheet prompts to configured AI providers when you use that feature.</p>
  <h2>Site status and privacy requests</h2>
  <p>This is a development-stage privacy notice, not a complete production privacy policy. Before public launch, the site owner needs to provide a dedicated contact method, retention schedule, account deletion/request workflow, applicable legal terms and details of any additional analytics or AI processors.</p>
  <p>To limit disclosure, do not include private student data in worksheet prompts or uploads.</p>
 </section>;
}
