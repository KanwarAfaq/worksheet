'use client';

import {useEffect,useRef,useState} from 'react';
import {FileText} from 'lucide-react';

type Props={worksheetId:string;pageNumber:number;title:string};

/** A rasterized PDF page, never an embedded browser PDF viewer.
 * Load only when near the viewport: catalogue pages may hold 12 items.
 */
export default function PdfCoverThumbnail({worksheetId,pageNumber,title}:Props){
 const host=useRef<HTMLDivElement|null>(null);
 const canvas=useRef<HTMLCanvasElement|null>(null);
 const [visible,setVisible]=useState(false);
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading');

 useEffect(()=>{
  const el=host.current;
  if(!el)return;
  const observer=new IntersectionObserver(([entry])=>{
   if(entry.isIntersecting){setVisible(true);observer.disconnect();}
  },{rootMargin:'250px'});
  observer.observe(el);
  return()=>observer.disconnect();
 },[]);

 useEffect(()=>{
  if(!visible)return;
  let disposed=false;
  let job:{cancel:()=>void;promise:Promise<unknown>}|undefined;
  let loading:{destroy:()=>Promise<void>}|undefined;
  let pdfDocument:{destroy:()=>Promise<void>}|undefined;
  setState('loading');

  async function render(){
   try{
    const pdfjs=await import('pdfjs-dist');
    if(disposed)return;
    pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
    const fileUrl='/api/worksheets/'+encodeURIComponent(worksheetId)+'/preview?format=pdf';
    const task=pdfjs.getDocument({url:fileUrl,withCredentials:false});
    loading=task;
    const document=await task.promise;
    pdfDocument=document;
    if(disposed)return;
    const chosen=Math.min(document.numPages,Math.max(1,Math.floor(pageNumber||1)));
    const page=await document.getPage(chosen);
    if(disposed)return;
    const el=canvas.current;
    if(!el)return;
    const targetWidth=560;
    const baseline=page.getViewport({scale:1});
    const viewport=page.getViewport({scale:targetWidth/baseline.width});
    el.width=Math.ceil(viewport.width);
    el.height=Math.ceil(viewport.height);
    const context=el.getContext('2d',{alpha:false});
    if(!context)throw new Error('Canvas unavailable');
    context.fillStyle='#fff';context.fillRect(0,0,el.width,el.height);
    const rendering=page.render({canvas:el,canvasContext:context,viewport});
    job=rendering;
    await rendering.promise;
    if(!disposed)setState('ready');
   }catch(error){
    if(!disposed){
     console.error('PDF cover render failed',error instanceof Error?error.name:'unknown');
     setState('error');
    }
   }finally{
    if(pdfDocument)void pdfDocument.destroy().catch(()=>{});
   }
  }
  void render();
  return()=>{
   disposed=true;
   job?.cancel();
   if(!pdfDocument&&loading)void loading.destroy().catch(()=>{});
  };
 },[visible,worksheetId,pageNumber]);

 return <div className="pdf-cover-thumbnail" ref={host} aria-label={'Page '+pageNumber+' thumbnail of '+title}>
   <canvas ref={canvas} className={state==='ready'?'is-ready':''} aria-hidden="true"/>
   {state!=='ready'&&<div className="pdf-cover-placeholder">
    <FileText size={35} strokeWidth={1.6}/>
    <span>{state==='error'?'Open PDF':'Loading preview…'}</span>
   </div>}
 </div>;
}
