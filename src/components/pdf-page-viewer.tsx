'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,ExternalLink} from 'lucide-react';
export default function PdfPageViewer({worksheetId,initialPage=1}:{worksheetId:string;initialPage?:number}){
 const [page,setPage]=useState(Math.max(1,Math.min(200,initialPage)));
 const source='/api/worksheets/'+encodeURIComponent(worksheetId)+'/preview?format=pdf';
 return <section className="pdf-page-viewer" aria-label="Choose PDF preview page">
  <div className="pdf-page-viewer-controls">
   <button type="button" disabled={page<=1} onClick={()=>setPage(n=>Math.max(1,n-1))} aria-label="Previous PDF page"><ArrowLeft size={17}/></button>
   <label htmlFor={'pdf-page-'+worksheetId.slice(0,8)}>Page</label>
   <input id={'pdf-page-'+worksheetId.slice(0,8)} type="number" min={1} max={200} value={page}
    onChange={e=>setPage(Math.min(200,Math.max(1,Number(e.target.value)||1)))}/>
   <button type="button" disabled={page>=200} onClick={()=>setPage(n=>Math.min(200,n+1))} aria-label="Next PDF page"><ArrowRight size={17}/></button>
   <a href={source+'#page='+page} target="_blank" rel="noopener noreferrer">Open PDF <ExternalLink size={15}/></a>
  </div>
  <iframe className="pdf-page-viewer-frame" key={page} title={'Worksheet PDF page '+page}
   src={source+'#page='+page+'&toolbar=0&navpanes=0&view=FitH'} loading="lazy"/>
  <p>Choose a page above. On some mobile browsers, open the PDF to navigate all pages.</p>
 </section>;
}
