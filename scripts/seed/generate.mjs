// Generates the starter worksheet pack: A4 PDFs (student + answer key) and src/lib/seed-pack.json.
// Run: node scripts/seed/generate.mjs   (needs playwright + a chromium binary)
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const OUT=path.resolve('public/_seed');
fs.mkdirSync(OUT,{recursive:true});

function rng(seed){let v=seed>>>0;return()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296;};}
function shuffle(a,seed){const n=rng(seed),o=[...a];for(let i=o.length-1;i>0;i--){const j=Math.floor(n()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ---------- shared styles ---------- */
const CSS=`
@page{size:A4;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:'Noto Sans','DejaVu Sans',Arial,sans-serif;color:#1f2433}
.page{width:210mm;height:297mm;padding:12mm 14mm 10mm;display:flex;flex-direction:column;page-break-after:always;overflow:hidden}
.page:last-child{page-break-after:auto}
.head{display:flex;justify-content:space-between;gap:10mm;font-size:12pt;border-bottom:1.6px solid #2b3150;padding-bottom:3mm}
.head span{flex:1}.head span+span{flex:.6}
h1{font-size:25pt;line-height:1.15;margin:5mm 0 1.5mm;letter-spacing:-.01em}
.instr{font-size:13pt;margin:0 0 3.5mm;color:#39405a}
.example{border:1.6px dashed #6b7399;border-radius:3mm;background:#f6f8ff;padding:2.6mm 4mm;margin:0 0 4mm;display:flex;align-items:center;gap:5mm}
.example .tag{font-weight:800;font-size:10pt;letter-spacing:.08em;color:#fff;background:#4b57c9;border-radius:99px;padding:1mm 3.2mm;flex:none}
.example .body{font-size:15pt;flex:1;display:flex;align-items:center;gap:3mm;flex-wrap:wrap}
.grid{flex:1;display:grid;gap:0 7mm;align-content:stretch;grid-auto-rows:1fr}
.cell{display:flex;align-items:center;gap:3mm;border-bottom:1px dotted #b8bdd2;font-size:17pt;font-weight:600;min-height:0}
.cell .t{flex:1;white-space:nowrap}
.box{display:inline-block;border:2px solid #2b3150;border-radius:2.2mm;background:#fff;width:24mm;height:11mm;vertical-align:middle;flex:none}
.box.wide{width:100%;height:12mm}.box.sm{width:17mm;height:10mm}.box.tall{width:100%;height:20mm}.box.md{width:36mm}
.ex-box{display:inline-flex;align-items:center;justify-content:center;border:2px solid #2b3150;border-radius:2.2mm;min-width:20mm;height:10mm;padding:0 3mm;font-weight:800;color:#4b57c9;background:#fff}
.stack{display:flex;flex-direction:column;justify-content:center;gap:1.6mm;border-bottom:1px dotted #b8bdd2;font-size:15.5pt;font-weight:600;padding:1mm 0}
.stack .box{width:100%}
.foot{display:flex;justify-content:space-between;font-size:8.5pt;color:#7a8099;border-top:1px solid #dcdfec;padding-top:2mm;margin-top:3mm}
.passage{font-size:13pt;line-height:1.5;border:1.6px solid #2b3150;border-radius:3mm;padding:4mm 5mm;margin-bottom:4mm;background:#fffdf5}
.passage h2{margin:0 0 2mm;font-size:16pt}
.bank{display:flex;flex-wrap:wrap;gap:2.5mm;border:1.6px solid #2b3150;border-radius:3mm;padding:3mm 4mm;margin-bottom:4mm;font-size:14pt;font-weight:700;background:#fff8e6}
.frac{display:inline-flex;flex-direction:column;align-items:center;gap:1mm}.frac i{display:block;width:100%;height:2px;background:#2b3150}.frac .box{width:13mm;height:9mm}
.keyrow{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm 6mm;font-size:13pt}.keyrow div{border-bottom:1px dotted #b8bdd2;padding:1.6mm 0}.keyrow b{color:#4b57c9}
.cp{flex:1;display:flex;align-items:center;justify-content:center;border:2px solid #2b3150;border-radius:4mm;margin-top:2mm;overflow:hidden}
.cp svg{width:100%;height:100%}
`;
const page=(inner,w)=>`<section class="page">
 <div class="head"><span>Name: ____________________________</span><span>Date: ______________</span></div>
 ${inner}
 <div class="foot"><span>${esc(w.grade)} · ${esc(w.label)}</span><span>worksheet.live · free printable</span></div></section>`;
const doc=body=>`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
const exampleHtml=h=>`<div class="example"><span class="tag">EXAMPLE</span><div class="body">${h}</div></div>`;

/* ---------- layouts ---------- */
// cells: [{t:'34 + 25 =',a:'59'}] -> text + answer box
function cellsPage(w,{cols,boxClass=''}){
 const cells=w.items.map(i=>`<div class="cell"><span class="t">${i.t}</span><span class="box ${boxClass}"></span></div>`).join('');
 const rows=Math.ceil(w.items.length/cols);
 return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}
 <div class="grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells}</div>`,w);
}
// stack: item text above a wide answer box
function stackPage(w,{cols=1,boxClass='wide'}){
 const cells=w.items.map(i=>`<div class="stack"><span>${i.t}</span><span class="box ${boxClass}"></span></div>`).join('');
 const rows=Math.ceil(w.items.length/cols);
 return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}
 <div class="grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells}</div>`,w);
}
function passagePage(w){
 const qs=w.items.map(i=>`<div class="stack"><span>${i.t}</span><span class="box wide" style="height:${w.qh||13}mm"></span></div>`).join('');
 return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>
 <div class="passage"><h2>${esc(w.passageTitle)}</h2>${w.passage.map(p=>`<p style="margin:0 0 2mm">${p}</p>`).join('')}</div>
 ${exampleHtml(w.example)}
 <div class="grid" style="grid-template-columns:1fr;grid-template-rows:repeat(${w.items.length},1fr)">${qs}</div>`,w);
}
function bankPage(w,{cols=2}){
 const cells=w.items.map(i=>`<div class="cell"><span class="t">${i.t}</span><span class="box md"></span></div>`).join('');
 const rows=Math.ceil(w.items.length/cols);
 return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>
 <div class="bank">${w.bank.map(b=>`<span>${esc(b)}</span>`).join('')}</div>${exampleHtml(w.example)}
 <div class="grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells}</div>`,w);
}
function keyPage(w){
 const rows=w.items.map(i=>`<div>${w.keyText?w.keyText(i):`${i.t.replace(/<[^>]+>/g,'')} <b>${esc(i.a)}</b>`}</div>`).join('');
 return `<section class="page"><div class="head"><span>Teacher / parent answer key</span><span></span></div><h1>${esc(w.title)} — Answers</h1>
 <p class="instr">Check each answer. Accept clear, neat answers in the student's own handwriting.</p><div class="keyrow" style="${w.keyCols?`grid-template-columns:repeat(${w.keyCols},1fr)`:''}">${rows}</div>
 <div class="foot" style="margin-top:auto"><span>${esc(w.grade)} · ${esc(w.label)}</span><span>worksheet.live</span></div></section>`;
}

