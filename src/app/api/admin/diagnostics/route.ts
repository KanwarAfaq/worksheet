import {randomUUID} from 'node:crypto';
import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {requireOwner} from '@/lib/admin-server';
import {r2Client,r2Bucket,r2Configured} from '@/lib/r2-server';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
const endpoints=[
 {name:'CGU Local',key:'CGU_API_KEY',model:'CGU_LOCAL_MODEL',defaultModel:'gpt-oss:20b',url:'https://air.cgu.edu.tw/cgullmapi/v1/chat/completions'},
 {name:'CGU Compatible',key:'CGU_API_KEY',model:'CGU_COMPAT_MODEL',defaultModel:'gpt-oss-120b',url:'https://air.cgu.edu.tw/cgullmapi/v1/chat/completions'},
 {name:'Groq',key:'GROQ_API_KEY',model:'GROQ_MODEL',defaultModel:'llama-3.3-70b-versatile',url:'https://api.groq.com/openai/v1/chat/completions'},
 {name:'NVIDIA NIM',key:'NVIDIA_NIM_API_KEY',model:'NVIDIA_NIM_MODEL',defaultModel:'meta/llama-3.3-70b-instruct',url:'https://integrate.api.nvidia.com/v1/chat/completions'}
];
export async function POST(request:Request){
 const access=await requireOwner(request);
 if(!access.ok)return Response.json({error:'Owner authentication required'},{status:access.status});
 const checks:Record<string,unknown>={};
 for(const p of endpoints){
  const key=process.env[p.key],model=process.env[p.model]||p.defaultModel;
  if(!key){checks[p.name]={ok:false,reason:'not configured'};continue;}
  try{
   const response=await fetch(p.url,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({model,messages:[{role:'user',content:'Reply with exactly OK'}],max_tokens:20,temperature:0,stream:false}),
    signal:AbortSignal.timeout(7000),cache:'no-store'});
   const data=response.ok?await response.json() as {choices?:{message?:{content?:string}}[]}:null;
   checks[p.name]={ok:response.ok&&!!data?.choices?.[0]?.message?.content,httpStatus:response.status};
  }catch{checks[p.name]={ok:false,reason:'timeout or connection failure'};}
 }
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
