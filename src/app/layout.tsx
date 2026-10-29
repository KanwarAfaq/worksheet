import type {Metadata} from 'next';
import Header from '@/components/site-header';
import Footer from '@/components/site-footer';
import {siteOrigin,indexingEnabled} from '@/lib/site-url';
import {siteName,siteDescription,websiteGraph} from '@/lib/seo';
import StructuredData from '@/components/structured-data';
import SeoBlock from '@/components/seo-block';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import './globals.css';
import './theme.css';

export const metadata:Metadata={
 title:{default:'Free Printable Worksheets for Grades 1–6 | Worksheet Studio',template:'%s | Worksheet Studio'},
 description:siteDescription,
 metadataBase:new URL(siteOrigin()),
 applicationName:siteName,
 verification:{google:process.env.GOOGLE_SITE_VERIFICATION||undefined},
 category:'education',
 robots:{index:indexingEnabled,follow:indexingEnabled,
  googleBot:{index:indexingEnabled,follow:indexingEnabled,'max-snippet':-1,'max-image-preview':'large','max-video-preview':-1}},
 openGraph:{type:'website',locale:'en_US',siteName:siteName,title:siteName,description:siteDescription,url:'/',images:[{url:'/opengraph-image',width:1200,height:630,alt:'Worksheet Studio printable learning resources'}]},
 twitter:{card:'summary_large_image',title:siteName,description:siteDescription,images:['/opengraph-image']},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="en"><body><StructuredData value={websiteGraph()}/><Header/><main>{children}<SeoBlock/></main><Footer/><Analytics/><SpeedInsights/></body></html>;
}
