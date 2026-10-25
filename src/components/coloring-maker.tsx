'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,Check,Download,Plus,RotateCcw,Sparkles} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase-browser';
import {coloringChoices,coloringGroups,coloringNames,drawColoringObject,suggestedColors,
 isColoringObject,type ColoringObject} from '@/lib/coloring-worksheet';

type Group=typeof coloringGroups[number]['slug']|'all';
type Props={initialGroup?:string};
type Selected=string;
const initialFor:Record<Group,ColoringObject[]>={
 all:['cat','apple'],animals:['cat','fish'],fruits:['apple'],nature:['tree','sun'],
 shapes:['star','ball'],objects:['computer','house']
};
const display=(o:string)=>isColoringObject(o)?coloringNames[o]:o.replace(/\b\w/g,ch=>ch.toUpperCase());
function normalizeNames(text:string):string[]{
 return [...new Set(text.toLowerCase().split(/[,;]|\band\b/).map(s=>
   s.trim().replace(/^(a|an|the)\s+/,'').replace(/[^a-z0-9 -]/g,' ').replace(/\s+/g,' ').trim()
 ).filter(s=>/^[a-z][a-z0-9 -]{1,35}$/.test(s)))].slice(0,8);
}
function render(canvas:HTMLCanvasElement,objects:Selected[],grade:number,title:string,
 example:boolean,image:HTMLImageElement|null=null){
 canvas.width=1240;canvas.height=1754;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#fff';ctx.fillRect(0,0,1240,1754);
 ctx.fillStyle='#204c3b';ctx.font='bold 29px Arial';ctx.fillText('worksheetstudio.',85,96);
 ctx.strokeStyle='#c4d3c8';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(80,123);ctx.lineTo(1160,123);ctx.stroke();
 ctx.fillStyle='#183d2c';ctx.font='bold 48px Arial';ctx.fillText((title||'Coloring Page').slice(0,37),85,196);
 ctx.font='25px Arial';ctx.fillText('Grade '+grade+'    |    Name: __________________________',85,254);
 ctx.fillStyle='#42634e';ctx.font='24px Arial';
 ctx.fillText(example?'Suggested colors — choose your favorites':'Color each picture using your favorite colors.',85,310);
 if(image){
  ctx.drawImage(image,110,370,1020,1110);
  ctx.fillStyle='#163d2f';ctx.font='bold 27px Arial';ctx.textAlign='center';
  ctx.fillText(objects.map(display).join('   ·   ').slice(0,74),620,1530);
  ctx.textAlign='left';
 }else{
  objects.forEach((obj,i)=>{
   let x:number,y:number,w:number,h:number,labelY:number;
   if(objects.length===1){x=240;y=402;w=760;h=785;labelY=1260;}
   else if(objects.length===2){x=100+i*540;y=486;w=490;h=625;labelY=1175;}
   else{x=110+(i%2)*535;y=380+Math.floor(i/2)*575;w=480;h=425;labelY=y+487;}
   if(isColoringObject(obj)){
    drawColoringObject(ctx,obj,x,y,w,h,example);
   }else{
    // Never substitute a different, incorrect picture for an unsupported name.
    ctx.strokeStyle='#acc5b4';ctx.lineWidth=3;ctx.setLineDash([12,10]);
    ctx.strokeRect(x+30,y+25,w-60,h-50);ctx.setLineDash([]);
    ctx.fillStyle='#799487';ctx.font='26px Arial';ctx.textAlign='center';
    ctx.fillText('AI drawing needed',x+w/2,y+h/2);ctx.textAlign='left';
   }
   ctx.fillStyle='#153f31';ctx.font='bold 30px Arial';ctx.textAlign='center';
   ctx.fillText(display(obj).slice(0,23),x+w/2,labelY);
   if(example&&isColoringObject(obj)){
    ctx.font='21px Arial';ctx.fillText('Suggested: '+suggestedColors[obj],x+w/2,labelY+34);
   }
   ctx.textAlign='left';
  });
 }
 ctx.fillStyle='#73867c';ctx.font='20px Arial';
 ctx.fillText(example?'Teacher suggestions':'Worksheet Studio',85,1697);
}
/** Convert generative image output into true black-and-white coloring outlines.
 * Remove pale shadow/ghost strokes and all grayscale; never affect the original
 * built-in vector outlines or consume another API request. */
