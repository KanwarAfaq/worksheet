import {requireContributor,json} from '@/lib/community-server';
import {generateAIWorksheet,aiProviderConfigured} from '@/lib/ai-worksheet';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL} from '@/lib/supabase-public';
import {notifyWorksheetAdmin} from '@/lib/line-admin';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
const subjects=['math','reading','kindergarten','vocabulary','spelling','grammar','writing','colors'];
export async function POST(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in to use the AI worksheet maker'},a.status);
 let data:unknown;
 try{data=await request.json();}catch{return json({error:'Invalid input'},400);}
 const body=data as Record<string,unknown>;
 const topic=typeof body.topic==='string'?body.topic.trim():'';
 const subject=typeof body.subject==='string'?body.subject:'';
 const grade=Number(body.grade);
 const level=typeof body.level==='string'?body.level:'easy';
 if(topic.length<3||topic.length>120||!subjects.includes(subject)||!Number.isInteger(grade)||grade<1||grade>6||!['easy','medium','hard'].includes(level))
   return json({error:'Enter a valid topic, subject, grade and difficulty'},400);
 if(!aiProviderConfigured())return json({
  error:'AI provider keys are missing from Vercel. Configure CGU_API_KEY, GROQ_API_KEY or NVIDIA_NIM_API_KEY, then redeploy.'
 },503);
 const {error}=await a.db.rpc('reserve_worksheet_ai_generation');
 if(error)return json({error:'Daily AI worksheet limit reached (5 per day), or quota could not be checked.'},429);
 try{
  const result=await generateAIWorksheet(topic,subject,grade,level);
  await notifyWorksheetAdmin('ai_worksheet_generated',{worksheetId:'AI draft',actorId:a.user.id});
  return json({worksheet:result});
 }catch(e){
  console.error('Worksheet AI generation failed:',e instanceof Error?e.message:'unknown');
  // A failed provider attempt must not consume a daily AI generation slot.
  // The refund function is restricted to the server-only service role.
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(key){
    try{
     const service=createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
     const {error:refundError}=await service.rpc('refund_failed_worksheet_ai_generation',{p_user_id:a.user.id});
     if(refundError)console.error('AI quota refund failed:',refundError.code);
    }catch{console.error('AI quota refund unavailable');}
  }
  return json({
    error:'AI text providers could not generate this worksheet. Check server API keys, model access, or use the free worksheet templates while providers are unavailable.'
  },503);
 }
}
