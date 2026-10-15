'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {Sparkles,Download,ArrowLeft,RefreshCw,ShieldCheck} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase-browser';
import type {AIWorksheet} from '@/lib/ai-worksheet';
import {coloringChoices,coloringNames,drawColoringObject,suggestedColoringFromText,type ColoringObject} from '@/lib/coloring-worksheet';
const subjects=['math','reading','kindergarten','vocabulary','spelling','grammar','writing','colors'];
function drawPage(canvas:HTMLCanvasElement,sheet:AIWorksheet,answers:boolean,page=0){
 canvas.width=1240;canvas.height=1754;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#fff';ctx.fillRect(0,0,1240,1754);
 ctx.fillStyle='#163f34';ctx.font='bold 27px Arial';ctx.fillText('worksheetstudio.',92,95);
 ctx.strokeStyle='#b7c9bd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(90,118);ctx.lineTo(1150,118);ctx.stroke();
 ctx.font='bold 45px Arial';ctx.fillText((answers?'Answer Key: ':'')+sheet.title.slice(0,42),92,195);
 ctx.font='23px Arial';ctx.fillStyle='#3e544a';ctx.fillText('Grade '+sheet.grade+'  •  '+sheet.subject.toUpperCase(),92,241);
 if(!answers)ctx.fillText('Name: ____________________       Date: ____________',92,300);
 if(sheet.coloringObjects?.length){
   ctx.font='25px Arial';ctx.fillStyle='#214233';
   ctx.fillText(answers?'Suggested color example:':sheet.instructions.slice(0,90),92,370);
   sheet.coloringObjects.slice(0,2).forEach((obj,i)=>{
     drawColoringObject(ctx,obj,110+i*520,480,480,490,answers);
     ctx.fillStyle='#173b31';ctx.font='bold 36px Arial';
     ctx.textAlign='center';ctx.fillText(coloringNames[obj],350+i*520,1020);ctx.textAlign='left';
     if(answers){ctx.font='24px Arial';ctx.fillText(['Suggested colors:','Cat – orange; Apple – red'][i]||'Color as you like',115+i*515,1090);}
   });
   ctx.fillStyle='#6a776d';ctx.font='20px Arial';ctx.fillText('Worksheet Studio · Original coloring outlines',92,1690);
   return;
 }
 let y=answers?325:366;
 ctx.font='23px Arial';ctx.fillText(answers?'For teacher reference only':sheet.instructions.slice(0,85),92,y);y+=65;
 for(let i=page*6;i<Math.min(sheet.questions.length,(page+1)*6);i++){
  if(y>1640)break;
  ctx.font='bold 24px Arial';ctx.fillStyle='#183e33';
  const text=(i+1)+'. '+(answers?sheet.questions[i].answer:sheet.questions[i].question);
  const words=text.split(' ');let line='';let k=0;
  for(const word of words){
   if(ctx.measureText(line+' '+word).width>1020&&line){ctx.fillText(line,100,y+k*36);k++;line=word;}else line+=(line?' ':'')+word;
  }
  ctx.fillText(line,100,y+k*36);
  if(!answers){ctx.strokeStyle='#9baea3';ctx.beginPath();ctx.moveTo(140,y+52+k*36);ctx.lineTo(1110,y+52+k*36);ctx.stroke();}
  y+=112+k*36;
 }
 ctx.fillStyle='#687c6d';ctx.font='18px Arial';ctx.fillText(answers?'Teacher copy — keep private':'Printable worksheet • Worksheet Studio',92,1690);
}
export default function AIWorksheetMaker(){
 const [topic,setTopic]=useState('Color two objects: a cat and an apple');
 const [subject,setSubject]=useState('colors');
 const [grade,setGrade]=useState(2);
 const [level,setLevel]=useState('easy');
 const [worksheet,setWorksheet]=useState<AIWorksheet|null>(null);
 const [firstObject,setFirstObject]=useState<ColoringObject>('cat');
 const [secondObject,setSecondObject]=useState<ColoringObject>('apple');
 const [previewPage,setPreviewPage]=useState(0);
 const previewCanvas=useRef<HTMLCanvasElement>(null);
 const coloringMode=subject==='colors'||/\\b(colou?ring?|paint)\\b/i.test(topic);
 const totalPages=worksheet?.coloringObjects?.length?1:Math.max(1,Math.ceil((worksheet?.questions.length||0)/6));
 useEffect(()=>{if(worksheet&&previewCanvas.current)drawPage(previewCanvas.current,worksheet,false,previewPage);},[worksheet,previewPage]);
 const [providerStatus,setProviderStatus]=useState<{name:string;configured:boolean;model:string;status?:string}[]>([]);
 const [tracing,setTracing]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function checkProviders(){
  setError('');
  try{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(!session)throw new Error('Sign in first to check providers.');
   const response=await fetch('/api/ai/providers',{headers:{Authorization:'Bearer '+session.access_token}});
   const info=await response.json();
   if(!response.ok)throw new Error(info.error||'Provider configuration unavailable.');
   setProviderStatus(info.providers||[]);
  }catch(e){setError(e instanceof Error?e.message:'Unable to check provider configuration.');}
 }
 async function submit(event:FormEvent){
  event.preventDefault();setBusy(true);setError('');
  if(/\b(trace|tracing|handwriting|write and trace)\b/i.test(topic)){setTracing(true);setWorksheet(null);setBusy(false);return;}
  if(coloringMode){
   const mentioned=suggestedColoringFromText(topic);
   const objects:[ColoringObject,ColoringObject]=[firstObject,secondObject];
   // If the topic clearly names two supported drawings, prefer its explicit request.
   if(mentioned[0]!=='cat'||mentioned[1]!=='apple'){objects[0]=mentioned[0];objects[1]=mentioned[1];}
   if(objects[0]===objects[1])objects[1]=objects[0]==='apple'?'cat':'apple';
   setWorksheet({title:'Coloring: '+coloringNames[objects[0]]+' & '+coloringNames[objects[1]],
    instructions:'Color the '+objects.join(' and ')+'. Choose your favorite colors.',
    grade,subject:'colors',provider:'Built-in drawing',coloringObjects:objects,questions:[]});
   setTracing(false);setPreviewPage(0);setBusy(false);return;
  }
  setTracing(false);
  try{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(!session)throw new Error('Sign in first to create AI worksheets.');
   const result=await fetch('/api/ai/worksheet',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({topic,subject,grade,level})});
   const payload=await result.json();
   if(!result.ok)throw new Error(payload.error||'Unable to generate worksheet.');
   setWorksheet(payload.worksheet);setPreviewPage(0);
  }catch(e){setError(e instanceof Error?e.message:'Generation failed');}
  finally{setBusy(false);}
 }
 async function download(format:'pdf'|'png',answers=false){
  if(!worksheet)return;
  const canvas=document.createElement('canvas');drawPage(canvas,worksheet,answers,previewPage);
  const name='worksheet-'+worksheet.subject+'-grade-'+worksheet.grade+(answers?'-teacher':'');
  if(format==='png'){
   const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=name+'.png';a.click();return;
  }
  const {jsPDF}=await import('jspdf');const pdf=new jsPDF({format:'a4',unit:'mm'});
  for(let p=0;p<totalPages;p++){
    if(p)pdf.addPage();
    drawPage(canvas,worksheet,answers,p);
    pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,210,297);
  }
  pdf.save(name+'.pdf');
 }
 return <div className="container workspace ai-maker"><Link className="back-link" href="/create"><ArrowLeft size={16}/> Worksheet makers</Link>
  <div className="section-kicker">AI WORKSHEET STUDIO</div>
  <h1>Make a fresh <em>worksheet.</em></h1>
  <p className="page-lead">Choose a subject. Create and print your worksheet.</p>
  <div className="ai-maker-grid">
  <form className="editor-panel ai-maker-form" onSubmit={submit}>
   <h2>Make a worksheet</h2>
   <label htmlFor="ai-topic" className="field-label">Topic</label>
   <textarea className="word-input" id="ai-topic" value={topic} maxLength={120} minLength={3} required rows={3} onChange={e=>setTopic(e.target.value)}/>
   <label htmlFor="ai-subject" className="field-label">Subject</label>
   <select id="ai-subject" className="field-select" value={subject} onChange={e=>setSubject(e.target.value)}>{subjects.map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select>
   {coloringMode&&<div className="coloring-object-pickers">
      <label className="field-label" htmlFor="color-object-1">First drawing
        <select id="color-object-1" className="field-select" value={firstObject} onChange={e=>setFirstObject(e.target.value as ColoringObject)}>
          {coloringChoices.map(item=><option key={item} value={item}>{coloringNames[item]}</option>)}
        </select>
      </label>
      <label className="field-label" htmlFor="color-object-2">Second drawing
        <select id="color-object-2" className="field-select" value={secondObject} onChange={e=>setSecondObject(e.target.value as ColoringObject)}>
          {coloringChoices.map(item=><option key={item} value={item}>{coloringNames[item]}</option>)}
        </select>
      </label>
    </div>}
   <label htmlFor="ai-grade" className="field-label">Grade</label>
   <select id="ai-grade" className="field-select" value={grade} onChange={e=>setGrade(Number(e.target.value))}>{[1,2,3,4,5,6].map(x=><option key={x} value={x}>Grade {x}</option>)}</select>
   <label htmlFor="ai-level" className="field-label">Difficulty</label>
   <select id="ai-level" className="field-select" value={level} onChange={e=>setLevel(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
   <button className="button button-dark" disabled={busy} type="submit">{busy?<RefreshCw size={18}/>:<Sparkles size={18}/>} {busy?'Creating worksheet…':'Generate worksheet'}</button>
   {!coloringMode&&<details className="ai-provider-details"><summary>AI connection</summary>
     <button className="regenerate" type="button" onClick={checkProviders}>Check AI providers</button>
   </details>}
   {providerStatus.length>0&&<div className="provider-status">{providerStatus.map(x=><div key={x.name}><strong>{x.name}</strong><span>{x.status|| (x.configured?'Key present':'Key missing')}</span><small>{x.model}</small></div>)}<p>Model-list checks do not prove text generation succeeds. If the model is not listed, configure a model your provider account permits.</p></div>}
   {!coloringMode&&<p className="generator-setting-help"><ShieldCheck size={14}/> AI text generation needs sign-in. If it fails, check server keys and permitted models.</p>}
   {error&&<p className="error-message" role="alert">{error}</p>}
  </form>
  <section className="preview-panel ai-result">
   <div className="preview-panel-top"><h2>Worksheet preview</h2>{worksheet&&<span>Generated via {worksheet.provider}</span>}</div>
   {tracing&&<div className="ai-sheet"><h2>Alphabet tracing is a handwriting template</h2><p>For real dashed letter outlines and primary handwriting guide lines, use the tracing template rather than AI text questions.</p><Link href="/create/templates" className="button button-dark">Open editable tracing template</Link><p>Choose the Alphabet sample or replace it with your own letters or words, then download PDF or PNG.</p></div>}
   {worksheet&&!worksheet.coloringObjects?.length&&<div className="ai-edit-questions"><h3>Edit worksheet before downloading</h3><label className="field-label" htmlFor="ai-output-title">Title</label><input id="ai-output-title" className="field-select" maxLength={90} value={worksheet.title} onChange={e=>setWorksheet({...worksheet,title:e.target.value})}/><label className="field-label" htmlFor="ai-output-instructions">Instructions</label><textarea id="ai-output-instructions" className="word-input" rows={2} value={worksheet.instructions} onChange={e=>setWorksheet({...worksheet,instructions:e.target.value})}/>{worksheet.questions.map((q,i)=><div key={i} className="ai-edit-item"><label htmlFor={'ai-question-'+i}>Question {i+1}</label><textarea id={'ai-question-'+i} rows={2} value={q.question} onChange={e=>setWorksheet({...worksheet,questions:worksheet.questions.map((x,j)=>j===i?{...x,question:e.target.value}:x)})}/><label htmlFor={'ai-answer-'+i}>Answer {i+1}</label><input id={'ai-answer-'+i} value={q.answer} onChange={e=>setWorksheet({...worksheet,questions:worksheet.questions.map((x,j)=>j===i?{...x,answer:e.target.value}:x)})}/></div>)}<button type="button" className="button button-outline" onClick={()=>setWorksheet({...worksheet,questions:[...worksheet.questions,{question:'New question',answer:'Answer'}]})}>Add question</button></div>}
   {worksheet?<div className="ai-sheet ai-page-preview">
     <div className="ai-preview-pages">
       <label htmlFor="ai-preview-page">Preview page</label>
       <select id="ai-preview-page" value={previewPage} onChange={e=>setPreviewPage(Number(e.target.value))}>
        {Array.from({length:totalPages},(_,i)=><option key={i} value={i}>Page {i+1} of {totalPages}</option>)}
       </select>
       <button type="button" disabled={previewPage===0} onClick={()=>setPreviewPage(v=>Math.max(0,v-1))}>Previous</button>
       <button type="button" disabled={previewPage>=totalPages-1} onClick={()=>setPreviewPage(v=>Math.min(totalPages-1,v+1))}>Next</button>
     </div>
     <canvas ref={previewCanvas} width={1240} height={1754}
      aria-label={worksheet.coloringObjects?.length?'Two blank outline drawings to color':'Page '+(previewPage+1)+' of the printable worksheet'}/>
   </div>:<div className="ai-empty"><Sparkles size={36}/><h3>Preview</h3><p>Create a worksheet to see it here.</p></div>}
   {worksheet&&<div className="ai-download-row">
    <button className="button button-dark" type="button" onClick={()=>download('pdf')}><Download size={16}/> Student PDF</button>
    <button className="button button-outline" type="button" onClick={()=>download('png')}><Download size={16}/> Student PNG</button>
    <button className="button button-outline" type="button" onClick={()=>download('pdf',true)}><Download size={16}/> Teacher key PDF</button>
   </div>}
  </section></div>
  <p className="generator-setting-help">Review worksheets before sharing. Downloads are not automatically published.</p>
 </div>;
}
