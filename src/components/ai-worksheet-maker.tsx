'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {Sparkles,Download,ArrowLeft,RefreshCw,ShieldCheck} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase-browser';
import type {AIWorksheet} from '@/lib/ai-worksheet';
const subjects=['math','reading','kindergarten','vocabulary','spelling','grammar','writing','colors'];
function drawPage(canvas:HTMLCanvasElement,sheet:AIWorksheet,answers:boolean){
 canvas.width=1240;canvas.height=1754;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#fff';ctx.fillRect(0,0,1240,1754);
 ctx.fillStyle='#163f34';ctx.font='bold 27px Arial';ctx.fillText('worksheetstudio.',92,95);
 ctx.strokeStyle='#b7c9bd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(90,118);ctx.lineTo(1150,118);ctx.stroke();
 ctx.font='bold 45px Arial';ctx.fillText((answers?'Answer Key: ':'')+sheet.title.slice(0,42),92,195);
 ctx.font='23px Arial';ctx.fillStyle='#3e544a';ctx.fillText('Grade '+sheet.grade+'  •  '+sheet.subject.toUpperCase(),92,241);
 if(!answers)ctx.fillText('Name: ____________________       Date: ____________',92,300);
 let y=answers?325:366;
 ctx.font='23px Arial';ctx.fillText(answers?'For teacher reference only':sheet.instructions.slice(0,85),92,y);y+=65;
 for(let i=0;i<sheet.questions.length;i++){
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
 const [topic,setTopic]=useState('Addition and subtraction within 20');
 const [subject,setSubject]=useState('math');
 const [grade,setGrade]=useState(2);
 const [level,setLevel]=useState('easy');
 const [worksheet,setWorksheet]=useState<AIWorksheet|null>(null);
 const [tracing,setTracing]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(event:FormEvent){
  event.preventDefault();setBusy(true);setError('');
  if(/\\b(trace|tracing|handwriting|write and trace)\\b/i.test(topic)){setTracing(true);setWorksheet(null);setBusy(false);return;}
  setTracing(false);
  try{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(!session)throw new Error('Sign in first to create AI worksheets.');
   const result=await fetch('/api/ai/worksheet',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({topic,subject,grade,level})});
   const payload=await result.json();
   if(!result.ok)throw new Error(payload.error||'Unable to generate worksheet.');
   setWorksheet(payload.worksheet);
  }catch(e){setError(e instanceof Error?e.message:'Generation failed');}
  finally{setBusy(false);}
 }
 async function download(format:'pdf'|'png',answers=false){
  if(!worksheet)return;
  const canvas=document.createElement('canvas');drawPage(canvas,worksheet,answers);
  const name='worksheet-'+worksheet.subject+'-grade-'+worksheet.grade+(answers?'-teacher':'');
  if(format==='png'){
   const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=name+'.png';a.click();return;
  }
  const {jsPDF}=await import('jspdf');const pdf=new jsPDF({format:'a4',unit:'mm'});
  pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,210,297);
  pdf.save(name+'.pdf');
 }
 return <div className="container workspace ai-maker"><Link className="back-link" href="/create"><ArrowLeft size={16}/> Worksheet makers</Link>
  <div className="section-kicker">AI WORKSHEET STUDIO</div>
  <h1>Make a fresh <em>worksheet.</em></h1>
  <p className="page-lead">Describe a topic, choose a grade, then preview and download a printable PDF or PNG. Answer keys are separate teacher downloads.</p>
  <div className="ai-maker-grid">
  <form className="editor-panel ai-maker-form" onSubmit={submit}>
   <h2><Sparkles size={21}/> Worksheet settings</h2>
   <label htmlFor="ai-topic" className="field-label">Topic</label>
   <textarea className="word-input" id="ai-topic" value={topic} maxLength={120} minLength={3} required rows={3} onChange={e=>setTopic(e.target.value)}/>
   <label htmlFor="ai-subject" className="field-label">Subject</label>
   <select id="ai-subject" className="field-select" value={subject} onChange={e=>setSubject(e.target.value)}>{subjects.map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select>
   <label htmlFor="ai-grade" className="field-label">Grade</label>
   <select id="ai-grade" className="field-select" value={grade} onChange={e=>setGrade(Number(e.target.value))}>{[1,2,3,4,5,6].map(x=><option key={x} value={x}>Grade {x}</option>)}</select>
   <label htmlFor="ai-level" className="field-label">Difficulty</label>
   <select id="ai-level" className="field-select" value={level} onChange={e=>setLevel(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
   <button className="button button-dark" disabled={busy} type="submit">{busy?<RefreshCw size={18}/>:<Sparkles size={18}/>} {busy?'Creating worksheet…':'Generate worksheet'}</button>
   <p className="generator-setting-help"><ShieldCheck size={14}/> Sign-in required · 5 AI generations daily · Provider keys stay on the server.</p>
   {error&&<p className="error-message" role="alert">{error}</p>}
  </form>
  <section className="preview-panel ai-result">
   <div className="preview-panel-top"><h2>Worksheet preview</h2>{worksheet&&<span>Generated via {worksheet.provider}</span>}</div>
   {tracing&&<div className="ai-sheet"><h2>Alphabet tracing is a handwriting template</h2><p>For real dashed letter outlines and primary handwriting guide lines, use the tracing template rather than AI text questions.</p><Link href="/create/templates" className="button button-dark">Open editable tracing template</Link><p>Choose the Alphabet sample or replace it with your own letters or words, then download PDF or PNG.</p></div>}
   {worksheet?<div className="ai-sheet">
    <div className="section-kicker">STUDENT WORKSHEET</div><h2>{worksheet.title}</h2>
    <p>Grade {worksheet.grade} · {worksheet.subject}</p><p>{worksheet.instructions}</p>
    <ol>{worksheet.questions.map((x,i)=><li key={i}><span>{x.question}</span><div className="ai-answer-line"/></li>)}</ol>
   </div>:<div className="ai-empty"><Sparkles size={36}/><h3>Your worksheet appears here</h3><p>Choose your subject, grade and topic, then generate a worksheet.</p></div>}
   {worksheet&&<div className="ai-download-row">
    <button className="button button-dark" type="button" onClick={()=>download('pdf')}><Download size={16}/> Student PDF</button>
    <button className="button button-outline" type="button" onClick={()=>download('png')}><Download size={16}/> Student PNG</button>
    <button className="button button-outline" type="button" onClick={()=>download('pdf',true)}><Download size={16}/> Teacher key PDF</button>
   </div>}
  </section></div>
  <p className="generator-setting-help">AI-generated questions may contain errors. Review the worksheet and its answers before giving it to students. New worksheets are not automatically published to the public library.</p>
 </div>;
}