/* ---------- SVG helpers ---------- */
function clock(h,m){
 const cx=60,cy=60;let s='<svg viewBox="0 0 120 120" width="30mm" height="30mm"><circle cx="60" cy="60" r="55" fill="#fff" stroke="#2b3150" stroke-width="4"/>';
 for(let i=1;i<=12;i++){const a=i*Math.PI/6;s+=`<text x="${cx+42*Math.sin(a)}" y="${cy-42*Math.cos(a)+5}" font-size="13" font-weight="700" text-anchor="middle" fill="#2b3150">${i}</text>`;}
 const ha=((h%12)+m/60)*Math.PI/6,ma=m*Math.PI/30;
 s+=`<line x1="60" y1="60" x2="${cx+26*Math.sin(ha)}" y2="${cy-26*Math.cos(ha)}" stroke="#2b3150" stroke-width="6" stroke-linecap="round"/>`;
 s+=`<line x1="60" y1="60" x2="${cx+38*Math.sin(ma)}" y2="${cy-38*Math.cos(ma)}" stroke="#4b57c9" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="4" fill="#2b3150"/></svg>`;
 return s;
}
function pie(parts,shaded,shape){
 if(shape==='rect'){let s='<svg viewBox="0 0 120 70" width="34mm" height="20mm">';const w=110/parts;for(let i=0;i<parts;i++)s+=`<rect x="${5+i*w}" y="8" width="${w}" height="54" fill="${i<shaded?'#9fb0ff':'#fff'}" stroke="#2b3150" stroke-width="3"/>`;return s+'</svg>';}
 let s='<svg viewBox="0 0 120 120" width="26mm" height="26mm">';
 for(let i=0;i<parts;i++){const a0=i*2*Math.PI/parts-Math.PI/2,a1=(i+1)*2*Math.PI/parts-Math.PI/2;
  const x0=60+52*Math.cos(a0),y0=60+52*Math.sin(a0),x1=60+52*Math.cos(a1),y1=60+52*Math.sin(a1);
  s+=`<path d="M60 60 L${x0} ${y0} A52 52 0 ${parts===1?1:0} 1 ${x1} ${y1} Z" fill="${i<shaded?'#9fb0ff':'#fff'}" stroke="#2b3150" stroke-width="3"/>`;}
 return s+'</svg>';
}

/* ---------- MATH ---------- */
const W=[];
const mk=(o)=>W.push(o);
function mathItems(list,fmt,ans,seed,n){return shuffle(list,seed).slice(0,n).map(p=>({t:fmt(p),a:String(ans(p))}));}

