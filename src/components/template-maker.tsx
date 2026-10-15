'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,Download,RefreshCw} from 'lucide-react';
import {worksheetTemplates,worksheetSamples,wordsFromInput,shuffleWord,type TemplateType} from '@/lib/worksheet-templates';
import {generate} from '@/lib/generators';

function printPage(canvas:HTMLCanvasElement,type:TemplateType,words:string[],title:string,seed:number,answer=false,pageIndex=0){
 const w=1240,h=1754;canvas.width=w;canvas.height=h;
 const c=canvas.getContext('2d');if(!c)return;
 c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#152c27';
 c.font='bold 27px Arial';c.fillText('worksheetstudio.',75,76);
 c.strokeStyle='#82998d';c.lineWidth=2;c.beginPath();c.moveTo(75,103);c.lineTo(1165,103);c.stroke();
 c.fillStyle='#172c25';c.font='bold 43px Arial';c.fillText((answer?'Answer Key — ':'')+title.slice(0,44),75,166);
 c.font='22px Arial';c.fillText('Name: _______________________      Date: _______________',75,218);
 c.fillStyle='#476458';c.font='23px Arial';
 c.fillText(type==='tracing'?'Trace each dotted letter on the guide lines.':type==='word-search'?'Find and circle the hidden words.':'Complete each activity below.',75,274);
 const row=(start:number,line:string,index:number,solution?:string)=>{
  const y=start+index*112;c.fillStyle='#18392b';c.font='29px Arial';c.fillText((index+1)+'.  '+(answer?(solution||line):line),95,y);
  if(!answer){c.strokeStyle='#bdc8c0';c.beginPath();c.moveTo(115,y+36);c.lineTo(1120,y+36);c.stroke();}
 };
 const use=words.slice(pageIndex*12,(pageIndex+1)*12);
 if(type==='tracing'||type==='copy'){
  const items=use;
  const n=Math.min(items.length,12),step=112;
  for(let i=0;i<n;i++){
   const y=332+i*step;
   c.strokeStyle='#9ab0a3';c.lineWidth=2;
   c.setLineDash([]);c.beginPath();c.moveTo(80,y-19);c.lineTo(1160,y-19);c.stroke();
   c.setLineDash([6,7]);c.beginPath();c.moveTo(80,y+25);c.lineTo(1160,y+25);c.stroke();
   c.setLineDash([]);c.beginPath();c.moveTo(80,y+70);c.lineTo(1160,y+70);c.stroke();
   c.font='76px Arial';c.textBaseline='alphabetic';
   if(type==='tracing'){
    c.lineWidth=1.6;c.strokeStyle='#576f62';c.setLineDash([3,5]);c.strokeText(items[i],103,y+66);c.setLineDash([]);
   }else{c.fillStyle='#6c8a77';c.fillText(items[i],103,y+66);}
  }
 }else if(type==='word-search'){
  try{
   const puzzle=generate('word-search',use.filter(x=>x.replace(/[^a-z]/gi,'').length>1).slice(0,10),seed,'easy');
   const grid=puzzle.grid||[];const size=Math.min(63,780/grid.length);
   c.fillStyle='#263a31';c.font='bold '+Math.floor(size*.55)+'px monospace';
   grid.forEach((line,i)=>line.forEach((letter,j)=>c.fillText(letter,110+j*size,350+i*size)));
   if(answer&&puzzle.placements){c.strokeStyle='#357f55';c.lineWidth=5;puzzle.placements.forEach(p=>{const first=p.cells[0],last=p.cells[p.cells.length-1];c.beginPath();c.moveTo(110+first[1]*size+size*.23,340+first[0]*size+size*.1);c.lineTo(110+last[1]*size+size*.23,340+last[0]*size+size*.1);c.stroke();});}
   c.font='bold 22px Arial';use.forEach((x,i)=>c.fillText(x,105+(i%3)*330,1250+Math.floor(i/3)*47));
  }catch{c.fillText('Use shorter words to make the word search.',90,400);}
 }else if(type==='matching'){
  const right=[...use].reverse();
  use.forEach((x,i)=>{const y=360+i*98;c.fillStyle='#193b2e';c.font='30px Arial';c.fillText((i+1)+'. '+x,100,y);c.fillText(String.fromCharCode(65+i)+'. '+right[i],760,y);
   if(answer){c.font='19px Arial';c.fillText('→ '+String.fromCharCode(65+right.indexOf(x)),460,y);}
  });
 }else if(type==='alphabetical'){
  const sorted=[...use].sort((a,b)=>a.localeCompare(b));
  use.forEach((x,i)=>row(359,x,i,sorted[i]));
 }else{
  use.forEach((x,i)=>{
   const q=type==='scramble'?shuffleWord(x,seed+i+1):type==='missing'?x.split('').map((ch,j)=>j>0&&j%2===1?'_':ch).join(' '):x+'  = ______ letters';
   row(359,q,i,type==='count'?x+' = '+x.replace(/[^a-z]/gi,'').length:x);
  });
 }
 c.textBaseline='alphabetic';c.setLineDash([]);c.fillStyle='#829186';c.font='19px Arial';c.fillText(answer?'Teacher copy — verify answers before use':'Worksheet Studio · Printable activity',75,1710);
}
export default function TemplateMaker(){
 const [type,setType]=useState<TemplateType>('tracing');
 const [sample,setSample]=useState<keyof typeof worksheetSamples>('Alphabet');
 const [input,setInput]=useState(worksheetSamples.Alphabet.join('\n'));
 const [title,setTitle]=useState('Alphabet tracing practice');
 const [seed,setSeed]=useState(12345);
 const [pageIndex,setPageIndex]=useState(0);
 const [error,setError]=useState('');
 const canvas=useRef<HTMLCanvasElement>(null);
 const words=(()=>{try{return wordsFromInput(input);}catch{return [] as string[];}})();
 useEffect(()=>{if(canvas.current&&words.length>2)printPage(canvas.current,type,words,title,seed,false,pageIndex);},[type,input,title,seed,pageIndex]);
 function chooseSample(key:keyof typeof worksheetSamples){setPageIndex(0);setSample(key);setInput(worksheetSamples[key].join('\n'));setError('');}
 function chooseTemplate(next:TemplateType){setPageIndex(0);setType(next);setTitle(worksheetTemplates.find(x=>x.id===next)?.name+' worksheet');setError('');}
 async function save(format:'pdf'|'png',answers=false){
  try{
   const values=wordsFromInput(input);setError('');
   const output=document.createElement('canvas');printPage(output,type,values,title,seed,answers,pageIndex);
   const safe=type+(answers?'-teacher':'');
   if(format==='png'){const a=document.createElement('a');a.href=output.toDataURL('image/png');a.download=safe+'.png';a.click();}
   else{const {jsPDF}=await import('jspdf');const pdf=new jsPDF({unit:'mm',format:'a4'});const pages=Math.ceil(values.length/12);for(let p=0;p<pages;p++){if(p)pdf.addPage();printPage(output,type,values,title,seed,answers,p);pdf.addImage(output.toDataURL('image/png'),'PNG',0,0,210,297);}pdf.save(safe+'.pdf');}
  }catch(e){setError(e instanceof Error?e.message:'Download failed');}
 }
 return <div className="container workspace template-maker"><Link href="/create" className="back-link"><ArrowLeft size={16}/> Worksheet maker</Link>
  <div className="section-kicker">CUSTOM PRINTABLE WORKSHEETS</div><h1>Choose a template. <em>Make it yours.</em></h1>
  <p className="page-lead">Pick an activity, load sample words or enter your own, and download a printable PDF or PNG. Letter tracing uses dotted letter outlines and handwriting guide lines.</p>
  <div className="template-picker" role="group" aria-label="Worksheet template">{worksheetTemplates.map(item=><button key={item.id} aria-pressed={type===item.id} className={type===item.id?'selected':''} type="button" onClick={()=>chooseTemplate(item.id)}><strong>{item.name}</strong><small>{item.description}</small></button>)}</div>
  <div className="ai-maker-grid"><div className="editor-panel"><h2>Edit your worksheet</h2>
    <label className="field-label" htmlFor="template-sample">Sample word bank</label><select className="field-select" id="template-sample" value={sample} onChange={e=>chooseSample(e.target.value as keyof typeof worksheetSamples)}>{Object.keys(worksheetSamples).map(x=><option key={x}>{x}</option>)}</select>
    <label className="field-label" htmlFor="template-words">Your letters or words (one per line)</label><textarea className="word-input" id="template-words" value={input} rows={10} onChange={e=>setInput(e.target.value)}/>
    <label className="field-label" htmlFor="template-title">Worksheet title</label><input className="field-select" id="template-title" value={title} maxLength={70} onChange={e=>setTitle(e.target.value)}/>
    <button type="button" className="regenerate" onClick={()=>setSeed(x=>x+1)}><RefreshCw size={15}/> Shuffle worksheet</button>
    {words.length<3&&<p role="alert">Enter at least three items to preview.</p>}{error&&<p role="alert" className="error-message">{error}</p>}
    <p className="generator-setting-help">No AI quota or signup needed for these templates. Review the final worksheet before sharing.</p>
  </div><div className="preview-panel"><div className="preview-panel-top"><h2>Live printable preview</h2><span>A4 · Portrait</span></div>
    <div className="template-page-controls"><button type="button" disabled={pageIndex===0} onClick={()=>setPageIndex(x=>x-1)}>Previous</button><span>Page {pageIndex+1} of {Math.ceil(words.length/12)||1}</span><button type="button" disabled={pageIndex+1>=Math.ceil(words.length/12)} onClick={()=>setPageIndex(x=>x+1)}>Next</button></div><div className="template-preview"><canvas ref={canvas} aria-label="Printable worksheet preview"/></div>
    <div className="ai-download-row"><button type="button" className="button button-dark" disabled={words.length<3} onClick={()=>save('pdf')}><Download size={15}/> PDF</button><button type="button" className="button button-outline" disabled={words.length<3} onClick={()=>save('png')}><Download size={15}/> PNG</button><button type="button" className="button button-outline" disabled={words.length<3} onClick={()=>save('pdf',true)}>Teacher PDF</button></div>
   </div></div>
 </div>;
}
