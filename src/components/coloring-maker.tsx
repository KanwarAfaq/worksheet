'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,Check,Download,Plus,RotateCcw} from 'lucide-react';
import {
 coloringChoices,coloringGroups,coloringNames,drawColoringObject,suggestedColors,
 isColoringObject,type ColoringObject
} from '@/lib/coloring-worksheet';

type Group=typeof coloringGroups[number]['slug']|'all';
type Props={initialGroup?:string};
const initialFor:Record<Group,ColoringObject[]>={
 all:['cat','apple'],animals:['cat','fish'],fruits:['apple'],nature:['tree','sun'],
 shapes:['star','ball'],objects:['computer','house']
};
function render(canvas:HTMLCanvasElement,objects:ColoringObject[],grade:number,title:string,example:boolean){
 canvas.width=1240;canvas.height=1754;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#204c3b';ctx.font='bold 29px Arial';ctx.fillText('worksheetstudio.',85,96);
 ctx.strokeStyle='#c4d3c8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(80,123);ctx.lineTo(1160,123);ctx.stroke();
 ctx.fillStyle='#183d2c';ctx.font='bold 48px Arial';ctx.fillText(title.slice(0,37),85,196);
 ctx.font='25px Arial';ctx.fillText('Grade '+grade+'    |    Name: __________________________',85,254);
 ctx.fillStyle='#42634e';ctx.font='24px Arial';
 ctx.fillText(example?'Color suggestions: '+objects.map(o=>coloringNames[o]+' – '+suggestedColors[o]).join(' · ').slice(0,68):
  'Color each picture using your favorite colors.',85,310);
 objects.forEach((obj,i)=>{
  let x:number,y:number,w:number,h:number,labelY:number;
  if(objects.length===1){x=240;y=402;w=760;h=785;labelY=1260;}
  else if(objects.length===2){x=100+i*540;y=486;w=490;h=625;labelY=1175;}
  else{x=110+(i%2)*535;y=380+Math.floor(i/2)*575;w=480;h=425;labelY=y+487;}
  drawColoringObject(ctx,obj,x,y,w,h,example);
  ctx.fillStyle='#153f31';ctx.font='bold 32px Arial';ctx.textAlign='center';
  ctx.fillText(coloringNames[obj],x+w/2,labelY);
  if(example){ctx.font='22px Arial';ctx.fillText('Suggested: '+suggestedColors[obj],x+w/2,labelY+34);}
  ctx.textAlign='left';
 });
 ctx.fillStyle='#73867c';ctx.font='20px Arial';
 ctx.fillText(example?'Teacher color suggestions':'Color and enjoy! · Worksheet Studio',85,1697);
}
export default function ColoringMaker({initialGroup}:Props){
 const initial=(coloringGroups.some(g=>g.slug===initialGroup)?initialGroup:'all') as Group;
 const [group,setGroup]=useState<Group>(initial);
 const [objects,setObjects]=useState<ColoringObject[]>(initialFor[initial]);
 const [word,setWord]=useState('');
 const [title,setTitle]=useState('My Coloring Page');
 const [grade,setGrade]=useState(1);
 const [error,setError]=useState('');
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{if(canvas.current)render(canvas.current,objects,grade,title||'Coloring Page',false);},[objects,grade,title]);
 function choose(value:ColoringObject){
  if(objects.includes(value)){setObjects(old=>old.filter(x=>x!==value));setError('');return;}
  if(objects.length===4){setError('Choose a maximum of four drawings. Remove one before adding another.');return;}
  setObjects(old=>[...old,value]);setError('');
 }
 function addTyped(event:FormEvent){
  event.preventDefault();
  const names=word.toLowerCase().split(/,|;|\band\b/).map(s=>s.trim().replace(/^(?:a|an|the)\s+/,'').trim()).filter(Boolean);
  if(!names.length)return;
  const unknown=names.filter(name=>!isColoringObject(name));
  if(unknown.length){setError('No built-in drawing for '+unknown.map(x=>'"'+x+'"').join(', ')+'. Choose a listed object.');return;}
  const unique=[...new Set([...objects,...names as ColoringObject[]])];
  if(unique.length>4){setError('Maximum four different objects per page.');return;}
  setObjects(unique);setError('');setWord('');
 }
 async function download(format:'pdf'|'png',example=false){
  if(!objects.length){setError('Choose at least one object.');return;}
  const output=document.createElement('canvas');
  render(output,objects,grade,title||'Coloring Page',example);
  const filename=(example?'color-example':'coloring-page')+'-'+objects.join('-');
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
 return <section className="container workspace dedicated-color-maker">
  <Link href="/colors" className="back-link"><ArrowLeft size={18}/> Color worksheets</Link>
  <div className="section-kicker">FREE COLORING MAKER</div>
  <h1>Create a <em>coloring page.</em></h1>
  <div className="color-maker-grid">
   <div className="editor-panel color-maker-controls">
    <h2>Choose 1–4 objects</h2>
    <div className="color-group-tabs" aria-label="Drawing categories">
      {([{slug:'all',title:'All'},...coloringGroups] as const).map(g=>
       <button type="button" className={group===g.slug?'active':''} onClick={()=>setGroup(g.slug)}
        key={g.slug}>{g.title}</button>)}
    </div>
    <div className="color-object-list" aria-label="Available outline drawings">
     {visible.map(item=><button type="button" key={item} aria-pressed={objects.includes(item)}
       className={'color-object-item '+(objects.includes(item)?'chosen':'')} onClick={()=>choose(item)}>
       <span>{coloringNames[item]}</span><span className="color-checkbox">{objects.includes(item)&&<Check size={18}/>}</span>
     </button>)}
    </div>
    <p className="color-selection-count">{objects.length} of 4 objects selected</p>
    <form onSubmit={addTyped} className="color-type-row">
     <label htmlFor="custom-color-word">Type an object name</label>
     <div><input id="custom-color-word" value={word} onChange={e=>setWord(e.target.value)}
      placeholder="e.g. computer" maxLength={70}/>
      <button type="submit"><Plus size={19}/> Add</button></div>
    </form>
    {error&&<p role="alert" className="color-maker-error">{error}</p>}
    <div className="color-page-settings">
      <label htmlFor="color-page-title">Page title</label>
      <input id="color-page-title" maxLength={37} value={title} onChange={e=>setTitle(e.target.value)}/>
      <label htmlFor="color-grade">Grade</label>
      <select id="color-grade" value={grade} onChange={e=>setGrade(Number(e.target.value))}>
       {[1,2,3,4,5,6].map(n=><option key={n} value={n}>Grade {n}</option>)}
      </select>
    </div>
    <button className="color-reset" type="button" onClick={()=>{setObjects(['cat','apple']);setGroup('all');setError('');}}>
     <RotateCcw size={17}/> Reset selection</button>
   </div>
   <div className="preview-panel color-preview-panel">
    <div className="preview-panel-top"><h2>Live preview</h2><span>A4 · One page</span></div>
    <canvas ref={canvas} width={1240} height={1754} aria-label="Preview of selected printable outline drawings"/>
    <div className="color-preview-buttons">
      <button type="button" className="button button-dark" disabled={!objects.length} onClick={()=>download('pdf')}>
        <Download size={18}/> Download PDF</button>
      <button type="button" className="button button-outline" disabled={!objects.length} onClick={()=>download('png')}>
        <Download size={18}/> Download PNG</button>
      <button type="button" className="button button-outline" disabled={!objects.length} onClick={()=>download('pdf',true)}>
        Color guide</button>
    </div>
   </div>
  </div>
 </section>;
}
