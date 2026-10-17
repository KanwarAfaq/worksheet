import 'server-only';
import {jsPDF} from 'jspdf';

/** Print-first original illustrations: no third-party copyrighted graphics.
 * Layouts are drawn with PDF vector primitives, never AI-written prose blocks.
 */
export type VisualSubject='math'|'reading'|'colors';
export type VisualTheme='orchard'|'garden'|'ocean'|'animals'|'spring'|'space'|'robot'|'rocket';
export type VisualPlan={subject:VisualSubject;grade:number;slot:number;day:string;theme:VisualTheme;words?:string[]};
export type VisualResult={
 title:string;summary:string;instructions:string;student:Buffer;teacher:Buffer;exerciseCount:number;layout:string
};
const INK='#22382F',SOFT='#F1F8F0',MINT='#BCE0CB',ORANGE='#C85E42',YELLOW='#F3CA72',
  BLUE='#8DB8CB',GRAY='#B9C8BE',WHITE='#FFFFFF',GREEN='#5D9B6F';
function stroke(p:jsPDF,color=INK,width=0.55){p.setDrawColor(color);p.setLineWidth(width);}
function fill(p:jsPDF,color:string){p.setFillColor(color);}
function text(p:jsPDF,value:string,x:number,y:number,size=11,color=INK,bold=false,opts?:{align?:'center'|'right'|'left'}){
 p.setTextColor(color);p.setFont('helvetica',bold?'bold':'normal');p.setFontSize(size);
 p.text(value,x,y,opts);
}
function box(p:jsPDF,x:number,y:number,w:number,h:number,bg=WHITE,r=3,outline=GRAY){
 stroke(p,outline,0.4);fill(p,bg);p.roundedRect(x,y,w,h,r,r,'FD');
}
function line(p:jsPDF,x:number,y:number,x2:number,y2:number,color=INK,width=0.45){
 stroke(p,color,width);p.line(x,y,x2,y2);
}
function circle(p:jsPDF,x:number,y:number,r:number,bg=WHITE,outline=INK,width=0.55){
 stroke(p,outline,width);fill(p,bg);p.circle(x,y,r,'FD');
}
function ellipse(p:jsPDF,x:number,y:number,rx:number,ry:number,bg=WHITE,outline=INK,width=0.5){
 stroke(p,outline,width);fill(p,bg);p.ellipse(x,y,rx,ry,'FD');
}
function poly(p:jsPDF,pts:Array<[number,number]>,bg=WHITE,outline=INK,width=0.5){
 stroke(p,outline,width);fill(p,bg);
 for(let i=1;i<pts.length-1;i++){const [ax,ay]=pts[0],[bx,by]=pts[i],[cx,cy]=pts[i+1];
  p.triangle(ax,ay,bx,by,cx,cy,'FD');}
}
function base(p:jsPDF,title:string,description:string,grade:number,accent=ORANGE){
 fill(p,WHITE);p.rect(0,0,210,297,'F');
 fill(p,accent);p.roundedRect(12,11,5,30,2,2,'F');
 text(p,'NAME',21,19,8.5,INK,true);line(p,33,19,117,19,GRAY);
 text(p,'CLASS',124,19,8.5,INK,true);line(p,138,19,195,19,GRAY);
 text(p,title.toUpperCase(),21,35,23,INK,true);
 box(p,169,25,27,11,SOFT,5,MINT);text(p,'GRADE '+grade,182.5,31.9,8,INK,true,{align:'center'});
 text(p,description,21,45,10,INK);
 line(p,16,51,194,51,GRAY,0.35);
 line(p,16,286,194,286,GRAY,0.3);
 text(p,'WORKSHEET STUDIO',17,291,7.3,'#6B8B7C',true);
}
function numberBadge(p:jsPDF,n:number,x:number,y:number){
 circle(p,x,y,5,ORANGE,ORANGE,0.2);text(p,String(n),x,y+1.5,11,WHITE,true,{align:'center'});
}
function apple(p:jsPDF,x:number,y:number,s=1){
 // Each drawing is a custom vector illustration, not an imported image.
 const k=(n:number)=>n*s;
 ellipse(p,x-k(2.5),y+k(1),k(4.4),k(4.5),'#E58A55','#B95439',0.35);
 ellipse(p,x+k(2.5),y+k(1),k(4.4),k(4.5),'#E58A55','#B95439',0.35);
 line(p,x,y-k(2.2),x+k(1),y-k(6),INK,0.7*s);
 ellipse(p,x+k(3.4),y-k(4.4),k(3),k(1.7),GREEN,GREEN,0.2);
}
function flower(p:jsPDF,x:number,y:number,s=1){
 for(let a=0;a<6;a++){const t=a*Math.PI/3;
  ellipse(p,x+Math.cos(t)*4*s,y+Math.sin(t)*4*s,2.8*s,3.1*s,YELLOW,'#B58035',0.25);}
 circle(p,x,y,2.6*s,ORANGE,ORANGE,0.2);
}
function star(p:jsPDF,x:number,y:number,r=5,bg=YELLOW){
 const pts:Array<[number,number]>=[];
 for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2;const d=i%2===0?r:r*.46;pts.push([x+Math.cos(a)*d,y+Math.sin(a)*d]);}
 // Draw polygon outline without intersecting internal spokes.
 stroke(p,INK,.45);fill(p,bg);
 for(let i=0;i<pts.length;i++){
  const a=pts[i],b=pts[(i+1)%pts.length];
  p.triangle(x,y,a[0],a[1],b[0],b[1],'F');
 }
 for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];line(p,a[0],a[1],b[0],b[1],INK,.45);}
}
function pear(p:jsPDF,x:number,y:number,s=1){
 ellipse(p,x,y+1*s,5.1*s,5.9*s,'#B7D876','#769A49',.35);
 ellipse(p,x,y-3*s,2.9*s,3.1*s,'#B7D876','#769A49',.2);
 line(p,x,y-5*s,x+1*s,y-8*s,INK,.45*s);
}
function art(p:jsPDF,kind:string,x:number,y:number,s=1){
 if(kind==='apple'||kind==='orchard')return apple(p,x,y,s);
 if(kind==='flower'||kind==='garden'||kind==='spring')return flower(p,x,y,s);
 if(kind==='pear')return pear(p,x,y,s);
 if(kind==='star'||kind==='space')return star(p,x,y,5*s);
 if(kind==='fish'||kind==='ocean'){
  ellipse(p,x,y,5*s,3.4*s,BLUE,INK,.4);
  poly(p,[[x-4.5*s,y],[x-9*s,y-3.5*s],[x-9*s,y+3.5*s]],BLUE,INK,.35);
  circle(p,x+2.6*s,y-.5*s,.52*s,INK,INK,.1);return;
 }
 return flower(p,x,y,s);
}
function critter(p:jsPDF,kind:string,x:number,y:number){
 const g=(n:number)=>n;
 if(kind==='cat'){
  ellipse(p,x,y+6,9,8,'#D5D6D3',INK,.7);
  poly(p,[[x-7,y+1],[x-7,y-12],[x-1,y-5]],'#D5D6D3',INK,.7);
  poly(p,[[x+7,y+1],[x+7,y-12],[x+1,y-5]],'#D5D6D3',INK,.7);
  circle(p,x-3,y+4,.8,INK);circle(p,x+3,y+4,.8,INK);circle(p,x,y+8,1,ORANGE);return;
 }
 if(kind==='frog'){
  ellipse(p,x,y+7,12,9,'#A7C983',INK,.7);
  circle(p,x-7,y-2,4,'#A7C983');circle(p,x+7,y-2,4,'#A7C983');
  circle(p,x-7,y-3,1,INK);circle(p,x+7,y-3,1,INK);
  line(p,x-4,y+11,x+4,y+11);return;
 }
 if(kind==='bird'){
  ellipse(p,x,y+5,12,8,BLUE,INK,.7);
  poly(p,[[x+9,y+3],[x+17,y+6],[x+9,y+8]],YELLOW,INK,.5);
  ellipse(p,x-2,y+8,6,4,'#D0E2EA',INK,.3);
  circle(p,x+6,y+2,.9,INK);return;
 }
 if(kind==='bee'){
  ellipse(p,x,y+6,12,7,YELLOW,INK,.8);
  ellipse(p,x-3,y-2,5,5,WHITE,INK,.4);
  ellipse(p,x+4,y-2,5,5,WHITE,INK,.4);
  for(let i=-1;i<=1;i++)line(p,x+i*5,y+1,x+i*5,y+12,INK,.75);
  circle(p,x+10,y+5,.7,INK);return;
 }
 if(kind==='fish')return art(p,'fish',x,y+4,1.8);
 if(kind==='sun'){
  circle(p,x,y+5,10,YELLOW,INK,.7);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;line(p,x+Math.cos(a)*12,y+5+Math.sin(a)*12,x+Math.cos(a)*16,y+5+Math.sin(a)*16,ORANGE,1);}
  return;
 }
 if(kind==='flower')return flower(p,x,y+4,2.5);
 if(kind==='star')return star(p,x,y+4,15,YELLOW);
 if(kind==='tree'){
  fill(p,'#A88961');stroke(p,INK,.6);p.rect(x-3,y+4,6,18,'FD');
  for(const [dx,dy,r] of [[-7,1,8],[6,0,9],[0,-7,11]] as const)circle(p,x+dx,y+dy,r,MINT,INK,.5);
  return;
 }
 if(kind==='rabbit'){
  ellipse(p,x,y+7,9,9,WHITE,INK,.75);
  ellipse(p,x-5,y-8,3,11,WHITE,INK,.7);
  ellipse(p,x+5,y-8,3,11,WHITE,INK,.7);
  circle(p,x-3,y+5,1,INK);circle(p,x+3,y+5,1,INK);return;
 }
 if(kind==='moon'){
  circle(p,x,y+3,12,YELLOW,INK,.7);circle(p,x+5,y-2,9,WHITE,WHITE,.1);return;
 }
 if(kind==='rocket'){
  box(p,x-6,y-4,12,24,WHITE,3,INK);
  poly(p,[[x-6,y-4],[x,y-14],[x+6,y-4]],WHITE,INK,.6);
  poly(p,[[x-6,y+12],[x-12,y+20],[x-6,y+20]],WHITE,INK,.5);
  poly(p,[[x+6,y+12],[x+12,y+20],[x+6,y+20]],WHITE,INK,.5);
  circle(p,x,y+3,3,WHITE,INK,.4);return;
 }
 // Deterministic fallback still draws a meaningful object, never a blank card.
 return star(p,x,y+2,12);
}
function answerCircle(p:jsPDF,x:number,y:number){circle(p,x,y,8,WHITE,INK,.8);}

