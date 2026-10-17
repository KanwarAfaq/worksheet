import 'server-only';
import {textProviders,providerReply} from '@/lib/ai-provider-config';
import type {VisualPlan,VisualSubject,VisualTheme} from '@/lib/visual-worksheet-design';

const themeOptions:Record<VisualSubject,VisualTheme[]>={
 math:['orchard','garden','ocean','space'],
 reading:['animals','spring','ocean','space'],
 colors:['robot','rocket']
};
const wordOptions:Record<string,string[]>={
 animals:['cat','frog','bird','fish','bee','rabbit'],
 spring:['bee','bird','flower','rabbit','frog','sun'],
 ocean:['fish','bird','sun','star','cat','frog'],
 space:['PLANET','ROCKET','COMET','GALAXY','ORBIT','STARS','MOON','EARTH','SOLAR','SPACE'],
 nature:['FOREST','ANIMAL','RIVER','FLOWER','NATURE','BIRDS','PLANET','GARDEN','SPRING','TREES']
};
function safePlan(text:string,options:VisualTheme[],fallback:VisualTheme,allowed:string[]){
 try{
  const begin=text.indexOf('{'),end=text.lastIndexOf('}');
  if(begin<0||end<begin)return{theme:fallback,words:[] as string[]};
  const obj=JSON.parse(text.slice(begin,end+1)) as {theme?:unknown;words?:unknown};
  const requested=typeof obj.theme==='string'?obj.theme.trim().toLowerCase():'';
  const theme=(options.find(x=>x===requested)||fallback) as VisualTheme;
  const words=Array.isArray(obj.words)?obj.words
   .filter((w):w is string=>typeof w==='string')
   .map(w=>w.trim().toLowerCase())
   .filter(w=>allowed.some(item=>item.toLowerCase()===w)).slice(0,8):[];
  return{theme,words:[...new Set(words)]};
 }catch{return{theme:fallback,words:[] as string[]};}
}
/** Constrain creative AI decisions to pedagogy-safe visual content.
 * Calculations and grid placement are generated deterministically and validated.
 */
export async function generateVisualPlan(subject:VisualSubject,grade:number,slot:number,day:string):
 Promise<{plan:VisualPlan;provider:string}>{
 const choices=themeOptions[subject];
 const seed=Number(day.replace(/-/g,''))+grade*3+slot*11;
 const fallback=choices[seed%choices.length];
 const allowed=subject==='reading'?
  [...new Set([...wordOptions.animals,...wordOptions.spring,...wordOptions.ocean,
    ...wordOptions.space,...wordOptions.nature])]:[];
 const plan:VisualPlan={subject,grade,slot,day,theme:fallback};
 const models=textProviders().filter(m=>m.key);
 if(models.length===0)throw new Error('No AI provider configured');
 const system='You are planning an ORIGINAL illustrated printable worksheet for young students. '+
 'Return ONLY compact valid JSON, with a theme from the allowed list and an array of words '+
 'chosen ONLY from the permitted words when requested. No questions, paragraphs, markdown or extra prose.';
 const prompt='Grade '+grade+'; subject '+subject+'; choose theme from '+choices.join(', ')+'. '+
  (subject==='reading'?'Choose six distinct short words from '+allowed.join(', ')+'. ':'')+
  'Reply: {"theme":"...","words":["..."]}.';
 let last='AI provider unavailable';
 for(const model of models){
  try{
   const res=await fetch(model.url,{method:'POST',headers:{
    'Content-Type':'application/json',Authorization:'Bearer '+model.key
   },body:JSON.stringify({model:model.model,messages:[
    {role:'system',content:system},{role:'user',content:prompt}],
    max_completion_tokens:550,stream:false}),
    signal:AbortSignal.timeout(13000),cache:'no-store',redirect:'error'});
   if(!res.ok){last=model.name+' HTTP '+res.status;continue;}
   const result=await res.json();
   const raw=providerReply(result);
   if(!raw){last=model.name+' returned no text';continue;}
   const output=safePlan(raw,choices,fallback,allowed);
   // Do not trust arbitrary model words/themes; the parser enforces the approved list.
   return{plan:{...plan,...output},provider:model.name};
  }catch(e){last=model.name+' '+(e instanceof Error?e.name:'failure');}
 }
 throw new Error('Visual AI planner unavailable: '+last);
}