{ // M1
 const l=[];for(let a=11;a<=88;a++)for(let b=11;b<=88;b++){if(a%10+b%10<=9&&Math.floor(a/10)+Math.floor(b/10)<=9&&a%10&&b%10)l.push([a,b]);}
 mk({slug:'addition-within-100-no-regrouping',title:'Addition Within 100: Two-Digit Numbers',category:'math',grade:'Grade 2',label:'Addition',difficulty:'beginner',layout:'cells',cols:3,
  seoTitle:'Two-Digit Addition Worksheet Within 100 (No Regrouping) | Free PDF',
  seoDescription:'Free printable two-digit addition worksheet within 100 with no regrouping. 24 clean questions with answer boxes, a worked example and an answer key. A4 PDF.',
  summary:'24 two-digit addition questions within 100 with no regrouping. Each has its own answer box, with a worked example at the top and a separate answer key. Free A4 PDF for Grade 2.',
  description:'Practise adding two-digit numbers without regrouping. Students add the ones, then the tens, and write the sum in the box. A worked example is shown first. An answer key is included for teachers and parents.',
  tags:['addition','two-digit','grade 2','math','no regrouping'],instructions:'Add the numbers. Write each answer in the box.',
  example:`34 + 25 = <span class="ex-box">59</span>`,items:mathItems(l,([a,b])=>`${a} + ${b} =`,([a,b])=>a+b,101,24)});
}
{ // M2
 const l=[];for(let a=20;a<=99;a++)for(let b=11;b<a;b++){if(a%10>=b%10&&Math.floor(a/10)>Math.floor(b/10)&&b%10)l.push([a,b]);}
 mk({slug:'subtraction-within-100-no-borrowing',title:'Subtraction Within 100: Two-Digit Numbers',category:'math',grade:'Grade 2',label:'Subtraction',difficulty:'beginner',layout:'cells',cols:3,
  seoTitle:'Two-Digit Subtraction Worksheet Within 100 | Free Printable PDF',
  seoDescription:'Free printable two-digit subtraction worksheet within 100, no borrowing. 24 clean questions, answer boxes, a worked example and an answer key. A4 PDF for Grade 2.',
  summary:'24 two-digit subtraction questions within 100 with no borrowing. Large answer boxes, a worked example and a separate answer key. Free A4 PDF for Grade 2.',
  description:'Subtract two-digit numbers when no borrowing is needed. Students take away the ones, then the tens, and write the difference in the box. Includes a worked example and an answer key.',
  tags:['subtraction','two-digit','grade 2','math'],instructions:'Subtract. Write each answer in the box.',
  example:`68 − 24 = <span class="ex-box">44</span>`,items:mathItems(l,([a,b])=>`${a} − ${b} =`,([a,b])=>a-b,102,24)});
}
{ // M3 missing addend
 const l=[];for(let s=8;s<=20;s++)for(let a=1;a<s;a++){if(s-a>=1&&s-a<=12&&a<=12)l.push([a,s]);}
 const items=shuffle(l,103).slice(0,20).map(([a,s])=>{const flip=(a+s)%2===0;return{t:flip?`<span class="box sm"></span> + ${a} = ${s}`:`${a} + <span class="box sm"></span> = ${s}`,a:String(s-a),plain:flip?`□ + ${a} = ${s}`:`${a} + □ = ${s}`};});
 mk({slug:'missing-number-addition-within-20',title:'Find the Missing Number: Addition Within 20',category:'math',grade:'Grade 1',label:'Missing numbers',difficulty:'beginner',layout:'free',cols:2,
  seoTitle:'Missing Number Addition Worksheet Within 20 | Free Printable',
  seoDescription:'Free missing addend worksheet within 20. 20 clean "find the missing number" questions with answer boxes, a worked example and answer key. A4 PDF, Grade 1.',
  summary:'20 missing-number addition questions within 20. The answer goes in the empty box inside each number sentence. Includes a worked example and a separate answer key. Free A4 PDF for Grade 1.',
  description:'Students find the missing number that completes each addition sentence and write it in the box. This builds number bonds, fact families and early algebra thinking.',
  tags:['missing number','addition','number bonds','grade 1'],instructions:'Find the missing number. Write it in the empty box.',
  example:`5 + <span class="ex-box">4</span> = 9`,items,keyText:i=>`${i.plain} <b>${i.a}</b>`});
}
{ // M4
 const l=[];for(let a=6;a<=9;a++)for(let b=2;b<=9;b++)l.push([a,b]);
 mk({slug:'multiplication-facts-6-to-9',title:'Multiplication Facts: 6, 7, 8 and 9 Times Tables',category:'math',grade:'Grade 3',label:'Multiplication',difficulty:'intermediate',layout:'cells',cols:3,
  seoTitle:'Multiplication Worksheet: 6, 7, 8 and 9 Times Tables | Free PDF',
  seoDescription:'Free printable multiplication facts worksheet for the 6, 7, 8 and 9 times tables. 24 clean questions with answer boxes, a worked example and an answer key.',
  summary:'24 mixed multiplication facts from the 6, 7, 8 and 9 times tables with answer boxes, a worked example and a separate answer key. Free A4 PDF for Grade 3.',
  description:'Build fluency with the harder times tables. Students multiply and write each product in the box. A worked example is shown first, and an answer key is included.',
  tags:['multiplication','times tables','grade 3','math facts'],instructions:'Multiply. Write each answer in the box.',
  example:`7 × 6 = <span class="ex-box">42</span>`,items:mathItems(l,([a,b])=>`${a} × ${b} =`,([a,b])=>a*b,104,24)});
}
{ // M5
 const l=[];for(let d=2;d<=9;d++)for(let q=2;q<=9;q++)l.push([d*q,d]);
 mk({slug:'division-facts-within-81',title:'Division Facts Within 81',category:'math',grade:'Grade 3',label:'Division',difficulty:'intermediate',layout:'cells',cols:3,
  seoTitle:'Division Facts Worksheet Within 81 | Free Printable PDF',
  seoDescription:'Free printable division facts worksheet within 81. 24 clean questions with answer boxes, a worked example and an answer key. A4 PDF for Grade 3.',
  summary:'24 division facts within 81 with a clear answer box for each, a worked example and a separate answer key. Free A4 PDF for Grade 3.',
  description:'Practise division as the opposite of multiplication. Students divide and write each quotient in the box. Includes a worked example and an answer key.',
  tags:['division','division facts','grade 3','math'],instructions:'Divide. Write each answer in the box.',
  example:`42 ÷ 6 = <span class="ex-box">7</span>`,items:mathItems(l,([n,d])=>`${n} ÷ ${d} =`,([n,d])=>n/d,105,24)});
}
{ // M6 compare
 const base=[];for(let i=0;i<40;i++){const r=rng(900+i);const a=10+Math.floor(r()*89);let b=10+Math.floor(r()*89);if(i%8===0)b=a;base.push([a,b]);}
 const items=shuffle(base,106).slice(0,24).map(([a,b])=>({t:`${a} <span class="box sm" style="width:15mm"></span> ${b}`,a:a>b?'>':a<b?'<':'=',plain:`${a} ? ${b}`}));
 mk({slug:'compare-numbers-greater-less-equal',title:'Compare Numbers: Greater Than, Less Than, Equal',category:'math',grade:'Grade 2',label:'Comparing numbers',difficulty:'beginner',layout:'free',cols:3,
  seoTitle:'Compare Numbers Worksheet: Greater Than, Less Than | Free PDF',
  seoDescription:'Free compare numbers worksheet for Grade 2. Write <, > or = in the box for 24 pairs of two-digit numbers. Worked example and answer key included. A4 PDF.',
  summary:'24 pairs of two-digit numbers to compare using <, > or =. The symbol goes in the box between the numbers. Includes a worked example and answer key. Free A4 PDF for Grade 2.',
  description:'Students compare two-digit numbers and write the correct symbol (<, > or =) in the box. A reminder of the symbols appears in the worked example.',
  tags:['comparing numbers','greater than','less than','grade 2'],instructions:'Write <, > or = in the box.',
  example:`47 <span class="ex-box">&gt;</span> 39 &nbsp;&nbsp;<small style="font-size:11pt;color:#555">(47 is greater than 39)</small>`,items,keyText:i=>`${i.plain.replace('?',`<b>${esc(i.a)}</b>`)}`});
}
{ // M7 rounding
 const nums=shuffle(Array.from({length:89},(_,i)=>i+11).filter(n=>n%10!==0),107).slice(0,24);
 mk({slug:'round-to-the-nearest-ten',title:'Round to the Nearest Ten',category:'math',grade:'Grade 3',label:'Rounding',difficulty:'intermediate',layout:'cells',cols:3,
  seoTitle:'Rounding to the Nearest 10 Worksheet | Free Printable PDF',
  seoDescription:'Free rounding to the nearest ten worksheet. 24 clean questions with answer boxes, a worked example and an answer key. Printable A4 PDF for Grade 3.',
  summary:'24 numbers to round to the nearest ten, each with an answer box. Includes a worked example with the rounding rule and a separate answer key. Free A4 PDF for Grade 3.',
  description:'Students round two-digit numbers to the nearest ten. The worked example shows the rule: look at the ones digit; 5 or more rounds up, 4 or less rounds down.',
  tags:['rounding','nearest ten','place value','grade 3'],instructions:'Round each number to the nearest ten. Write the answer in the box.',
  example:`47 → <span class="ex-box">50</span> <small style="font-size:11pt;color:#555">(7 is 5 or more, so round up)</small>`,
  items:nums.map(n=>({t:`${n} →`,a:String(Math.round(n/10)*10)}))});
}
{ // M8 word problems
 const T=[['Mia has 14 stickers and gets 9 more. How many stickers does she have now?',23,'stickers'],['There are 32 birds in a tree. 11 fly away. How many birds are left?',21,'birds'],['A shop sells 25 red apples and 18 green apples. How many apples is that in all?',43,'apples'],['Sam reads 16 pages on Monday and 24 pages on Tuesday. How many pages did he read?',40,'pages'],['A bus has 45 seats. 29 seats are full. How many seats are empty?',16,'seats'],['Lena picks 36 flowers. She gives 12 to her friend. How many flowers does she have left?',24,'flowers'],['A class has 17 girls and 15 boys. How many children are in the class?',32,'children'],['Omar has 50 marbles. He loses 18. How many marbles does he have now?',32,'marbles']];
 mk({slug:'addition-subtraction-word-problems',title:'Word Problems: Add and Subtract Within 100',category:'math',grade:'Grade 2',label:'Word problems',difficulty:'intermediate',layout:'words',
  seoTitle:'Add and Subtract Word Problems Within 100 | Free Worksheet',
  seoDescription:'Free add and subtract word problems within 100 for Grade 2. 8 short stories with clear answer boxes, a worked example and an answer key. Printable A4 PDF.',
  summary:'8 short addition and subtraction word problems within 100. Each has a clear answer box, there is a worked example, and a separate answer key is included. Free A4 PDF for Grade 2.',
  description:'Students read each short story, decide whether to add or subtract, and write the number in the box. Includes a worked example that shows how to find the key numbers.',
  tags:['word problems','addition','subtraction','grade 2'],instructions:'Read the problem. Write the answer in the box.',
  example:`Ben has 12 pens. He buys 7 more. How many pens? <span class="ex-box">19 pens</span>`,
  items:T.map(([q,a,u])=>({t:q,a:`${a} ${u}`,unit:u}))});
}
{ // M9 fractions
 const specs=[[2,1],[3,2],[4,1],[4,3],[5,2],[6,5],[8,3],[3,1],[5,4],[6,1],[8,5],[2,1]];
 const items=specs.map(([p,s],i)=>({t:pie(p,s,i%3===2?'rect':'circle'),a:`${s}/${p}`,frac:true}));
 mk({slug:'fractions-name-the-shaded-part',title:'Fractions: Name the Shaded Part',category:'math',grade:'Grade 3',label:'Fractions',difficulty:'intermediate',layout:'frac',cols:3,
  seoTitle:'Fractions Worksheet: Name the Shaded Part | Free Printable',
  seoDescription:'Free fractions worksheet for Grade 3. Write the fraction for each shaded shape in the boxes. 12 clean pictures, a worked example and an answer key. A4 PDF.',
  summary:'12 shapes divided into equal parts with some parts shaded. Students write the fraction in the two boxes (top and bottom). Includes a worked example and an answer key. Free A4 PDF for Grade 3.',
  description:'Students look at each shape, count the shaded parts and the total equal parts, and write the fraction. The worked example explains which number goes on top and which on the bottom.',
  tags:['fractions','shaded','numerator','denominator','grade 3'],instructions:'Write the fraction for the shaded part. Top box: shaded parts. Bottom box: all equal parts.',
  example:`${pie(4,3,'circle').replace('26mm','20mm').replace('26mm','20mm')} <span class="frac"><span class="ex-box" style="min-width:13mm">3</span><i></i><span class="ex-box" style="min-width:13mm">4</span></span>`,items,keyText:i=>`Shape <b>${esc(i.a)}</b>`,keyCols:4});
}
{ // M10 clocks
 const times=[[1,0],[2,30],[3,0],[4,30],[5,0],[6,30],[7,0],[8,30],[9,0],[10,30],[11,0],[12,30]];
 const items=shuffle(times,110).map(([h,m])=>({t:clock(h,m),a:`${h}:${m===0?'00':'30'}`}));
 mk({slug:'telling-time-hour-and-half-hour',title:'Telling Time: Hour and Half Hour',category:'math',grade:'Grade 1',label:'Telling time',difficulty:'beginner',layout:'clock',cols:3,
  seoTitle:'Telling Time Worksheet: Hour and Half Hour | Free Printable',
  seoDescription:'Free telling time worksheet for Grade 1. Read 12 clocks to the hour and half hour and write the time in the box. Worked example and answer key. Printable A4 PDF.',
  summary:'12 analog clocks showing times on the hour and half hour. Students write each time in the box. Includes a worked example and an answer key. Free A4 PDF for Grade 1.',
  description:'Students read the short hour hand and the long minute hand, then write the time like 3:30. The worked example shows how the minute hand pointing to 6 means half past.',
  tags:['telling time','clocks','half past','grade 1'],instructions:'Look at the clock. Write the time in the box.',
  example:`${clock(3,0).replace(/30mm/g,'20mm')} <span class="ex-box">3:00</span>`,items,keyText:i=>`Clock <b>${i.a}</b>`,keyCols:4});
}
{ // M11 odd even
 const nums=shuffle(Array.from({length:80},(_,i)=>i+10),111).slice(0,24);
 mk({slug:'odd-and-even-numbers',title:'Odd and Even Numbers',category:'math',grade:'Grade 2',label:'Odd and even',difficulty:'beginner',layout:'cells',cols:3,boxClass:'md',
  seoTitle:'Odd and Even Numbers Worksheet | Free Printable PDF, Grade 2',
  seoDescription:'Free odd and even numbers worksheet for Grade 2. Write odd or even in the box for 24 numbers. Worked example with the ones-digit rule and an answer key. A4 PDF.',
  summary:'24 numbers for students to label odd or even, with a box for each answer. The worked example shows the ones-digit rule. A separate answer key is included. Free A4 PDF for Grade 2.',
  description:'Students look at the ones digit to decide if a number is odd or even and write the word in the box. A reminder is shown in the example: ones digit 0, 2, 4, 6 or 8 means even.',
  tags:['odd and even','number sense','grade 2','math'],instructions:'Write odd or even in the box.',
  example:`36 → <span class="ex-box" style="min-width:26mm">even</span> <small style="font-size:11pt;color:#555">(ends in 6)</small>`,
  items:nums.map(n=>({t:`${n} →`,a:n%2?'odd':'even'}))});
}

