import {requireContributor,json} from '@/lib/community-server';
import {textProviders} from '@/lib/ai-provider-config';
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
 const providers=textProviders().map(p=>({...p,configured:!!p.key}));
 const checks=await Promise.all(providers.map(async x=>({
  name:x.name,configured:x.configured,model:x.model,
  status:x.key?await probe(x.modelsUrl,x.key,x.model):'key missing'
 })));
 return json({providers:checks,note:'This verifies /models access and model listing only; full generation failover still requires actual calls.'});
}
