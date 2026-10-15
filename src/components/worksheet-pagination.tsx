import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
type Query={subject?:string;grade?:string;format?:string;q?:string};
export default function WorksheetPagination({page,pages,total,base,filters={}}:
 {page:number;pages:number;total:number;base:string;filters?:Query}){
 if(pages<=1)return null;
 const href=(number:number)=>{
  const params=new URLSearchParams();
  for(const [key,value] of Object.entries(filters))if(value)params.set(key,value);
  if(number>1)params.set('page',String(number));
  const query=params.toString();
  return base+(query?'?'+query:'');
 };
 const start=Math.max(1,Math.min(page-2,pages-4));
 const end=Math.min(pages,start+4);
 return <nav className="worksheet-pagination" aria-label="Worksheet pages">
  <span>{total} worksheets · 12 per page</span>
  <div className="pagination-links">
   {page>1&&<Link href={href(page-1)} aria-label="Previous page"><ArrowLeft size={17}/></Link>}
   {Array.from({length:end-start+1},(_,i)=>i+start).map(n=><Link href={href(n)} key={n}
    aria-current={n===page?'page':undefined} className={n===page?'current':''}>{n}</Link>)}
   {page<pages&&<Link href={href(page+1)} aria-label="Next page"><ArrowRight size={17}/></Link>}
  </div>
 </nav>;
}
