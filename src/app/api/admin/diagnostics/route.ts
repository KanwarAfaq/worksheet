import {randomUUID} from 'node:crypto';
import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {requireOwner} from '@/lib/admin-server';
import {r2Client,r2Bucket,r2Configured} from '@/lib/r2-server';
import {textProviders,providerReply,providerFinishReason,outputTokenCount} from '@/lib/ai-provider-config';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function POST(request:Request){
 const access=await requireOwner(request);
 if(!access.ok)return Response.json({error:'Owner authentication required'},{status:access.status});
 const checks:Record<string,unknown>={};
 const aiChecks=await Promise.all(textProviders().map(async p=>{
  if(!p.key)return {name:p.name,result:{ok:false,reason:'not configured'}};
  try{
   const body={
    model:p.model,
    messages:[{role:'user',content:'Reply with the single word OK.'}],
    ...(p.name.startsWith('CGU')?{max_completion_tokens:512}:{max_tokens:512}),
    stream:false
   };
   const response=await fetch(p.url,{method:'POST',
    headers:{Authorization:'Bearer '+p.key,'Content-Type':'application/json'},
    body:JSON.stringify(body),signal:AbortSignal.timeout(p.name==='CGU Local'?18000:15000),
    cache:'no-store',redirect:'error'});
   if(!response.ok){
    const reason=response.status===404?'Model missing or retired; verify the model ID under /models':
      response.status===410?'Model retired by provider; select a current hosted model':
      response.status===401||response.status===403?'API key or model permission/quota rejected':
      response.status===429?'Provider rate limit':'Provider returned HTTP '+response.status;
    return {name:p.name,result:{ok:false,httpStatus:response.status,model:p.model,reason}};
   }
   const payload:unknown=await response.json();
   const reply=providerReply(payload);
   const finish=providerFinishReason(payload);
   const tokens=outputTokenCount(payload);
   if(!reply)return {name:p.name,result:{
     ok:false,httpStatus:response.status,model:p.model,
     reason:'HTTP 200 but no visible text'+(finish?' (finish: '+finish+')':'')+
       (tokens!==null?', output tokens: '+tokens:'')+'; check model response or token budget'
   }};
   return {name:p.name,result:{ok:true,httpStatus:response.status,model:p.model}};
  }catch(e){
   return {name:p.name,result:{ok:false,model:p.model,
    reason:e instanceof Error&&e.name==='TimeoutError'?'Model did not respond within test timeout':
     'Connection or response parsing failure'}};
  }
 }));
 for(const item of aiChecks)checks[item.name]=item.result;
 const aiOnly=new URL(request.url).searchParams.get('scope')==='ai';
 if(aiOnly)return Response.json({checks,note:'Only AI endpoints checked. R2 and LINE were not retried.'},
  {headers:{'Cache-Control':'private, no-store'}});

 if(r2Configured()){
  const key='diagnostics/'+randomUUID()+'.txt',client=r2Client(),bucket=r2Bucket();
  try{
   await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:'worksheet-diagnostic',ContentType:'text/plain'}));
   const object=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
   const value=object.Body?Buffer.from(await object.Body.transformToByteArray()).toString('utf8'):'';
   checks.R2={ok:value==='worksheet-diagnostic'};
  }catch{checks.R2={ok:false,reason:'storage write/read failed'};}
  finally{try{await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}catch{checks.R2={ok:false,reason:'temporary object cleanup failed'};}}
 }else checks.R2={ok:false,reason:'not configured'};
 if(process.env.LINE_CHANNEL_ACCESS_TOKEN&&process.env.LINE_ADMIN_USER_ID){
  try{
   const response=await fetch('https://api.line.me/v2/bot/message/push',{method:'POST',
    headers:{Authorization:'Bearer '+process.env.LINE_CHANNEL_ACCESS_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({to:process.env.LINE_ADMIN_USER_ID,messages:[{type:'text',text:'Worksheet Studio: authorized production diagnostics test. No worksheet was published.'}]}),
    signal:AbortSignal.timeout(7000),cache:'no-store'});
   checks.LINE={ok:response.ok,httpStatus:response.status};
  }catch{checks.LINE={ok:false,reason:'timeout or connection failure'};}
 }else checks.LINE={ok:false,reason:'not configured'};
 return Response.json({checks,note:'Tests performed inside Vercel by authenticated owner. No worksheets generated or published.'},{headers:{'Cache-Control':'private, no-store'}});
}