async function loadImage(src:string):Promise<HTMLImageElement>{
 const source=new Image();source.src=src;await source.decode();
 const canvas=document.createElement('canvas');
 canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)throw new Error('Your browser cannot prepare the coloring image.');
 ctx.drawImage(source,0,0);
 const image=ctx.getImageData(0,0,canvas.width,canvas.height);
 const data=image.data;
 // Use one uniform black stroke. Dark source ink remains; grey pencil
 // shadows, gradients, photographic shading and texture become white.
 const limit=125;
 for(let i=0;i<data.length;i+=4){
  const opacity=data[i+3]/255;
  const brightness=(data[i]*0.2126+data[i+1]*0.7152+data[i+2]*0.0722)*opacity+255*(1-opacity);
  const value=brightness<limit?0:255;
  data[i]=value;data[i+1]=value;data[i+2]=value;data[i+3]=255;
 }
 ctx.putImageData(image,0,0);
 const cleaned=new Image();
 cleaned.src=canvas.toDataURL('image/png');await cleaned.decode();
 return cleaned;
}
export default function ColoringMaker({initialGroup}:Props){
 const initial=(coloringGroups.some(g=>g.slug===initialGroup)?initialGroup:'all') as Group;
 const [group,setGroup]=useState<Group>(initial);
 const [objects,setObjects]=useState<Selected[]>(initialFor[initial]);
 const [suggestions,setSuggestions]=useState<string[]>([]);
 const [word,setWord]=useState('');
 const [title,setTitle]=useState('My Coloring Page');
 const [grade,setGrade]=useState(1);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [searchBusy,setSearchBusy]=useState(false);
 const [generating,setGenerating]=useState(false);
 const [imageAvailable,setImageAvailable]=useState(false);
 const [aiImage,setAiImage]=useState('');
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let live=true;
  fetch('/api/ai/color-image',{cache:'no-store'}).then(r=>r.json()).then(data=>{
   if(live)setImageAvailable(data.available===true);
  }).catch(()=>{});
  return()=>{live=false;};
 },[]);
 useEffect(()=>{
  let live=true;
  if(!canvas.current)return;
  if(!aiImage){render(canvas.current,objects,grade,title,false);return;}
  loadImage(aiImage).then(image=>{if(live&&canvas.current)render(canvas.current,objects,grade,title,false,image);})
    .catch(()=>{if(live&&canvas.current)render(canvas.current,objects,grade,title,false);});
  return()=>{live=false;};
 },[objects,grade,title,aiImage]);
 function choose(value:string){
  if(objects.includes(value)){
   setObjects(old=>old.filter(x=>x!==value));setAiImage('');setError('');return;
  }
  if(objects.length>=4){setError('Maximum four objects per page.');return;}
  setObjects(old=>[...old,value]);setAiImage('');setError('');
 }
 async function findObjects(event:FormEvent){
  event.preventDefault();setError('');setNotice('');
  const local=normalizeNames(word);
  if(!local.length){setError('Enter an object, or separate multiple names with commas.');return;}
  setSuggestions(local);setSearchBusy(true);
  try{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(session){
    const response=await fetch('/api/ai/color-ideas',{
     method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
     body:JSON.stringify({prompt:word})
    });
    if(response.ok){
     const result=await response.json() as {objects?:string[]};
     if(result.objects?.length)setSuggestions(result.objects);
    }
   }
  }catch{}finally{setSearchBusy(false);}
 }
 async function generateAI(){
  if(objects.length<1||objects.length>4)return;
  setError('');setNotice('');setGenerating(true);
  try{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(!session)throw new Error('Sign in under Account to use AI drawings. Built-in drawings are free without sign-in.');
   const response=await fetch('/api/ai/color-image',{method:'POST',
    headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
    body:JSON.stringify({objects})});
   const data=await response.json() as {image?:string;error?:string};
   if(!response.ok||!data.image)throw new Error(data.error||'AI image unavailable.');
   // The printable preview and exported PDF/PNG use the same cleaned lines.
   const prepared=await loadImage(data.image);
   setAiImage(prepared.src);setNotice('Clean coloring page ready.');
  }catch(e){setError(e instanceof Error?e.message:'AI image unavailable.');}
  finally{setGenerating(false);}
 }
 async function download(format:'pdf'|'png',example=false){
  if(!objects.length){setError('Select at least one object.');return;}
  if(objects.some(x=>!isColoringObject(x))&&!aiImage){setError('Generate AI drawing for new objects before downloading.');return;}
  const output=document.createElement('canvas');
  const image=aiImage?await loadImage(aiImage):null;
  render(output,objects,grade,title,example,image);
  const filename=(example?'color-guide':'coloring-page')+'-'+objects.map(o=>o.replace(/\s/g,'-')).join('-').slice(0,80);
  if(format==='png'){
   const link=document.createElement('a');link.href=output.toDataURL('image/png');
   link.download=filename+'.png';link.click();return;
  }
  const {jsPDF}=await import('jspdf');
  const pdf=new jsPDF({unit:'mm',format:'a4'});
  pdf.addImage(output.toDataURL('image/png'),'PNG',0,0,210,297);
  pdf.save(filename+'.pdf');
 }
 const visible=group==='all'?coloringChoices:coloringGroups.find(g=>g.slug===group)?.objects||coloringChoices;
 const needsAI=objects.some(o=>!isColoringObject(o));
 return <section className="container workspace dedicated-color-maker">
  <Link href="/colors" className="back-link"><ArrowLeft size={18}/> Color worksheets</Link>
  <h1>Free <em>coloring page</em> maker</h1>
  <p className="page-lead">Make a coloring page from up to four outline drawings, then save it as a PDF or PNG.</p>
  <div className="color-maker-grid">
   <div className="editor-panel color-maker-controls">
    <h2>Choose 1–4 objects</h2>
    <form onSubmit={findObjects} className="color-type-row">
     <label htmlFor="custom-color-word">Type any object</label>
     <div><input id="custom-color-word" value={word} onChange={e=>setWord(e.target.value)}
      placeholder="Dog, rocket, computer..." maxLength={200}/>
      <button type="submit" disabled={searchBusy}>{searchBusy?'Finding…':'Find'}</button></div>
    </form>
    {suggestions.length>0&&<div className="color-suggestions">
     {suggestions.map(item=><button key={item} type="button" aria-pressed={objects.includes(item)}
      onClick={()=>choose(item)} className={objects.includes(item)?'active':''}>
      {display(item)} {objects.includes(item)?<Check size={15}/>:<Plus size={15}/>}</button>)}
    </div>}
    <div className="color-group-tabs" aria-label="Built-in drawing categories">
     {([{slug:'all',title:'All'},...coloringGroups] as const).map(g=>
      <button type="button" key={g.slug} className={group===g.slug?'active':''}
       onClick={()=>setGroup(g.slug)}>{g.title}</button>)}
    </div>
    <div className="color-object-list" aria-label="Built-in drawings">
     {visible.map(item=><button type="button" key={item} aria-pressed={objects.includes(item)}
      className={'color-object-item '+(objects.includes(item)?'chosen':'')} onClick={()=>choose(item)}>
      <span>{coloringNames[item]}</span><span className="color-checkbox">{objects.includes(item)&&<Check size={18}/>}</span>
     </button>)}
    </div>
    <p className="color-selection-count">{objects.length}/4 selected · Built-in pictures work without AI</p>
    <div className="color-selected-tags">{objects.map(item=>
     <button type="button" key={item} onClick={()=>choose(item)}>{display(item)} ×</button>)}</div>
    {needsAI&&!imageAvailable&&<p className="color-maker-error" role="status">AI drawing is unavailable.</p>}
    {(needsAI||imageAvailable)&&<button className="button button-dark" type="button"
      disabled={generating||!objects.length||!imageAvailable} onClick={generateAI}>
      <Sparkles size={18}/>{generating?'Drawing…':'Create AI drawing'}</button>}
    {error&&<p role="alert" className="color-maker-error">{error}</p>}
    {notice&&<p role="status" className="color-selection-count">{notice}</p>}
    <div className="color-page-settings">
     <label htmlFor="color-page-title">Title</label>
     <input id="color-page-title" maxLength={37} value={title} onChange={e=>setTitle(e.target.value)}/>
     <label htmlFor="color-grade">Grade</label>
     <select id="color-grade" value={grade} onChange={e=>setGrade(Number(e.target.value))}>
      {[1,2,3,4,5,6].map(n=><option key={n} value={n}>Grade {n}</option>)}
     </select>
    </div>
    <button className="color-reset" type="button" onClick={()=>{
      setObjects(['cat','apple']);setGroup('all');setError('');setAiImage('');setSuggestions([]);
    }}><RotateCcw size={16}/> Reset</button>
   </div>
   <div className="preview-panel color-preview-panel">
    <div className="preview-panel-top"><h2>Preview</h2><span>A4 · 1 page</span></div>
    <canvas ref={canvas} width={1240} height={1754}
      aria-label="Printable coloring page preview"/>
    <div className="color-preview-buttons">
     <button type="button" className="button button-dark" disabled={!objects.length||needsAI&&!aiImage}
      onClick={()=>download('pdf')}><Download size={18}/> PDF</button>
     <button type="button" className="button button-outline" disabled={!objects.length||needsAI&&!aiImage}
      onClick={()=>download('png')}><Download size={18}/> PNG</button>
     {!aiImage&&<button type="button" className="button button-outline" disabled={!objects.length||needsAI}
      onClick={()=>download('pdf',true)}>Color guide</button>}
    </div>
   </div>
  </div>
 </section>;
}
