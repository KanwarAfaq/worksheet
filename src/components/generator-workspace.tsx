
'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Download,Printer,RefreshCw,AlertCircle,CheckCircle2,FileText,RotateCcw} from 'lucide-react';
import {generate,normalizeWords,curated,type Difficulty,type GeneratorType,type Puzzle, type GeneratorOptions} from '@/lib/generators';
import {typeNames,typeDescriptions} from '@/lib/catalog';
import { answerCellIndices, solutionCssColor, solutionCellRgb } from '@/lib/solution-colors';
function StudentSheet({puzzle,title,instructions,showHints=false}:{puzzle:Puzzle;title:string;instructions?:string;showHints?:boolean}){
return <div className="print-sheet">
  <div className="print-head"><strong>worksheet<span>studio.</span></strong><span>NAME: __________________ &nbsp; DATE: ___________</span></div>
  <div className="print-title">{title}</div>
  <p className="print-instruction">{instructions || (puzzle.type==='word-search'?'Find and circle each hidden word in the grid.':puzzle.type==='word-scramble'?'Unscramble each word and write your answer on the line.':'Write the missing letters to complete each word.')}</p>
  {puzzle.grid&&<div className="letter-grid" style={{gridTemplateColumns:'repeat('+puzzle.grid.length+',minmax(0,1fr))'}}>{puzzle.grid.flatMap((row,i)=>row.map((letter,j)=><span key={i+'-'+j}>{letter}</span>))}</div>}
  {puzzle.grid&&<div className="word-bank">{puzzle.words.map(w=><span key={w}>{w.toUpperCase()}</span>)}</div>}
  {puzzle.items&&<ol className="activity-list">{puzzle.items.map((entry,i)=><li key={i}><span className="activity-question">{entry.question}</span>{puzzle.type==='word-scramble'&&showHints&&<span className="scramble-hint">Hint: {entry.answer.charAt(0).toUpperCase()} · {entry.answer.length} letters</span>}<span className="answer-line"/></li>)}</ol>}
  <div className="print-footer"><span>Keep learning, keep growing! ✳</span><span>worksheetstudio</span></div>
</div>;
}
function SolutionSheet({puzzle}:{puzzle:Puzzle}){
const key=answerCellIndices(puzzle);
return <div className="print-sheet teacher-sheet">
  <div className="print-head"><strong>worksheet<span>studio.</span></strong><span>TEACHER COPY</span></div>
  <div className="print-title">Answer Key</div>
  <p className="print-instruction">Solutions for your {typeNames[puzzle.type].toLowerCase()} worksheet.</p>
  {puzzle.grid&&<><div className="letter-grid" style={{gridTemplateColumns:'repeat('+puzzle.grid.length+',minmax(0,1fr))'}}>{puzzle.grid.flatMap((row,i)=>row.map((letter,j)=>{const wordIndex=key.get(i+'-'+j);return <span className={wordIndex!==undefined?'solution-letter':''} style={wordIndex!==undefined?{backgroundColor:solutionCssColor(wordIndex)}:undefined} key={i+'-'+j}>{letter}</span>;}))}</div><div className="word-bank solution-legend">{puzzle.words.map((w,i)=><span key={w} className="solution-legend-item"><i className="solution-swatch" style={{backgroundColor:solutionCssColor(i)}} aria-hidden="true"/>{w.toUpperCase()}</span>)}</div></>}
  {puzzle.items&&<ol className="solution-list">{puzzle.items.map((w,i)=><li key={i}>{w.answer}</li>)}</ol>}
  <div className="print-footer"><span>Teacher answer key</span><span>worksheetstudio</span></div>
</div>;
}
async function downloadPdf(puzzle:Puzzle,title:string,instructions:string,withAnswers:boolean,paper:'a4'|'letter',orientation:'portrait'|'landscape',showHints:boolean){
const {jsPDF}=await import('jspdf');
const pdf=new jsPDF({orientation,unit:'mm',format:paper});
const size=pdf.internal.pageSize;const width=size.getWidth(),height=size.getHeight();
const left=18,usable=width-36;
function init(heading:string,subtitle:string){
 pdf.setTextColor(25,59,51);pdf.setFont('helvetica','bold');pdf.setFontSize(12);pdf.text('worksheetstudio.',left,17);
 pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.setTextColor(90);pdf.text(subtitle,width-left,17,{align:'right'});
 pdf.setDrawColor(190);pdf.line(left,21,width-left,21);pdf.setTextColor(35);pdf.setFontSize(20);pdf.setFont('helvetica','bold');pdf.text(heading,left,35);
 pdf.setFontSize(10);pdf.setFont('helvetica','normal');pdf.setTextColor(85);pdf.text('Name: __________________     Date: ____________',left,43);
}
function grid(solution:boolean){
 if(!puzzle.grid)return;
 const side=puzzle.grid.length;
 const wordRows=Math.ceil(puzzle.words.length/3);
 const dims=Math.max(62,Math.min(usable,height-90-(wordRows*7)));
 const cell=dims/side;const x=(width-dims)/2;const y=59;
 const highlighted=solution?answerCellIndices(puzzle):new Map<string,number>();
 pdf.setFont('courier','bold');pdf.setFontSize(Math.min(15,cell*2.2));
 puzzle.grid.forEach((row,i)=>row.forEach((letter,j)=>{
 const wordIndex=highlighted.get(i+'-'+j);
 if(wordIndex!==undefined){const rgb=solutionCellRgb(wordIndex);pdf.setFillColor(rgb[0],rgb[1],rgb[2]);pdf.rect(x+j*cell,y+i*cell,cell,cell,'F');}
 pdf.setTextColor(35);pdf.text(letter,x+j*cell+cell/2,y+(i+.68)*cell,{align:'center'});
 }));
 pdf.setFont('helvetica','normal');pdf.setFontSize(11);pdf.setTextColor(60);
 const perRow=3;
 const columnWidth=usable/perRow;
 puzzle.words.forEach((word,i)=>{
   const column=i%perRow, row=Math.floor(i/perRow);
   const tx=left+column*columnWidth,ty=y+dims+12+row*7;
   if(solution){const color=solutionCellRgb(i);pdf.setFillColor(...color);pdf.roundedRect(tx,ty-3.5,5,4.6,1,1,'F');}
   pdf.setTextColor(55);pdf.setFontSize(9);
   pdf.text(word.toUpperCase().slice(0,16),tx+(solution?8:0),ty);
 });
}
function items(solution:boolean){
 pdf.setFont('helvetica','normal');pdf.setTextColor(35);
 let y=65;
 puzzle.items?.forEach((item,i)=>{
   if(y>height-20){
     pdf.addPage();init(solution?'Answer Key':title,solution?'TEACHER COPY':'STUDENT WORKSHEET');
     y=65;
   }
   pdf.setFontSize(12);
   pdf.text((i+1)+'.  '+(solution?item.answer:item.question),left,y);
   if(!solution && showHints && puzzle.type==='word-scramble'){
     pdf.setFontSize(9);pdf.setTextColor(105);
     pdf.text('Hint: '+item.answer.charAt(0).toUpperCase()+' / '+item.answer.length+' letters',left+55,y);
     pdf.setTextColor(35);
   }
   if(!solution){pdf.setDrawColor(130);pdf.line(width-75,y+1,width-left,y+1);}
   y+=10;
 });
}
init(title,'STUDENT WORKSHEET');
 pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.setTextColor(90);
 pdf.text(pdf.splitTextToSize(instructions||'Complete the activity below.',usable),left,49);
if(puzzle.grid)grid(false);else items(false);
if(withAnswers){pdf.addPage();init('Answer Key','TEACHER COPY');if(puzzle.grid)grid(true);else items(true);}
pdf.save('worksheet-'+puzzle.type+'.pdf');
}
export default function GeneratorWorkspace({type}:{type:GeneratorType}){
const [words,setWords]=useState(curated.Animals.join('\n'));
const [worksheetTitle,setWorksheetTitle]=useState(typeNames[type]);
const [instructions,setInstructions]=useState(type==='word-search'?'Find and circle the hidden words.':type==='word-scramble'?'Unscramble each word.':'Complete each word by filling in the missing letters.');
const [difficulty,setDifficulty]=useState<Difficulty>('easy');
const [gridSize,setGridSize]=useState(0);
const [missingPercent,setMissingPercent]=useState(40);
const [preserveFirst,setPreserveFirst]=useState(true);
const [showHints,setShowHints]=useState(false);
const [size,setSize]=useState<'a4'|'letter'>('a4');const [orientation,setOrientation]=useState<'portrait'|'landscape'>('portrait');
const [seed,setSeed]=useState(1234567);const [includeKey,setIncludeKey]=useState(true);const [view,setView]=useState<'student'|'answer'>('student');
const [busy,setBusy]=useState(false);const [exportError,setExportError]=useState('');
const result=useMemo(()=>{try{
 const options:GeneratorOptions=type==='word-search' ? (gridSize?{gridSize}:{}) : type==='missing-letters' ? {missingPercent,preserveFirst} : {};
 return{puzzle:generate(type,normalizeWords(words),seed,difficulty,options),error:''};}catch(e){return{puzzle:null,error:e instanceof Error?e.message:'Could not generate this worksheet.'};}},[words,difficulty,seed,type,gridSize,missingPercent,preserveFirst]);
async function exportPdf(){
 if(!result.puzzle)return;setBusy(true);setExportError('');
 try{await downloadPdf(result.puzzle,worksheetTitle.trim()||typeNames[type],instructions,includeKey,size,orientation,showHints);}
 catch(e){setExportError(e instanceof Error?e.message:'PDF export failed. Try printing to PDF instead.');}
 finally{setBusy(false);}
}
return <div className="container workspace"><Link className="back-link" href="/create"><ArrowLeft size={16}/> All makers</Link>
<div className="workspace-title"><div><div className="section-kicker">LET'S MAKE SOMETHING GREAT</div><h1>{typeNames[type]} <em>Maker.</em></h1><p>{typeDescriptions[type]} Preview as you go, then print or save your worksheet.</p></div><span className="free-bubble"><CheckCircle2 size={15}/> FREE · NO SIGN-UP</span></div>
<div className="workspace-grid">
<aside className="editor-panel">
<div className="editor-panel-heading"><span className="step-label">01</span><div><h2>Your words</h2><p>Enter 3–25 words, one per line or separated by commas.</p></div></div>
<label className="field-label" htmlFor="words">Word list</label><textarea id="words" className="word-input" spellCheck={false} value={words} onChange={e=>setWords(e.target.value)} rows={9} placeholder="cat&#10;dog&#10;lion"/>
<div className="presets-title">Or try an example:</div><div className="preset-chips">{Object.entries(curated).map(([name,list])=><button type="button" key={name} onClick={()=>{setWords(list.join('\n'));setSeed(1234567);}}>{name}</button>)}</div>
<div className="editor-divider"/><div className="editor-panel-heading"><span className="step-label">02</span><div><h2>Make it yours</h2><p>Choose how your worksheet looks.</p></div></div>
<label className="field-label" htmlFor="worksheet-title">Worksheet title</label><input id="worksheet-title" className="field-select" maxLength={85} value={worksheetTitle} onChange={e=>setWorksheetTitle(e.target.value)}/>
<label className="field-label" htmlFor="worksheet-instructions">Student instructions</label><textarea id="worksheet-instructions" className="word-input" rows={3} maxLength={220} value={instructions} onChange={e=>setInstructions(e.target.value)}/>
<label className="field-label" htmlFor="difficulty">Difficulty</label><select id="difficulty" className="field-select" value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
<div className="split-fields"><div><label className="field-label" htmlFor="paper-size">Paper size</label><select id="paper-size" className="field-select" value={size} onChange={e=>setSize(e.target.value as 'a4'|'letter')}><option value="a4">A4</option><option value="letter">US Letter</option></select></div><div><label className="field-label" htmlFor="orientation">Orientation</label><select id="orientation" className="field-select" value={orientation} onChange={e=>setOrientation(e.target.value as 'portrait'|'landscape')}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div></div>
{type==='word-search'&&<><label className="field-label" htmlFor="word-grid-size">Grid size</label>
<select id="word-grid-size" className="field-select" value={gridSize} onChange={e=>setGridSize(Number(e.target.value))}>
<option value={0}>Auto-fit words</option>{[10,12,14,16,18,20,24].map(n=><option key={n} value={n}>{n} × {n}</option>)}
</select><p className="generator-setting-help">Difficulty controls horizontal, vertical, diagonal and reverse directions.</p></>}
{type==='word-scramble'&&<label className="check-field"><input type="checkbox" checked={showHints} onChange={e=>setShowHints(e.target.checked)}/> Show first-letter and word-length hints</label>}
{type==='missing-letters'&&<>
<label className="field-label" htmlFor="missing-percent">Letters removed: {missingPercent}%</label>
<input className="generator-range" id="missing-percent" type="range" min={20} max={70} step={5} value={missingPercent} onChange={e=>setMissingPercent(Number(e.target.value))}/>
<label className="check-field"><input type="checkbox" checked={preserveFirst} onChange={e=>setPreserveFirst(e.target.checked)}/> Always keep the first letter visible</label></>}
<label className="check-field"><input type="checkbox" checked={includeKey} onChange={e=>setIncludeKey(e.target.checked)}/> Include separate teacher answer key in PDF</label>
<button className="regenerate" type="button" onClick={()=>setSeed(v=>v+817)}><RefreshCw size={17}/> Shuffle / regenerate</button>
</aside>
<section className="preview-panel"><div className="preview-panel-top"><div><span className="step-label">03</span><h2>Live preview</h2></div><div className="preview-actions"><button type="button" className={view==='student'?'selected':''} onClick={()=>setView('student')}>Student</button><button type="button" className={view==='answer'?'selected':''} onClick={()=>setView('answer')}>Answer key</button></div></div>
<div className="preview-canvas">{result.puzzle?(<div className={'preview-paper '+(size==='letter'?'paper-letter':'')+(orientation==='landscape'?' paper-landscape':'')}>{view==='student'?<StudentSheet title={worksheetTitle.trim()||typeNames[type]} instructions={instructions} showHints={showHints} puzzle={result.puzzle}/>:<SolutionSheet puzzle={result.puzzle}/>}</div>):<div className="error-state"><AlertCircle size={24}/><strong>Let's fix your word list</strong><p>{result.error}</p></div>}</div>
{exportError&&<p role="alert" className="error-message">{exportError}</p>}
<div className="preview-bottom"><div><FileText size={18}/><span>A4 / Letter ready · Live printable preview</span></div><div className="export-buttons"><button type="button" className="button button-outline" disabled={!result.puzzle} onClick={()=>window.print()}><Printer size={17}/> Print</button><button type="button" disabled={!result.puzzle||busy} className="button button-dark" onClick={exportPdf}><Download size={17}/>{busy?'Preparing…':'Download PDF'}</button></div></div>
<p className="preview-helper"><RotateCcw size={14}/> Custom word lists stay in your browser. Use print settings to select paper size and orientation for direct printing.</p>
</section></div>
{result.puzzle&&<><style media="print">{`@page { size: ${size==='a4'?'A4':'letter'} ${orientation}; margin: 0; }`}</style><div className="print-only" aria-hidden="true"><StudentSheet puzzle={result.puzzle} title={worksheetTitle.trim()||typeNames[type]} instructions={instructions} showHints={showHints}/>{includeKey&&<div className="print-key"><SolutionSheet puzzle={result.puzzle}/></div>}</div></>}
</div>;
}
