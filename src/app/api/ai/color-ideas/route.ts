import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=30;
type Model={url:string;key:string;model:string};
function availableModels():Model[]{
 const cgu=process.env.CGU_API_KEY||'';
 return [
  {url:'https://air.cgu.edu.tw/cgullmapi/v1/chat/completions',key:cgu,model:process.env.CGU_LOCAL_MODEL||'gpt-oss:20b'},
  {url:'https://air.cgu.edu.tw/cgullmapi/v1/chat/completions',key:cgu,model:process.env.CGU_COMPAT_MODEL||'gpt-oss-120b'},
  {url:'https://api.groq.com/openai/v1/chat/completions',key:process.env.GROQ_API_KEY||'',model:process.env.GROQ_MODEL||'llama-3.3-70b-versatile'},
  {url:'https://integrate.api.nvidia.com/v1/chat/completions',key:process.env.NVIDIA_NIM_API_KEY||'',model:process.env.NVIDIA_NIM_MODEL||'meta/llama-3.3-70b-instruct'}
 ].filter(p=>p.key);
}
function safeObjects(input:unknown):string[]{
 if(!Array.isArray(input))return[];
 return [...new Set(input.filter(x=>typeof x==='string')
  .map(x=>(x as string).toLowerCase().trim().replace(/^(a|an|the)\s+/,'').slice(0,36))
  .filter(x=>/^[a-z][a-z0-9 -]{1,35}$/.test(x)))].slice(0,8);
}
export async function POST(request:Request){
 const a=await requireContributor(request);
 if(!a.ok)return json({error:'Sign in to get AI object suggestions.'},a.status);
 const models=availableModels();
 if(!models.length)return json({error:'AI text models are not configured. You can still enter object names yourself.'},503);
 let prompt='';
 try{const data=await request.json();prompt=typeof data.prompt==='string'?data.prompt.trim():'';}catch{}
 if(prompt.length<2||prompt.length>200)return json({error:'Enter a short description.'},400);
 const {error:quota}=await a.db.rpc('reserve_coloring_ideas');
 if(quota)return json({error:'Daily object suggestion limit reached (20).'},429);
 const instruction='You extract concrete drawable objects from a parent or teacher request for a children\'s coloring page. Reply with JSON only: {"objects":["object name",...]}. Suggest 1-8 distinct nouns or simple noun phrases from the user\'s text; no people identities, brand mascots, copyrighted characters, weapons or adult themes; never add objects that the user did not ask for. If the user gives only a broad topic like space, suggest up to four ordinary related objects. Names must be simple lowercase English.';
 for(const model of models){
  try{
   const res=await fetch(model.url,{method:'POST',headers:{Authorization:'Bearer '+model.key,'Content-Type':'application/json'},
    body:JSON.stringify({model:model.model,messages:[{role:'system',content:instruction},{role:'user',content:prompt}],temperature:0.2,max_tokens:200,stream:false}),
    signal:AbortSignal.timeout(10000),cache:'no-store',redirect:'error'});
   if(!res.ok)continue;
   const response=await res.json() as {choices?:{message?:{content?:string}}[]};
   const raw=response.choices?.[0]?.message?.content||'';
   const first=raw.indexOf('{'),last=raw.lastIndexOf('}');
   if(first<0||last<=first)continue;
   const data=JSON.parse(raw.slice(first,last+1)) as {objects?:unknown};
   const objects=safeObjects(data.objects);
   if(objects.length)return json({objects});
  }catch{}
 }
 return json({error:'AI text models could not identify objects. Please type object names separated by commas.'},503);
}
