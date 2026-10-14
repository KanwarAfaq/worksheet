import {runOriginalAgent,reviewCommunityQueue} from '@/lib/original-worksheet-agent';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=60;
export async function GET(request:Request){
 const expected=process.env.CRON_SECRET;
 const actual=request.headers.get('authorization')||'';
 if(!expected||actual!=='Bearer '+expected)
  return Response.json({error:'Unauthorized'},{status:401});
 const day=new Date().toISOString().slice(0,10);
 try{
  // The review queue can be checked even while original auto-generation is disabled.
  const reviews=process.env.SUPABASE_SERVICE_ROLE_KEY?await reviewCommunityQueue():{checked:0,requiresHumanReview:0};
  if(process.env.AUTO_GENERATION_ENABLED!=='true')
   return Response.json({enabled:false,message:'Original worksheet generation is disabled until launch verification.',reviews});
  const generated=await runOriginalAgent(day);
  return Response.json({enabled:true,generated,reviews});
 }catch{
  return Response.json({error:'Automated validation failed; no unchecked community files were published.'},{status:500});
 }
}
