import {runDailyAiDrafts} from '@/lib/daily-ai-draft-agent';
import {reviewCommunityQueue} from '@/lib/original-worksheet-agent';
import {dailyAdminReport,pushDailyAdminReport} from '@/lib/daily-admin-report';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(request:Request){
 const expected=process.env.CRON_SECRET;
 if(!expected||request.headers.get('authorization')!=='Bearer '+expected)
  return Response.json({error:'Unauthorized'},{status:401});
 // Vercel cron uses UTC; 01:00 UTC = 09:00 Asia/Taipei year round.
 const day=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 const param=new URL(request.url).searchParams.get('slot');
 const slot=param===null?null:Number(param);
 if(slot!==null&&(!Number.isInteger(slot)||slot<1||slot>5))
  return Response.json({error:'Invalid slot'},{status:400});
 if(process.env.AUTO_GENERATION_ENABLED!=='true')
  return Response.json({enabled:false,message:'AI draft generation is disabled. Enable only after database, LINE and R2 verification.'});
 try{
  const generated=await runDailyAiDrafts(day,slot===null?undefined:[slot-1]);
  // Only the final GitHub Actions slot checks the community queue and sends
  // a daily summary. This prevents five duplicate reports.
  const finalSlot=slot===null||slot===5;
  const reviews=finalSlot?await reviewCommunityQueue():null;
  const summary=finalSlot?await dailyAdminReport(day,generated):null;
  const lineSent=finalSlot&&summary?await pushDailyAdminReport(day,summary):false;
  // All generated records remain drafts: the agent never calls the publication RPC.
  return Response.json({enabled:true,day,slot,generated,reviews,lineSent,summary});
 }catch(e){
  console.error('Daily agent failure',e instanceof Error?e.message:'unknown');
  return Response.json({error:'Daily generation or reporting failed'},{status:500});
 }
}
