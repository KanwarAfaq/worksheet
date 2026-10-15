import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
type ModelInfo={id:string};
async function probe(url:string,key:string,model:string):Promise<'model available'|'model not listed'|'provider unreachable'|'authorization error'>{
 if(!key)return 'authorization error';
 try{
  const response=await fetch(url,{headers:{Authorization:'Bearer '+key,Accept:'application/json'},signal:AbortSignal.timeout(5000),cache:'no-store'});
  if(response.status===401||response.status===403)return 'authorization error';
  if(!response.ok)return 'provider unreachable';
  const data=await response.json() as {data?:ModelInfo[]};
  if(!Array.isArray(data.data))return 'provider unreachable';
  return data.data.some(x=>x.id===model)?'model available':'model not listed';
 }catch{return 'provider unreachable';}
}
export async function GET(request:Request){
 const a=await requireContributor(request);
 if(!a.ok)return json({error:'Sign in to check the worksheet AI providers'},a.status);
 const providers=[
  {name:'CGU Local',key:process.env.CGU_API_KEY||'',model:process.env.CGU_LOCAL_MODEL||'gpt-oss:20b',modelsUrl:'https://air.cgu.edu.tw/cgullmapi/v1/models'},
  {name:'CGU Compatible',key:process.env.CGU_API_KEY||'',model:process.env.CGU_COMPAT_MODEL||'gpt-oss-120b',modelsUrl:'https://air.cgu.edu.tw/cgullmapi/v1/models'},
  {name:'Groq',key:process.env.GROQ_API_KEY||'',model:process.env.GROQ_MODEL||'llama-3.3-70b-versatile',modelsUrl:'https://api.groq.com/openai/v1/models'},
  {name:'NVIDIA NIM',key:process.env.NVIDIA_NIM_API_KEY||'',model:process.env.NVIDIA_NIM_MODEL||'meta/llama-3.3-70b-instruct',modelsUrl:'https://integrate.api.nvidia.com/v1/models'}
 ];
 const checks=await Promise.all(providers.map(async x=>({
  name:x.name,configured:!!x.key,model:x.model,
  status:x.key?await probe(x.modelsUrl,x.key,x.model):'key missing'
 })));
 return json({providers:checks,note:'This verifies /models access and model listing only; full generation failover still requires actual calls.'});
}
