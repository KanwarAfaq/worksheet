import {requireOwner} from '@/lib/admin-server';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL} from '@/lib/supabase-public';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){
 const access=await requireOwner(request);
 if(!access.ok)return Response.json({error:'Access denied'},{status:access.status});
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)return Response.json({error:'Statistics service not configured'},{status:503});
 const db=createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const today=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
 const checks=await Promise.all([
  db.from('user_profiles').select('*',{head:true,count:'exact'}),
  db.from('worksheets').select('*',{head:true,count:'exact'}),
  db.from('worksheets').select('*',{head:true,count:'exact'}).eq('status','published'),
  db.from('worksheets').select('*',{head:true,count:'exact'}).eq('status','draft'),
  db.from('worksheets').select('*',{head:true,count:'exact'}).eq('slug','daily-ai-'+today+'-1'),
  db.from('worksheet_files').select('*',{head:true,count:'exact'}).eq('role','student').eq('variant','pdf').eq('upload_status','verified'),
  db.from('worksheet_files').select('*',{head:true,count:'exact'}).eq('role','student').in('variant',['png','jpg','webp']).eq('upload_status','verified')
 ]);
 const names=['users','worksheets','published','drafts','dailyAgentStarted','pdfFiles','imageFiles'];
 const stats:Record<string,number|null>={};
 for(let i=0;i<checks.length;i++)stats[names[i]]=checks[i].error?null:(checks[i].count??0);
 return Response.json({stats,date:today},{headers:{'Cache-Control':'private, no-store'}});
}