/* ---------- ENGLISH ---------- */
{ // E1 parts of speech
 const S=[['The <u>happy</u> dog ran home.','adjective'],['Birds <u>sing</u> every morning.','verb'],['I put the <u>book</u> on the desk.','noun'],['She drew a <u>big</u> circle.','adjective'],['The children <u>jump</u> over the rope.','verb'],['My <u>sister</u> likes apples.','noun'],['We saw a <u>tall</u> tree.','adjective'],['The cat <u>sleeps</u> on the sofa.','verb'],['A <u>bird</u> sat on the fence.','noun'],['He wore a <u>red</u> hat.','adjective'],['Dad <u>cooks</u> dinner.','verb'],['The <u>river</u> is cold.','noun']];
 mk({slug:'nouns-verbs-and-adjectives-sort',title:'Nouns, Verbs and Adjectives',category:'grammar',grade:'Grade 2',label:'Parts of speech',difficulty:'beginner',layout:'stack',cols:2,boxClass:'wide',
  seoTitle:'Nouns, Verbs and Adjectives Worksheet | Free Printable',
  seoDescription:'Free parts of speech worksheet for Grade 2. Decide if each underlined word is a noun, verb or adjective. 12 sentences, worked example and answer key. A4 PDF.',
  summary:'12 sentences with one underlined word each. Students write whether it is a noun, verb or adjective in the box. Includes a worked example and a separate answer key. Free A4 PDF for Grade 2.',
  description:'A clear grammar sort. Nouns name people, places and things; verbs show action; adjectives describe. The worked example reminds students what each word type does.',
  tags:['nouns','verbs','adjectives','parts of speech','grade 2'],instructions:'Read each sentence. Is the underlined word a noun, a verb or an adjective? Write it in the box.',
  example:`The <u>fast</u> car stopped. → <span class="ex-box">adjective</span>`,items:S.map(([t,a])=>({t,a}))});
}
{ // E2 capitals and full stops
 const S=['the cat sat on the mat','we go to school on monday','my friend has a red kite','it is raining in london','sara and tom play in the park','i like to read books at night','our teacher is mrs brown','birds fly in the blue sky'];
 const fix=s=>s.replace(/\bi\b/g,'I').replace(/(^|\s)(monday|london|sara|tom|mrs|brown)\b/g,(m,p,w)=>p+w[0].toUpperCase()+w.slice(1)).replace(/^./,c=>c.toUpperCase())+'.';
 mk({slug:'capital-letters-and-full-stops',title:'Capital Letters and Full Stops',category:'grammar',grade:'Grade 2',label:'Sentences',difficulty:'beginner',layout:'stack',cols:1,boxClass:'wide',
  seoTitle:'Capital Letters and Full Stops Worksheet | Free Printable',
  seoDescription:'Free capital letters and full stops worksheet for Grade 2. Rewrite 8 sentences correctly in the boxes. Worked example and answer key included. Printable A4 PDF.',
  summary:'8 sentences with missing capital letters and full stops. Students rewrite each sentence correctly in the box. Includes a worked example and a separate answer key. Free A4 PDF for Grade 2.',
  description:'Students practise starting sentences with a capital letter, capitalising names and days, and ending with a full stop. The worked example shows the corrected sentence.',
  tags:['capital letters','full stops','punctuation','sentences','grade 2'],instructions:'Rewrite each sentence with capital letters and a full stop.',
  example:`we like pizza → <span class="ex-box">We like pizza.</span>`,items:S.map(t=>({t,a:fix(t)})),qh:14});
}
{ // E3 plurals
 const P=[['cat','cats'],['dog','dogs'],['book','books'],['bus','buses'],['dish','dishes'],['fox','foxes'],['box','boxes'],['watch','watches'],['baby','babies'],['puppy','puppies'],['city','cities'],['fly','flies'],['child','children'],['mouse','mice'],['foot','feet'],['man','men'],['tooth','teeth'],['leaf','leaves'],['wolf','wolves'],['woman','women']];
 mk({slug:'singular-and-plural-nouns',title:'Singular and Plural Nouns',category:'grammar',grade:'Grade 2',label:'Plural nouns',difficulty:'intermediate',layout:'cells',cols:2,boxClass:'md',
  seoTitle:'Singular and Plural Nouns Worksheet | Free Printable PDF',
  seoDescription:'Free plural nouns worksheet for Grade 2. Write the plural of 20 words, including -es, -ies and irregular plurals. Worked example and answer key. A4 PDF.',
  summary:'20 singular nouns to change into plurals, including -s, -es, -ies and irregular plurals like mice and feet. Answer box for each, worked example and answer key. Free A4 PDF for Grade 2.',
  description:'Students write the plural of each noun. Includes regular endings and common irregular plurals, with a worked example showing one cat becomes two cats.',
  tags:['plural nouns','singular','irregular plurals','grammar','grade 2'],instructions:'Write the plural (more than one) in the box.',
  example:`one bus → many <span class="ex-box">buses</span>`,items:P.map(([s,p])=>({t:`one ${s} → many`,a:p}))});
}
{ // E4 opposites
 const O=[['hot','cold'],['up','down'],['big','small'],['fast','slow'],['happy','sad'],['day','night'],['open','closed'],['full','empty'],['old','new'],['hard','soft'],['wet','dry'],['light','dark'],['near','far'],['loud','quiet'],['clean','dirty'],['long','short'],['early','late'],['strong','weak'],['in','out'],['start','stop'],['young','old'],['thick','thin'],['top','bottom'],['yes','no']];
 mk({slug:'opposites-antonyms',title:'Opposites: Write the Antonym',category:'vocabulary',grade:'Grade 2',label:'Opposites',difficulty:'beginner',layout:'cells',cols:3,boxClass:'',
  seoTitle:'Opposites (Antonyms) Worksheet | Free Printable PDF',
  seoDescription:'Free opposites worksheet for Grade 2. Write the antonym for 24 common words in the boxes. Worked example and answer key included. Printable A4 PDF.',
  summary:'24 common words for students to match with their opposite. Each has an answer box, there is a worked example, and a separate answer key is included. Free A4 PDF for Grade 2.',
  description:'Students write the word that means the opposite. Builds vocabulary and word-pair thinking. Accept any correct opposite, such as small or little for big.',
  tags:['opposites','antonyms','vocabulary','grade 2'],instructions:'Write the opposite word in the box.',
  example:`hot → <span class="ex-box">cold</span>`,items:O.map(([a,b])=>({t:`${a} →`,a:b}))});
}
{ // E5 synonyms
 const Sy=[['big','large'],['small','tiny'],['happy','glad'],['fast','quick'],['begin','start'],['end','finish'],['tired','sleepy'],['angry','mad'],['smart','clever'],['pretty','beautiful'],['scared','afraid'],['shout','yell'],['jump','leap'],['cold','chilly'],['silent','quiet'],['unhappy','sad']];
 mk({slug:'synonyms-words-with-similar-meanings',title:'Synonyms: Words with Similar Meanings',category:'vocabulary',grade:'Grade 3',label:'Synonyms',difficulty:'intermediate',layout:'bank',cols:2,
  seoTitle:'Synonyms Worksheet: Similar Meaning Words | Free Printable',
  seoDescription:'Free synonyms worksheet for Grade 3. Use the word bank to write a word with a similar meaning for 16 words. Worked example and answer key. Printable A4 PDF.',
  summary:'16 words to match with a synonym from the word bank. Answer box for each, a worked example and a separate answer key. Free A4 PDF for Grade 3.',
  description:'Students choose a word from the bank that means almost the same as the word given and write it in the box. Builds vocabulary and writing variety.',
  tags:['synonyms','vocabulary','word bank','grade 3'],instructions:'Choose a word from the bank that means the same. Write it in the box.',
  bank:shuffle(Sy.map(s=>s[1]),205),example:`big → <span class="ex-box">large</span>`,items:Sy.map(([a,b])=>({t:`${a} →`,a:b}))});
}
{ // E6 alphabetical
 const G=[['dog','cat','bird'],['pear','apple','mango'],['sun','moon','star'],['pen','book','desk'],['milk','juice','water'],['rain','snow','wind'],['train','car','bike'],['fish','frog','fox']];
 const items=G.map(g=>({t:g.join('  ·  '),a:[...g].sort().join(', '),three:true}));
 mk({slug:'alphabetical-order-abc',title:'Put the Words in ABC Order',category:'spelling',grade:'Grade 2',label:'ABC order',difficulty:'beginner',layout:'abc',
  seoTitle:'Alphabetical Order Worksheet: ABC Order | Free Printable',
  seoDescription:'Free alphabetical order worksheet for Grade 2. Put 8 sets of three words in ABC order using the answer boxes. Worked example and answer key. A4 printable PDF.',
  summary:'8 sets of three words to write in alphabetical order, one word per box. Includes a worked example and a separate answer key. Free A4 PDF for Grade 2.',
  description:'Students look at the first letter of each word and write the words in ABC order. The worked example shows cat, dog, fish in order.',
  tags:['alphabetical order','abc order','spelling','grade 2'],instructions:'Write the three words in ABC order. One word in each box.',
  example:`fish · cat · dog → <span class="ex-box">cat</span> <span class="ex-box">dog</span> <span class="ex-box">fish</span>`,items,keyText:i=>`${i.t.replace(/<[^>]+>/g,'')} → <b>${esc(i.a)}</b>`,keyCols:2});
}
{ // E7 comprehension 1
 mk({slug:'reading-comprehension-the-little-garden',title:'Reading Comprehension: The Little Garden',category:'reading',grade:'Grade 2',label:'Reading comprehension',difficulty:'beginner',layout:'passage',
  seoTitle:'Reading Comprehension Grade 2: The Little Garden | Free PDF',
  seoDescription:'Free Grade 2 reading comprehension worksheet with a short story and 5 questions. Clear answer boxes, a worked example and an answer key. Printable A4 PDF.',
  summary:'An original short story, "The Little Garden", with 5 comprehension questions and a box for each answer. Includes a worked example and a separate answer key. Free A4 PDF for Grade 2.',
  description:'A short original passage about growing a garden, followed by five questions on who, what, where and why. The worked example shows how to answer in a full sentence.',
  tags:['reading comprehension','short story','grade 2','reading'],instructions:'Read the story. Then answer the questions in the boxes.',
  passageTitle:'The Little Garden',passage:['Mina and her grandfather made a small garden behind their house. On Saturday they planted seeds in the soft, dark soil. They planted carrots, peas and bright yellow sunflowers.','Every morning Mina gave the seeds water. After two weeks, tiny green leaves came up. One day a bee landed on a sunflower. Mina smiled. "Our garden is alive!" she said.'],
  example:`Who helped Mina? → <span class="ex-box">Her grandfather helped her.</span>`,
  items:[{t:'Where did Mina and her grandfather make the garden?',a:'Behind their house.'},{t:'Name two things they planted.',a:'Any two of: carrots, peas, sunflowers.'},{t:'What did Mina do every morning?',a:'She gave the seeds water.'},{t:'What landed on a sunflower?',a:'A bee.'},{t:'How do you think Mina felt at the end? Why?',a:'Happy or proud, because her garden was growing.'}],qh:15});
}
{ // E8 comprehension 2
 mk({slug:'reading-comprehension-a-trip-to-the-library',title:'Reading Comprehension: A Trip to the Library',category:'reading',grade:'Grade 3',label:'Reading comprehension',difficulty:'intermediate',layout:'passage',
  seoTitle:'Reading Comprehension Grade 3: A Trip to the Library | Free PDF',
  seoDescription:'Free Grade 3 reading comprehension worksheet with a short passage and 6 questions. Clear answer boxes, worked example and answer key. Printable A4 PDF.',
  summary:'An original passage, "A Trip to the Library", with 6 comprehension questions and an answer box for each. Includes a worked example and a separate answer key. Free A4 PDF for Grade 3.',
  description:'Students read a short original passage and answer questions that check facts, vocabulary and thinking. The worked example models a complete-sentence answer.',
  tags:['reading comprehension','passage','grade 3','reading'],instructions:'Read the passage. Answer each question in the box.',
  passageTitle:'A Trip to the Library',passage:['On Friday, Mr. Lopez took his class to the town library. The librarian, Ms. Reed, showed the children where the picture books, science books and storybooks were kept.','Each child chose one book to borrow. Omar picked a book about space. Priya chose a story about a brave fox. Ms. Reed stamped a due date inside every book. "Please bring them back in two weeks," she said.'],
  example:`Who is the librarian? → <span class="ex-box">Ms. Reed is the librarian.</span>`,
  items:[{t:'On which day did the class visit the library?',a:'Friday.'},{t:'Name two kinds of books in the library.',a:'Any two of: picture books, science books, storybooks.'},{t:'What did Omar choose?',a:'A book about space.'},{t:'What did Ms. Reed stamp in every book?',a:'A due date.'},{t:'How long can the children keep the books?',a:'Two weeks.'},{t:'Why do you think the librarian stamps a due date?',a:'So children remember when to return the book.'}],qh:12});
}
{ // E9 past tense
 const V=[['walk','walked'],['play','played'],['jump','jumped'],['cook','cooked'],['wash','washed'],['carry','carried'],['study','studied'],['stop','stopped'],['plan','planned'],['run','ran'],['eat','ate'],['go','went'],['see','saw'],['take','took'],['make','made'],['write','wrote']];
 mk({slug:'past-tense-verbs',title:'Past Tense Verbs: Yesterday I…',category:'grammar',grade:'Grade 3',label:'Past tense',difficulty:'intermediate',layout:'cells',cols:2,boxClass:'md',
  seoTitle:'Past Tense Verbs Worksheet (Regular and Irregular) | Free PDF',
  seoDescription:'Free past tense verbs worksheet for Grade 3. Write the past tense of 16 regular and irregular verbs in the boxes. Worked example and answer key. A4 PDF.',
  summary:'16 verbs to change from present to past tense, including regular verbs (walked) and irregular verbs (went, ate). Answer box for each, worked example and answer key. Free A4 PDF for Grade 3.',
  description:'Students write the past tense of each verb in the box after "Yesterday I". Includes -ed, doubled letters, -ied and common irregular verbs.',
  tags:['past tense','verbs','irregular verbs','grammar','grade 3'],instructions:'Write the past tense of the verb in the box.',
  example:`Today I walk. Yesterday I <span class="ex-box">walked</span>.`,items:V.map(([p,q])=>({t:`Today I ${p}. Yesterday I`,a:q}))});
}
{ // E10 unscramble
 const S=[['we went to the park','park the to went we'],['the dog likes to run','run likes the to dog'],['my mother makes good soup','good soup makes my mother'],['birds sing in the morning','in birds morning the sing'],['i read a book today','book a read i today'],['the sun is very hot','hot is the very sun'],['our class has a pet fish','a fish has class pet our'],['they play games after school','after games they school play']];
 mk({slug:'unscramble-the-sentence',title:'Unscramble the Sentence',category:'writing',grade:'Grade 2',label:'Sentence building',difficulty:'beginner',layout:'stack',cols:1,boxClass:'wide',
  seoTitle:'Unscramble the Sentence Worksheet | Free Printable, Grade 2',
  seoDescription:'Free unscramble the sentence worksheet for Grade 2. Put the jumbled words in order and write the sentence in the box. 8 sentences, example and answer key.',
  summary:'8 jumbled sentences. Students put the words in the correct order and write the full sentence in the box with a capital letter and full stop. Includes a worked example and answer key. Free A4 PDF for Grade 2.',
  description:'A sentence-building activity that builds word order, capital letters and punctuation. The worked example shows how to read the jumbled words and write a correct sentence.',
  tags:['sentence building','word order','writing','grade 2'],instructions:'Put the words in order. Write the sentence in the box. Start with a capital letter and end with a full stop.',
  example:`pizza like I → <span class="ex-box">I like pizza.</span>`,
  items:S.map(([a,t])=>({t,a:a[0].toUpperCase().replace('I','I')+a.slice(1).replace(/\bi\b/g,'I')+'.'})).map(i=>({...i,a:i.a.replace(/^i /,'I ')})),qh:14});
}
{ // E11 compound words
 const C=[['sun','flower'],['rain','bow'],['foot','ball'],['tooth','brush'],['butter','fly'],['cup','cake'],['star','fish'],['snow','man'],['bed','room'],['air','plane'],['door','bell'],['sand','box'],['moon','light'],['pop','corn'],['hair','brush'],['bath','tub'],['sail','boat'],['news','paper'],['back','pack'],['sea','shell']];
 mk({slug:'compound-words',title:'Compound Words: Join Two Words',category:'vocabulary',grade:'Grade 3',label:'Compound words',difficulty:'intermediate',layout:'cells',cols:2,boxClass:'md',
  seoTitle:'Compound Words Worksheet: Join Two Words | Free Printable',
  seoDescription:'Free compound words worksheet for Grade 3. Join two words to make a new word, 20 questions with answer boxes, a worked example and an answer key. A4 PDF.',
  summary:'20 pairs of small words to join into compound words such as sunflower and rainbow. Answer box for each, worked example and a separate answer key. Free A4 PDF for Grade 3.',
  description:'Students join two words to make one new word and write it in the box. A fun spelling and vocabulary activity with a worked example at the top.',
  tags:['compound words','vocabulary','spelling','grade 3'],instructions:'Join the two words to make one new word. Write it in the box.',
  example:`sun + flower = <span class="ex-box">sunflower</span>`,items:C.map(([a,b])=>({t:`${a} + ${b} =`,a:a+b}))});
}

