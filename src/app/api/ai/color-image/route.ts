import {requireContributor,json} from '@/lib/community-server';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL} from '@/lib/supabase-public';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
async function refund(uid:string){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)return;
 try{
  const db=createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
  await db.rpc('refund_failed_worksheet_ai_generation',{p_user_id:uid});
 }catch{}
}
type ImageProvider={name:'CGU'|'Direct';endpoint:string;key:string;model:string};
function selectedProvider():ImageProvider|null{
 const cgu=process.env.CGU_API_KEY?.trim();
 if(cgu)return{
  name:'CGU',key:cgu,
  endpoint:'https://air.cgu.edu.tw/cgullmapi/v1/images/generations',
  model:process.env.CGU_IMAGE_MODEL||'chatgpt-image-latest'
 };
 const direct=process.env.AI_IMAGE_API_KEY?.trim();
 if(direct)return{
  name:'Direct',key:direct,
  endpoint:'https://api.openai.com/v1/images/generations',
  model:process.env.AI_IMAGE_MODEL||'gpt-image-2'
 };
 return null;
}
export async function GET(){
 const provider=selectedProvider();
 return json({available:!!provider,provider:provider?.name||null});
}
export async function POST(request:Request){
 const a=await requireContributor(request);
 if(!a.ok)return json({error:'Sign in to create AI drawings.'},a.status);
 const provider=selectedProvider();
 if(!provider)return json({error:'Set CGU_API_KEY on Vercel to enable image generation, or configure an alternative image API.'},503);
 let names:string[]=[];
 try{
  const body=await request.json() as {objects?:unknown};
  if(Array.isArray(body.objects))names=body.objects.filter((n):n is string=>typeof n==='string')
   .map(n=>n.toLowerCase().trim());
 }catch{}
 if(names.length<1||names.length>4||new Set(names).size!==names.length||
   names.some(s=>!/^([a-z][a-z0-9 -]{1,35})$/.test(s))){
  return json({error:'Choose 1 to 4 unique, simple object names.'},400);
 }
 const {error:quota}=await a.db.rpc('reserve_worksheet_ai_generation');
 if(quota)return json({error:'Five AI generations per day are allowed for each verified account.'},429);
 try{
  const prompt='Create an original, printable black-and-white coloring-book illustration for early elementary school children. '+
   'Depict exactly '+names.length+' clear separate subject'+(names.length===1?'':'s')+': '+names.join(', ')+'. '+
   'Put objects into '+(names.length>2?'a balanced 2 by 2 grid':'a spacious uncluttered row')+
   '. Use bold continuous black outlines, large enclosed white shapes, simple age-appropriate features. '+
   'Pure white background, no greyscale shading, no colored ink, no gradients, no words or numbers, no watermark, no tiny details. '+
   'Keep every object fully inside the image with generous white space. Do not depict logos or copyrighted characters.';
  const response=await fetch(provider.endpoint,{
   method:'POST',headers:{Authorization:'Bearer '+provider.key,'Content-Type':'application/json'},
   body:JSON.stringify({model:provider.model,prompt,n:1,size:'1024x1024',quality:'low',output_format:'png'}),
   signal:AbortSignal.timeout(50000),cache:'no-store',redirect:'error'
  });
  if(!response.ok){
    console.error('Color image provider HTTP',provider.name,response.status);
    await refund(a.user.id);
    const reason=response.status===401?'API key was rejected.':
       response.status===403?'Image model permission or CGU OpenAI USD quota may be exhausted.':
       response.status===404?'Selected image model is not available to this account.':'Image provider unavailable.';
    return json({error:reason+' Check CGU /v1/models and account usage; image generation uses the OpenAI cost quota.'},503);
  }
  const result=await response.json() as {data?:{b64_json?:string}[]};
  const b64=result.data?.[0]?.b64_json||'';
  if(b64.length<2000||b64.length>11000000||!/^[A-Za-z0-9+/=]+$/.test(b64)){
   await refund(a.user.id);
   return json({error:'The image provider did not return a valid printable image.'},502);
  }
  const decoded=Buffer.from(b64,'base64');
  if(decoded.length>8*1024*1024||!decoded.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
   await refund(a.user.id);return json({error:'Invalid image returned.'},502);
  }
  return json({image:'data:image/png;base64,'+b64,objects:names});
 }catch(e){
  console.error('Color image generation failed',e instanceof Error?e.name:'unknown');
  await refund(a.user.id);
  return json({error:'AI image service is unavailable. Built-in coloring drawings still work.'},503);
 }
}
