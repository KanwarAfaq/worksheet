import {requireContributor,json} from '@/lib/community-server';
import {generateAIWorksheet} from '@/lib/ai-worksheet';
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
 const {error}=await a.db.rpc('reserve_worksheet_ai_generation');
 if(error)return json({error:'Daily AI worksheet limit reached (5 per day), or quota could not be checked.'},429);
 try{
  const result=await generateAIWorksheet(topic,subject,grade,level);
  await notifyWorksheetAdmin('ai_worksheet_generated',{worksheetId:'AI draft',actorId:a.user.id});
  return json({worksheet:result});
 }catch(e){
  console.error('Worksheet AI generation failed:',e instanceof Error?e.message:'unknown');
  return json({error:'All available AI providers are unavailable or not configured. Please try again later.'},503);
 }
}
