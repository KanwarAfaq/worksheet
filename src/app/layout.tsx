
import type {Metadata} from 'next';
import Header from '@/components/site-header';
import Footer from '@/components/site-footer';
import './globals.css';
export const metadata:Metadata={title:{default:'Worksheet Studio — Free Printable Worksheets & Makers',template:'%s | Worksheet Studio'},description:'Explore printable practice for English, math, and coloring, or make your own word searches, scrambles, and missing-letter activities. Free and easy to use.',metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://example.com')};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