/* ---------- COLORING ---------- */
const S3='stroke="#222" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"';
const scene={
fish:`<g ${S3}><path d="M120 420 C230 250 470 250 560 420 C470 590 230 590 120 420Z"/><path d="M560 420 L670 330 L670 510Z"/><circle cx="215" cy="395" r="16"/><path d="M300 330 C320 300 380 300 400 330"/><path d="M300 510 C320 540 380 540 400 510"/><path d="M270 440 C290 470 320 470 340 440"/><path d="M360 300 C380 380 380 460 360 540"/><path d="M430 320 C450 390 450 450 430 520"/><path d="M500 340 C515 390 515 450 500 500"/>
<path d="M80 860 C60 780 110 760 80 690 C50 620 100 600 80 540"/><path d="M150 860 C130 800 180 790 150 730 C130 690 160 670 150 640"/><path d="M620 860 C600 790 650 770 620 700 C590 640 640 620 620 570"/>
<circle cx="140" cy="250" r="22"/><circle cx="190" cy="190" r="14"/><circle cx="230" cy="130" r="9"/><path d="M440 650 C500 600 600 620 640 680 C600 740 500 740 440 650Z"/><path d="M640 680 L690 640 L690 720Z"/><circle cx="480" cy="665" r="9"/><path d="M0 120 q58 -40 116 0 t116 0 t116 0 t116 0 t116 0 t116 0"/><path d="M0 60 q58 -40 116 0 t116 0 t116 0 t116 0 t116 0 t116 0"/></g>`,
house:`<g ${S3}><rect x="170" y="430" width="360" height="300"/><path d="M130 440 L350 250 L570 440Z"/><rect x="420" y="290" width="50" height="95"/><rect x="305" y="560" width="90" height="170"/><circle cx="378" cy="650" r="6"/><rect x="215" y="480" width="80" height="80"/><path d="M255 480 V560 M215 520 H295"/><rect x="405" y="480" width="80" height="80"/><path d="M445 480 V560 M405 520 H485"/><path d="M305 730 L270 860 H430 L395 730"/>
<circle cx="610" cy="130" r="55"/><path d="M610 40 v-25 M610 220 v25 M520 130 h-25 M700 130 h25 M545 65 l-18 -18 M675 195 l18 18 M675 65 l18 -18 M545 195 l-18 18"/><path d="M80 190 q-45 0 -45 -35 q0 -35 45 -30 q10 -45 65 -35 q45 -15 70 25 q50 5 45 45 q-5 30 -45 30Z"/>
<rect x="75" y="640" width="30" height="120"/><circle cx="90" cy="600" r="60"/><path d="M0 760 H140 M30 760 V860 M80 760 V860 M130 760 V860 M560 760 H700 M590 760 V860 M640 760 V860 M690 760 V860"/></g>`,
butterfly:`<g ${S3}><path d="M350 330 C250 150 80 190 100 340 C115 430 250 470 350 430Z"/><path d="M350 430 C250 470 140 600 200 690 C260 760 340 640 350 550Z"/><path d="M350 330 C450 150 620 190 600 340 C585 430 450 470 350 430Z"/><path d="M350 430 C450 470 560 600 500 690 C440 760 360 640 350 550Z"/><ellipse cx="350" cy="440" rx="22" ry="150"/><circle cx="350" cy="270" r="30"/><path d="M335 245 C315 190 290 170 270 165 M365 245 C385 190 410 170 430 165"/>
<circle cx="205" cy="330" r="42"/><circle cx="495" cy="330" r="42"/><circle cx="215" cy="640" r="26"/><circle cx="485" cy="640" r="26"/><circle cx="170" cy="400" r="14"/><circle cx="530" cy="400" r="14"/>
<path d="M90 860 V760"/><circle cx="90" cy="730" r="26"/><circle cx="90" cy="730" r="9"/><path d="M610 860 V770"/><circle cx="610" cy="740" r="26"/><circle cx="610" cy="740" r="9"/><circle cx="640" cy="90" r="50"/><path d="M640 20 v-18 M640 160 v18 M570 90 h-18 M710 90 h18"/></g>`,
rainbow:`<g ${S3}><path d="M60 700 A290 290 0 0 1 640 700"/><path d="M130 700 A220 220 0 0 1 570 700"/><path d="M200 700 A150 150 0 0 1 500 700"/><path d="M270 700 A80 80 0 0 1 430 700"/><path d="M60 700 H130 M130 700 H200 M200 700 H270 M430 700 H500 M500 700 H570 M570 700 H640"/>
<path d="M80 760 q-45 0 -45 -35 q0 -35 45 -30 q10 -45 65 -35 q45 -15 70 25 q50 5 45 45 q-5 30 -45 30Z"/><path d="M470 780 q-45 0 -45 -35 q0 -35 45 -30 q10 -45 65 -35 q45 -15 70 25 q50 5 45 45 q-5 30 -45 30Z"/>
<circle cx="110" cy="130" r="55"/><path d="M110 40 v-22 M110 220 v22 M20 130 h-20 M200 130 h22 M45 65 l-16 -16 M175 195 l16 16 M175 65 l16 -16 M45 195 l-16 16"/><path d="M0 860 C120 790 260 790 360 860"/><path d="M340 860 C460 800 600 800 700 860"/>
<path d="M520 160 q-45 0 -45 -35 q0 -35 45 -30 q10 -45 65 -35 q45 -15 70 25 q50 5 45 45 q-5 30 -45 30Z"/></g>`,
robot:`<g ${S3}><rect x="230" y="150" width="240" height="190" rx="30"/><circle cx="305" cy="235" r="30"/><circle cx="395" cy="235" r="30"/><circle cx="305" cy="235" r="9"/><circle cx="395" cy="235" r="9"/><path d="M300 300 H400"/><path d="M350 150 V90"/><circle cx="350" cy="75" r="18"/><rect x="190" y="360" width="320" height="260" rx="25"/><circle cx="270" cy="430" r="20"/><circle cx="350" cy="430" r="20"/><circle cx="430" cy="430" r="20"/><rect x="260" y="490" width="180" height="80" rx="12"/><path d="M290 530 H410"/>
<path d="M190 400 H110 V520 H150 V470"/><path d="M510 400 H590 V520 H550 V470"/><rect x="250" y="620" width="70" height="140"/><rect x="380" y="620" width="70" height="140"/><path d="M230 760 H320 V810 H220Z M380 760 H470 V810 H480Z"/><path d="M215 260 H230 M470 260 H485"/><circle cx="110" cy="130" r="14"/><circle cx="600" cy="170" r="10"/><path d="M95 800 l20 -35 l20 35 l-40 -22 h40Z"/></g>`,
flowers:`<g ${S3}><path d="M200 860 V470"/><circle cx="200" cy="400" r="45"/><circle cx="200" cy="320" r="45"/><circle cx="200" cy="480" r="0"/><circle cx="140" cy="360" r="45"/><circle cx="260" cy="360" r="45"/><circle cx="200" cy="360" r="28"/><path d="M200 700 C150 690 120 660 110 620 C170 620 200 650 200 700Z"/>
<path d="M500 860 V520"/><path d="M500 440 L520 380 L560 410 L590 365 L610 430 L660 440 L620 480 L640 530 L580 510 L540 540 L520 490Z"/><circle cx="500" cy="470" r="30"/><path d="M500 740 C550 730 580 700 590 660 C530 660 500 690 500 740Z"/>
<path d="M350 860 V640"/><circle cx="350" cy="600" r="38"/><circle cx="305" cy="650" r="0"/><circle cx="350" cy="600" r="14"/><path d="M312 600 C290 560 330 540 350 562 M388 600 C410 560 370 540 350 562 M350 562 V540"/>
<ellipse cx="560" cy="200" rx="45" ry="30"/><path d="M515 200 H605 M530 180 V220 M560 172 V228 M590 180 V220"/><ellipse cx="545" cy="150" rx="22" ry="30"/><ellipse cx="585" cy="150" rx="22" ry="30"/><path d="M555 230 L548 252"/><circle cx="120" cy="150" r="48"/><path d="M120 70 v-20 M120 230 v20 M40 150 h-20 M200 150 h20"/><path d="M0 860 H700"/><path d="M40 860 q10 -50 22 0 M90 860 q10 -60 22 0 M420 860 q10 -50 22 0 M610 860 q10 -60 22 0"/></g>`
};
const colorW=(slug,title,key,seoTitle,seoDesc,summary,desc,tags,grade='Grade 1')=>mk({slug,title,category:'colors',grade,label:'Coloring page',difficulty:'beginner',layout:'color',svg:key,
 seoTitle,seoDescription:seoDesc,summary,description:desc,tags,instructions:'Color the picture. Use as many colors as you like!',items:[],noKey:true});
