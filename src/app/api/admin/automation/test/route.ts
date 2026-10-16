import {requireOwner} from '@/lib/admin-server';
import {runDailyAiDrafts} from '@/lib/daily-ai-draft-agent';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

/** Owner-triggered smoke test: only one slot per request to avoid a 5-model
 * request exceeding the Vercel function timeout. Never publish or enable cron.
 */
export async function POST(request:Request){
 const owner=await requireOwner(request);
 if(!owner.ok)return Response.json({error:'Owner sign-in required'},{status:owner.status});
 let slot:unknown;
 try{
  const payload:unknown=await request.json();
  slot=payload&&typeof payload==='object'&&!Array.isArray(payload)&&'slot' in payload
    ?(payload as {slot:unknown}).slot:null;
 }catch{return Response.json({error:'Invalid request'},{status:400});}
 if(typeof slot!=='number'||!Number.isInteger(slot)||slot<1||slot>5)
  return Response.json({error:'Test slot must be 1–5'},{status:400});

 // Consistent with the existing daily agent's Taiwan-local schedule.
 const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 try{
  const result=await runDailyAiDrafts(day,[slot-1]);
  return Response.json({day,slot,generated:result,privateDrafts:true,autoScheduleUnchanged:true},
   {headers:{'Cache-Control':'private, no-store'}});
 }catch(error){
  console.error('Owner AI draft test error',error instanceof Error?error.message:'unknown');
  return Response.json({error:'Agent test could not run. Check Supabase, R2 and AI provider configuration.'},
   {status:503,headers:{'Cache-Control':'private, no-store'}});
 }
}
