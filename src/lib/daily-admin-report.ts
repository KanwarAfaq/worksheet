import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL} from '@/lib/supabase-public';
export async function dailyAdminReport(day:string,generated:{created:number;skipped:number;failed:number}){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)throw new Error('Missing database credentials');
 const db=createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const start=day+'T00:00:00+08:00';
 const endDate=new Date(Date.parse(start)+86400000).toISOString();
 const startUtc=new Date(start).toISOString();
 const counts=await Promise.all([
  db.from('user_profiles').select('*',{count:'exact',head:true}),
  db.from('worksheets').select('*',{count:'exact',head:true}),
  db.from('worksheets').select('*',{count:'exact',head:true}).eq('status','published'),
  db.from('worksheets').select('*',{count:'exact',head:true}).eq('status','draft'),
  db.from('worksheet_files').select('*',{count:'exact',head:true}).eq('role','student').eq('variant','pdf').eq('upload_status','verified'),
  db.from('worksheet_files').select('*',{count:'exact',head:true}).eq('role','student').in('variant',['png','jpg','webp']).eq('upload_status','verified'),
  db.from('user_profiles').select('*',{count:'exact',head:true}).gte('created_at',startUtc).lt('created_at',endDate),
 ]);
 const keys=['Users','Worksheets','Published','Drafts awaiting review','PDF files','Image files','New users today'];
 return keys.map((k,i)=>k+': '+(counts[i].error?'unavailable':counts[i].count??0)).join('\n')+
 '\nAI drafts today: '+generated.created+' | Existing: '+generated.skipped+' | Errors: '+generated.failed;
}
export async function pushDailyAdminReport(day:string,summary:string){
 const token=process.env.LINE_CHANNEL_ACCESS_TOKEN,recipient=process.env.LINE_ADMIN_USER_ID;
 if(!token||!recipient)return false;
 const response=await fetch('https://api.line.me/v2/bot/message/push',{
  method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
  body:JSON.stringify({to:recipient,messages:[{type:'text',text:'📚 Worksheet Studio · '+day+'\n'+summary+'\nReview: https://worksheet.live/admin'}]}),
  signal:AbortSignal.timeout(7000),cache:'no-store'
 });
 return response.ok;
}