colorW('ocean-fish-coloring-page','Ocean Fish Coloring Page','fish','Ocean Fish Coloring Page | Free Printable Sea Animals','Free printable ocean fish coloring page for kids. Big, clear outlines of a fish, small fish, seaweed and bubbles that are easy to color. Printable A4 PDF.','A big ocean coloring page with a large fish, a small fish, seaweed, bubbles and waves. Thick outlines make it easy for young children to color. Free A4 PDF.','A clean full-page coloring picture of an underwater scene. Great for fine motor practice, creativity and a quiet activity at home or in class.',['coloring page','ocean','fish','kindergarten']);
colorW('happy-house-coloring-page','Happy House Coloring Page','house','Happy House Coloring Page | Free Printable for Kids','Free printable house coloring page for kids with a house, sun, cloud, tree and fence. Thick, clear outlines for easy coloring. A4 PDF for kindergarten.','A friendly coloring page of a house with a chimney, windows, a door, a tree, a fence, a sun and a cloud. Clear thick outlines. Free A4 PDF.','Children color the house and garden scene. Talk about shapes (square, triangle, rectangle, circle) as you color. Good for early learners.',['coloring page','house','shapes','kindergarten']);
colorW('butterfly-garden-coloring-page','Butterfly Garden Coloring Page','butterfly','Butterfly Garden Coloring Page | Free Printable PDF','Free printable butterfly coloring page with a big symmetrical butterfly, flowers and a sun. Easy outlines for kids to color. A4 PDF, kindergarten and Grade 1.','A big butterfly with large wing sections, two flowers and a sun. Clear thick outlines for easy coloring. Free A4 PDF.','A symmetrical butterfly is a great way to talk about patterns and colors. Children can color both wings the same or invent their own pattern.',['coloring page','butterfly','symmetry','kindergarten']);
colorW('rainbow-sky-coloring-page','Rainbow Sky Coloring Page','rainbow','Rainbow Sky Coloring Page | Free Printable for Kids','Free printable rainbow coloring page with four rainbow bands, clouds, a sun and hills. Easy to color, A4 PDF for kindergarten and Grade 1.','A rainbow with four bands, a smiling sun, clouds and hills. Easy large spaces for crayons and markers. Free A4 PDF.','Children color the rainbow and sky. A good way to practise color names and the order of colors in a rainbow.',['coloring page','rainbow','colors','kindergarten']);
colorW('friendly-robot-coloring-page','Friendly Robot Coloring Page','robot','Friendly Robot Coloring Page | Free Printable for Kids','Free printable robot coloring page with a big friendly robot made of simple shapes. Clear thick outlines for easy coloring. A4 PDF for kids.','A friendly robot built from rectangles, circles and squares. Large spaces to color and plenty of detail for older children to add their own. Free A4 PDF.','Ask children to name the shapes they see in the robot while they color. Great for shape recognition and creativity.',['coloring page','robot','shapes','kids']);
colorW('flower-garden-coloring-page','Flower Garden Coloring Page','flowers','Flower Garden Coloring Page | Free Printable for Kids','Free printable flower garden coloring page with different flowers, a bee, a sun and grass. Clear outlines for easy coloring. A4 PDF for Grade 1.','A flower garden with four different flowers, a bee, a sun and grass. Clear outlines and big spaces to color. Free A4 PDF.','Children color each flower a different way. A calm creative activity that builds fine motor control.',['coloring page','flowers','garden','kindergarten']);
{ // color words shapes
 const C=[['RED','circle'],['BLUE','square'],['GREEN','triangle'],['YELLOW','star'],['ORANGE','heart'],['PURPLE','diamond'],['PINK','circle'],['BROWN','square']];
 mk({slug:'color-the-shapes-by-color-word',title:'Color the Shapes: Read the Color Word',category:'colors',grade:'Grade 1',label:'Color words',difficulty:'beginner',layout:'colorwords',items:C.map(([w,s])=>({t:w,a:s})),noKey:true,
  seoTitle:'Color Words Worksheet: Read and Color the Shapes | Free PDF',
  seoDescription:'Free color words worksheet for Grade 1. Read each color word and color the shape. 8 big shapes with color names, one worked example. Printable A4 PDF.',
  summary:'8 big shapes, each with a color word to read. Students color each shape to match the word. Includes a worked example. Free A4 PDF for Grade 1.',
  description:'Students read the color word printed on each shape and color it with the matching crayon or marker. Builds reading of color words and fine motor skills.',
  tags:['color words','reading','shapes','grade 1'],instructions:'Read the color word. Color the shape with that color.'});
}
function shapeSvg(s){const st='stroke="#222" stroke-width="5" fill="#fff" stroke-linejoin="round"';
 const m={circle:`<circle cx="100" cy="100" r="78" ${st}/>`,square:`<rect x="26" y="26" width="148" height="148" rx="8" ${st}/>`,triangle:`<path d="M100 22 L180 172 H20Z" ${st}/>`,star:`<path d="M100 18 L124 76 L186 80 L138 120 L154 182 L100 148 L46 182 L62 120 L14 80 L76 76Z" ${st}/>`,heart:`<path d="M100 175 C20 120 14 60 60 45 C85 38 100 58 100 70 C100 58 115 38 140 45 C186 60 180 120 100 175Z" ${st}/>`,diamond:`<path d="M100 14 L176 100 L100 186 L24 100Z" ${st}/>`};
 return `<svg viewBox="0 0 200 200" width="100%" height="100%">${m[s]}</svg>`;}

