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
 if(process.env.AUTO_GENERATION_ENABLED!=='true')
  return Response.json({enabled:false,message:'AI draft generation is disabled. Enable only after database, LINE and R2 verification.'});
 try{
  const reviews=await reviewCommunityQueue();
  const generated=await runDailyAiDrafts(day);
  const summary=await dailyAdminReport(day,generated);
  const lineSent=await pushDailyAdminReport(day,summary);
  // All generated records remain drafts: the agent never calls the publication RPC.
  return Response.json({enabled:true,day,generated,reviews,lineSent,summary});
 }catch(e){
  console.error('Daily agent failure',e instanceof Error?e.message:'unknown');
  return Response.json({error:'Daily generation or reporting failed'},{status:500});
 }
}
