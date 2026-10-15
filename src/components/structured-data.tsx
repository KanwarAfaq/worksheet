import {structuredData} from '@/lib/seo';
export default function StructuredData({value}:{value:Record<string,unknown>|Record<string,unknown>[]}){
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:structuredData(value)}}/>;
}
