import type {ColoringObject} from '@/lib/coloring-worksheet';
export type WorksheetQuestion={question:string;answer:string};
export type AIWorksheet={title:string;instructions:string;subject:string;grade:number;questions:WorksheetQuestion[];provider:string;coloringObjects?:ColoringObject[]};
import {textProviders,providerReply} from '@/lib/ai-provider-config';
const clean=(value:unknown,max:number)=>typeof value==='string'?value.replace(/[\x00-\x1f]/g,' ').trim().slice(0,max):'';
export function parseWorksheet(raw:string,subject:string,grade:number,provider:string):AIWorksheet{
 const candidate=raw.replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
 const start=candidate.indexOf('{'),end=candidate.lastIndexOf('}');
 if(start<0||end<start)throw new Error('No structured worksheet');
 const data=JSON.parse(candidate.slice(start,end+1)) as Record<string,unknown>;
 if(!Array.isArray(data.questions))throw new Error('Missing questions');
 const questions=data.questions.slice(0,12).map(x=>{
  const item=x as Record<string,unknown>;
  return {question:clean(item.question,190),answer:clean(item.answer,130)};
 }).filter(x=>x.question.length>5&&x.answer.length>0);
 if(questions.length<5)throw new Error('Insufficient validated questions');
 return {title:clean(data.title,90)||subject+' practice',instructions:clean(data.instructions,240)||'Answer each question.',subject,grade,questions,provider};
}
export async function generateAIWorksheet(topic:string,subject:string,grade:number,level:string):Promise<AIWorksheet>{
 const available=textProviders().filter(x=>x.key);
 if(!available.length)throw new Error('No AI provider configured. Add a server-side API key.');
 const instruction='Create an original, age-appropriate printable educational worksheet for children. Return ONLY valid JSON: {"title":"...","instructions":"...","questions":[{"question":"...","answer":"..."}]}. Produce exactly 10 short, self-contained distinct questions with unambiguous answers. No markdown, links, personal information, copyrighted passages, or answer keys in the student questions. Avoid inappropriate or controversial content.';
 const prompt='Topic: '+topic+'; Subject: '+subject+'; Grade: '+grade+'; Difficulty: '+level+'. Clear English suitable for this grade.';
 let last='No provider succeeded';
 for(const config of available){
  try{
   const response=await fetch(config.url,{method:'POST',
    headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},
    body:JSON.stringify({model:config.model,messages:[{role:'system',content:instruction},{role:'user',content:prompt}],max_completion_tokens:2200,stream:false}),
    signal:AbortSignal.timeout(14000),cache:'no-store'});
   if(!response.ok){last=config.name+' HTTP '+response.status;continue;}
   const json=await response.json();
   const raw=providerReply(json);
   if(!raw){last=config.name+' produced empty output';continue;}
   return parseWorksheet(raw,subject,grade,config.name);
  }catch(e){last=config.name+': '+(e instanceof Error?e.message:'failed');}
 }
 throw new Error('All configured AI providers failed: '+last);
}

export function aiProviderConfigured():boolean{return Boolean(process.env.CGU_API_KEY||process.env.GROQ_API_KEY||process.env.NVIDIA_NIM_API_KEY);}