function makeMathCounting(p:jsPDF,plan:VisualPlan):{answers:string[];count:number}{
 base(p,'COUNT & ADD','Count the pictures. Write the answer in each circle.',plan.grade);
 const seed=Number(plan.day.replace(/-/g,''))+plan.slot*3;
 const objects=(plan.theme==='ocean'?['fish','star','fish','star','fish']:
  plan.theme==='garden'?['flower','apple','flower','pear','flower']:['apple','pear','apple','flower','pear']);
 const answers:string[]=[];
 for(let i=0;i<5;i++){
  const y=66+i*42.5;
  numberBadge(p,i+1,20,y+12);
  box(p,30,y,64,32,WHITE,5,GRAY);box(p,112,y,55,32,WHITE,5,GRAY);
  const left=2+((seed+i*3)%4),right=1+((seed+i*2+1)%4);
  const kind=objects[i];
  for(let j=0;j<left;j++)art(p,kind,41+j%3*18,y+9+Math.floor(j/3)*12,.8);
  for(let j=0;j<right;j++)art(p,kind,124+j%3*15,y+9+Math.floor(j/3)*12,.8);
  text(p,'+',103,y+20,22,INK,true,{align:'center'});
  text(p,'=',176,y+20,18,INK,true,{align:'center'});
  answerCircle(p,190,y+16);
  answers.push(left+' + '+right+' = '+(left+right));
 }
 box(p,36,282,138,0.1,WHITE,.01,WHITE);
 return{answers,count:5};
}
function makeMathPuzzles(p:jsPDF,plan:VisualPlan):{answers:string[];count:number}{
 base(p,'NUMBER CHALLENGE','Solve each number puzzle. Fill the circles.',plan.grade,ORANGE);
 const seed=Number(plan.day.slice(-2))+plan.slot*11;
 const answers:string[]=[];
 for(let i=0;i<8;i++){
  const x=17+(i%2)*91,y=63+Math.floor(i/2)*52;
  box(p,x,y,85,46,i%4===0?'#F3F8F0':WHITE,5,GRAY);
  numberBadge(p,i+1,x+9,y+10);
  let a=0,b=0,sign='+',value=0;
  const mode=i%4;
  if(mode===0){a=120+(seed*19+i*41)%380;b=110+(i*37+seed)%290;value=a+b;}
  if(mode===1){a=520+(seed*13+i*21)%350;b=140+(i*31+seed)%260;sign='-';value=a-b;}
  if(mode===2){a=12+(seed+i*7)%28;b=3+(i+seed)%7;sign='x';value=a*b;}
  if(mode===3){b=3+(i+seed)%8;value=6+(seed*3+i)%13;a=b*value;sign='÷';}
  text(p,String(a)+' '+sign+' '+String(b)+' =',x+9,y+25,18,INK,true);
  answerCircle(p,x+71,y+23);
  answers.push(a+' '+sign+' '+b+' = '+value);
  // Child-friendly visual accent, separate from the math itself.
  if(i%2===0)star(p,x+73,y+39,3.2,plan.theme==='space'?BLUE:YELLOW);
  else circle(p,x+71,y+39,2.7,MINT,INK,.2);
 }
 return{answers,count:8};
}
function makeMatching(p:jsPDF,plan:VisualPlan):{answers:string[];count:number}{
 base(p,'PICTURE WORD MATCH','Look at the pictures. Write each word in a box.',plan.grade,GREEN);
 const pool=plan.theme==='spring'?['bee','bird','flower','rabbit','frog','sun']:
  plan.theme==='ocean'?['fish','bird','sun','star','cat','frog']:
  ['cat','frog','bird','fish','bee','rabbit'];
 const chosen=(plan.words||[]).filter(w=>pool.includes(w));
 const words=[...new Set([...chosen,...pool])].slice(0,6);
 const wordBank=[words[3],words[0],words[5],words[1],words[4],words[2]];
 for(let i=0;i<6;i++){
  const x=20+(i%3)*57.5,y=62+Math.floor(i/3)*16;
  box(p,x,y,54,12,SOFT,3,MINT);text(p,wordBank[i],x+27,y+7.9,14,INK,true,{align:'center'});
 }
 for(let i=0;i<6;i++){
  const x=19+(i%3)*59,y=102+Math.floor(i/3)*88;
  box(p,x,y,55,80,WHITE,5,GRAY);
  critter(p,words[i],x+27.5,y+28);
  box(p,x+6,y+58,43,15,WHITE,1,INK);
  text(p,String(i+1),x+6,y+8,9,ORANGE,true);
 }
 return{answers:words.map((w,i)=>(i+1)+'. '+w),count:6};
}
function robot(p:jsPDF,cx:number,top:number){
 // A printable black/white shape robot with no raster images.
 stroke(p,INK,.8);fill(p,WHITE);
 box(p,cx-29,top+38,58,52,WHITE,2,INK);
 box(p,cx-28,top,56,37,WHITE,2,INK);
 circle(p,cx-16,top+18,8,WHITE,INK,.8);
 circle(p,cx+16,top+18,8,WHITE,INK,.8);
 circle(p,cx-16,top+18,3,WHITE,INK,.8);
 circle(p,cx+16,top+18,3,WHITE,INK,.8);
 box(p,cx-11,top+29,22,4,WHITE,0,INK);
 line(p,cx,top,cx,top-13,INK,.8);circle(p,cx,top-16,4,WHITE,INK,.8);
 // Ears are circles; hands are simple rectangles and triangles.
 circle(p,cx-37,top+18,7,WHITE,INK,.8);
 circle(p,cx+37,top+18,7,WHITE,INK,.8);
 line(p,cx-29,top+48,cx-54,top+59,INK,4);
 line(p,cx+29,top+48,cx+54,top+59,INK,4);
 circle(p,cx-57,top+61,6,WHITE,INK,.8);circle(p,cx+57,top+61,6,WHITE,INK,.8);
 box(p,cx-23,top+90,15,35,WHITE,2,INK);
 box(p,cx+8,top+90,15,35,WHITE,2,INK);
 box(p,cx-27,top+121,23,8,WHITE,2,INK);
 box(p,cx+4,top+121,23,8,WHITE,2,INK);
 // Extra circles/triangles make the shape-coloring activity concrete.
 for(let i=0;i<3;i++)circle(p,cx-16+i*16,top+59,5,WHITE,INK,.65);
 box(p,cx-22,top+72,13,13,WHITE,0,INK);
 poly(p,[[cx+5,top+85],[cx+23,top+85],[cx+14,top+72]],WHITE,INK,.65);
}
function rocket(p:jsPDF,cx:number,top:number){
 stroke(p,INK,.85);
 box(p,cx-20,top+27,40,88,WHITE,13,INK);
 poly(p,[[cx-20,top+29],[cx,top],[cx+20,top+29]],WHITE,INK,.85);
 circle(p,cx,top+53,12,WHITE,INK,.85);
 box(p,cx-6,top+81,12,12,WHITE,0,INK);
 box(p,cx-45,top+74,25,41,WHITE,3,INK);
 box(p,cx+20,top+74,25,41,WHITE,3,INK);
 poly(p,[[cx-20,top+114],[cx-11,top+140],[cx,top+114]],WHITE,INK,.85);
 poly(p,[[cx,top+114],[cx+11,top+140],[cx+20,top+114]],WHITE,INK,.85);
 star(p,cx-47,top+25,8,WHITE);star(p,cx+51,top+50,7,WHITE);
}
function makeColoring(p:jsPDF,plan:VisualPlan):{answers:string[];count:number}{
 const what=plan.theme==='rocket'?'ROCKET':'ROBOT';
 base(p,'COLOR THE '+what,'Color each shape using the color key.',plan.grade,GREEN);
 const key=[
  {x:24,name:'BLUE',shape:'circle'},
  {x:70,name:'GREEN',shape:'rectangle'},
  {x:116,name:'RED',shape:'triangle'},
  {x:163,name:'YELLOW',shape:'square'}
 ];
 for(const item of key){
  const x=item.x;
  if(item.shape==='circle')circle(p,x,71,8,WHITE,INK,.7);
  else if(item.shape==='rectangle')box(p,x-12,64,24,15,WHITE,1,INK);
  else if(item.shape==='triangle')poly(p,[[x,63],[x+11,78],[x-11,78]],WHITE,INK,.7);
  else box(p,x-8,63,16,16,WHITE,1,INK);
  text(p,item.name,x,90,10.3,INK,true,{align:'center'});
 }
 line(p,18,98,192,98,GRAY,.35);
 if(what==='ROBOT')robot(p,105,115);
 else rocket(p,105,112);
 box(p,17,257,176,22,SOFT,4,MINT);
 text(p,'COUNT THE SHAPES',25,265,11,INK,true);
 text(p,'Circles:',25,274,10,INK);line(p,46,274,64,274,INK,.6);
 text(p,'Squares:',72,274,10,INK);line(p,96,274,113,274,INK,.6);
 text(p,'Triangles:',122,274,10,INK);line(p,150,274,179,274,INK,.6);
 return{answers:['Color key: blue circles, green rectangles, red triangles, yellow squares',
  what==='ROBOT'?'Robot: 12 circles, 1 square, 1 triangle':'Rocket: 1 circle, 1 square, 3 triangles'],count:4};
}
type Found={word:string;row:number;col:number;dir:'H'|'V'};
function puzzleWords(plan:VisualPlan):string[]{
 const pool=plan.theme==='space'?
  ['PLANET','ROCKET','COMET','GALAXY','ORBIT','STARS','MOON','EARTH','SOLAR','SPACE']:
  plan.theme==='spring'?
  ['FLOWER','GARDEN','SUNNY','NATURE','RABBIT','GREEN','BLOOM','RAIN','PLANT','BIRDS']:
  ['FOREST','ANIMAL','RIVER','FLOWER','NATURE','BIRDS','PLANET','GARDEN','SPRING','TREES'];
 const accepted=(plan.words||[]).map(x=>x.toUpperCase()).filter(w=>pool.includes(w));
 return [...new Set([...accepted,...pool])].slice(0,8);
}
function makeSearch(plan:VisualPlan):{grid:string[][];found:Found[];words:string[]}{
 const words=puzzleWords(plan);
 const grid=Array.from({length:11},()=>Array.from({length:11},()=>''));const found:Found[]=[];
 const seed=Number(plan.day.replace(/-/g,''))+plan.slot*271;
 for(let wi=0;wi<words.length;wi++){
  const word=words[wi];let placed=false;
  for(let attempt=0;attempt<260&&!placed;attempt++){
   const vertical=(attempt+wi)%2===1;
   const row=(seed+wi*17+attempt*7)%11;
   const col=(seed*3+wi*11+attempt*5)%11;
   if(row+(vertical?word.length-1:0)>10||col+(vertical?0:word.length-1)>10)continue;
   let fit=true;
   for(let n=0;n<word.length;n++){const existing=grid[row+(vertical?n:0)][col+(vertical?0:n)];
    if(existing&&existing!==word[n]){fit=false;break;}}
   if(!fit)continue;
   for(let n=0;n<word.length;n++)grid[row+(vertical?n:0)][col+(vertical?0:n)]=word[n];
   found.push({word,row:row+1,col:col+1,dir:vertical?'V':'H'});placed=true;
  }
  if(!placed)throw new Error('Could not place every word in the grid');
 }
 for(let r=0;r<11;r++)for(let c=0;c<11;c++)
  if(!grid[r][c])grid[r][c]=String.fromCharCode(65+(seed+r*13+c*17+r*c*3)%26);
 return{grid,found,words};
}
function makeWordSearch(p:jsPDF,plan:VisualPlan):{answers:string[];count:number}{
 const theme=plan.theme==='space'?'SPACE':plan.theme==='spring'?'SPRING':'NATURE';
 base(p,theme+' WORD SEARCH','Find and circle the hidden words.',plan.grade,BLUE);
 const {grid,found,words}=makeSearch(plan);
 const x0=34,y0=60,step=12.9;
 for(let r=0;r<11;r++)for(let c=0;c<11;c++){
  const x=x0+c*step,y=y0+r*step;
  stroke(p,'#A3B7B3',.4);fill(p,WHITE);
  p.rect(x,y,step,step,'FD');
  text(p,grid[r][c],x+step/2,y+8.8,12,INK,false,{align:'center'});
 }
 box(p,21,214,168,59,SOFT,5,MINT);
 text(p,'WORD BANK',29,226,12,INK,true);
 for(let i=0;i<words.length;i++){
  const x=29+(i%4)*40,y=240+Math.floor(i/4)*18;
  circle(p,x,y-2.6,2.7,WHITE,GRAY,.3);
  text(p,words[i].toLowerCase(),x+5,y,10,INK,true);
 }
 return{answers:found.map(f=>f.word+' — row '+f.row+', column '+f.col+', '+(f.dir==='H'?'across':'down')),count:words.length};
}
function teacherSheet(title:string,answers:string[],grade:number):Buffer{
 const p=new jsPDF({unit:'mm',format:'a4'});
 base(p,'TEACHER ANSWER KEY','Private answer key: not part of the student download.',grade,BLUE);
 text(p,title,20,63,14,INK,true);
 for(let i=0;i<answers.length;i++){
  const y=78+i*20;
  if(y>275)break;
  box(p,20,y-8,172,16,i%2===0?SOFT:WHITE,3,GRAY);
  text(p,(i+1)+'.  '+answers[i].slice(0,90),27,y+2,11,INK,false);
 }
 return Buffer.from(p.output('arraybuffer'));
}
export function renderVisualWorksheet(plan:VisualPlan):VisualResult{
 if(plan.grade<1||plan.grade>6||plan.slot<0||plan.slot>4)throw new Error('Invalid visual worksheet plan');
 const pdf=new jsPDF({format:'a4',unit:'mm'});
 let rendered:{answers:string[];count:number};
 let title:string,layout:string,instructions:string;
 if(plan.subject==='math'&&plan.grade<=2){
  title='Count & Add';layout='picture-counting';instructions='Count the pictures and solve five addition puzzles.';
  rendered=makeMathCounting(pdf,plan);
 }else if(plan.subject==='math'){
  title='Number Challenge';layout='math-card-puzzles';instructions='Solve eight large-format number puzzles.';
  rendered=makeMathPuzzles(pdf,plan);
 }else if(plan.subject==='reading'&&plan.grade<=3){
  title='Picture Word Match';layout='word-picture-matching';instructions='Match six pictures with words from a word bank.';
  rendered=makeMatching(pdf,plan);
 }else if(plan.subject==='reading'){
  title=(plan.theme==='space'?'Space':plan.theme==='spring'?'Spring':'Nature')+' Word Search';
  layout='word-search';instructions='Find eight hidden words in a letter grid.';
  rendered=makeWordSearch(pdf,plan);
 }else{
  title='Color the '+(plan.theme==='rocket'?'Rocket':'Robot');layout='geometric-coloring';
  instructions='Color the illustrated shapes according to the key and count them.';
  rendered=makeColoring(pdf,plan);
 }
 if(pdf.getNumberOfPages()!==1)throw new Error('Visual worksheet must fit one A4 page');
 const bytes=Buffer.from(pdf.output('arraybuffer'));
 if(bytes.length<2000||rendered.count<4||!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))
  throw new Error('Invalid student PDF layout');
 const summary='Original illustrated Grade '+plan.grade+' '+title.toLowerCase()+' worksheet with '+rendered.count+' activities, designed for print and educator review.';
 return{title: title+' — Grade '+plan.grade,summary,instructions,
  student:bytes,teacher:teacherSheet(title+' — Grade '+plan.grade,rendered.answers,plan.grade),
  exerciseCount:rendered.count,layout};
}