/* ---------- build ---------- */
function buildStudent(w){
 const L=w.layout;
 if(L==='cells')return cellsPage(w,{cols:w.cols,boxClass:w.boxClass||''});
 if(L==='free'){ // question text already contains boxes
  const cells=w.items.map(i=>`<div class="cell"><span class="t">${i.t}</span></div>`).join('');const rows=Math.ceil(w.items.length/w.cols);
  return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}<div class="grid" style="grid-template-columns:repeat(${w.cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells}</div>`,w);}
 if(L==='stack')return stackPage(w,{cols:w.cols,boxClass:w.boxClass});
 if(L==='passage')return passagePage(w);
 if(L==='bank')return bankPage(w,{cols:w.cols});
 if(L==='words'){
  const cells=w.items.map(i=>`<div class="stack"><span style="font-size:15pt">${i.t}</span><span class="box wide" style="height:14mm"></span></div>`).join('');
  return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr)">${cells}</div>`,w);}
 if(L==='frac'){
  const cells=w.items.map(i=>`<div class="cell" style="justify-content:space-around">${i.t}<span class="frac"><span class="box"></span><i></i><span class="box"></span></span></div>`).join('');
  return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}<div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr)">${cells}</div>`,w);}
 if(L==='clock'){
  const cells=w.items.map(i=>`<div class="cell" style="flex-direction:column;justify-content:center;gap:2mm;border-bottom:none">${i.t}<span class="box" style="width:28mm"></span></div>`).join('');
  return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}<div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr)">${cells}</div>`,w);}
 if(L==='abc'){
  const cells=w.items.map(i=>`<div class="stack" style="flex-direction:row;align-items:center;gap:4mm"><span style="width:62mm;font-size:15pt">${i.t}</span><span class="box" style="width:36mm"></span><span class="box" style="width:36mm"></span><span class="box" style="width:36mm"></span></div>`).join('');
  return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(w.example)}<div class="grid" style="grid-template-columns:1fr;grid-template-rows:repeat(8,1fr)">${cells}</div>`,w);}
 if(L==='color')return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p><div class="cp"><svg viewBox="0 0 700 900" preserveAspectRatio="xMidYMid meet">${scene[w.svg]}</svg></div>`,w);
 if(L==='colorwords'){
  const cells=w.items.map(i=>`<div class="cell" style="flex-direction:column;justify-content:center;border-bottom:none;gap:2mm"><div style="width:42mm;height:42mm">${shapeSvg(i.a)}</div><b style="font-size:20pt;letter-spacing:.06em">${i.t}</b></div>`).join('');
  return page(`<h1>${esc(w.title)}</h1><p class="instr">${esc(w.instructions)}</p>${exampleHtml(`<span style="display:inline-block;width:20mm;height:20mm">${shapeSvg('circle').replace('fill="#fff"','fill="#e53935"')}</span> <b>RED</b> → the circle is colored red.`)}<div class="grid" style="grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr)">${cells}</div>`,w);}
 throw new Error('layout '+L);
}
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const ctx=await browser.newContext();
const manifest=[];
for(const w of W){
 const pg=await ctx.newPage();
 await pg.setContent(doc(buildStudent(w)),{waitUntil:'load'});
 const files=[w.slug+'.pdf'];
 await pg.pdf({path:path.join(OUT,w.slug+'.pdf'),format:'A4',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
 const n=await pg.evaluate(()=>document.querySelectorAll('.page').length);
 const overflow=await pg.evaluate(()=>[...document.querySelectorAll('.page')].some(p=>p.scrollHeight>p.clientHeight+2));
 if(n!==1||overflow)console.warn('CHECK',w.slug,'pages',n,'overflow',overflow);
 if(process.env.PREVIEW){await pg.setViewportSize({width:794,height:1123});await pg.screenshot({path:path.join(process.env.PREVIEW,w.slug+'.png')});}
 if(!w.noKey){
  const pk=await ctx.newPage();await pk.setContent(doc(keyPage(w)),{waitUntil:'load'});
  await pk.pdf({path:path.join(OUT,w.slug+'-answers.pdf'),format:'A4',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});await pk.close();files.push(w.slug+'-answers.pdf');
 }
 await pg.close();
 manifest.push({slug:w.slug,title:w.title,category:w.category,grade:w.grade,difficulty:w.difficulty,seoTitle:w.seoTitle,seoDescription:w.seoDescription,summary:w.summary,description:w.description,tags:w.tags,student:files[0],answers:files[1]||null});
}
await browser.close();
fs.writeFileSync(path.resolve('src/lib/seed-pack.json'),JSON.stringify(manifest,null,1));
for(const m of manifest){const ok=m.seoTitle.length<=70&&m.seoDescription.length<=180&&m.summary.length<=700&&m.summary.length>=25;if(!ok)console.warn('META LENGTH',m.slug,m.seoTitle.length,m.seoDescription.length);}
console.log('generated',manifest.length,'worksheets');
