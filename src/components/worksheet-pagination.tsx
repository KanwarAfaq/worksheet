import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
type Query={subject?:string;grade?:string;format?:string;q?:string};
export default function WorksheetPagination({page,pages,total,base,filters={},position='bottom'}:
 {page:number;pages:number;total:number;base:string;filters?:Query;position?:'top'|'bottom'}){
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
 const numbers=Array.from({length:end-start+1},(_,i)=>i+start);
 return <nav className={'worksheet-pagination modern-pagination pagination-'+position}
   aria-label={position==='top'?'Worksheet page navigation above results':'Worksheet page navigation below results'}>
   <div className="pagination-summary"><strong>{(page-1)*12+1}–{Math.min(page*12,total)}</strong>
    <span>of {total} worksheets</span></div>
   <div className="pagination-links">
    {page>1?<Link href={href(page-1)} aria-label="Previous page" className="pagination-arrow"><ArrowLeft size={17}/><span>Prev</span></Link>:
     <span className="pagination-arrow disabled" aria-hidden="true"><ArrowLeft size={17}/><span>Prev</span></span>}
    {start>1&&<><Link href={href(1)} aria-label="Page 1">1</Link>{start>2&&<span className="pagination-ellipsis" aria-hidden="true">…</span>}</>}
    {numbers.map(n=><Link href={href(n)} key={n}
      aria-label={'Page '+n} aria-current={n===page?'page':undefined}
      className={n===page?'current':''}>{n}</Link>)}
    {end<pages&&<>{end<pages-1&&<span className="pagination-ellipsis" aria-hidden="true">…</span>}
     <Link href={href(pages)} aria-label={'Page '+pages}>{pages}</Link></>}
    {page<pages?<Link href={href(page+1)} aria-label="Next page" className="pagination-arrow"><span>Next</span><ArrowRight size={17}/></Link>:
     <span className="pagination-arrow disabled" aria-hidden="true"><span>Next</span><ArrowRight size={17}/></span>}
   </div>
 </nav>;
}
