import {requireOwner} from '@/lib/admin-server';
import {r2Configured} from '@/lib/r2-server';
import {notifyWorksheetAdmin} from '@/lib/line-admin';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:Request){
 const a=await requireOwner(request);
 if(!a.ok)return Response.json({error:'Owner access required'},{status:a.status});
 if(!r2Configured()||!process.env.SUPABASE_SERVICE_ROLE_KEY)
  return Response.json({error:'Private storage not configured'},{status:503});
 let ids:unknown,action:unknown;
 try{const payload=await request.json();ids=payload.ids;action=payload.action;}
 catch{return Response.json({error:'Invalid request'},{status:400});}
 if(action!=='publish'||!Array.isArray(ids)||ids.length<1||ids.length>20||
  new Set(ids).size!==ids.length||!ids.every(x=>typeof x==='string'&&uuid.test(x)))
  return Response.json({error:'Select 1–20 distinct valid worksheets for approval'},{status:400});
 const results:Array<{id:string;ok:boolean;error?:string}>=[];
 for(const id of ids as string[]){
  const {data:row,error:lookup}=await a.db.from('worksheets')
   .select('id,status,title,summary,worksheet_files(id,role,upload_status)')
   .eq('id',id).maybeSingle();
  const validStudent=(row?.worksheet_files||[]).some((file:{role:string;upload_status:string})=>
   file.role==='student'&&file.upload_status==='verified');
  if(lookup||!row||!['draft','review'].includes(row.status)||!validStudent){
   results.push({id,ok:false,error:'Not a reviewable draft with a verified student file'});continue;
  }
  const {error}=await a.db.rpc('publish_verified_worksheet',{p_worksheet_id:id});
  results.push({id,ok:!error,...(error?{error:'Publication validation failed (check metadata and permissions)'}:{})});
 }
 const count=results.filter(x=>x.ok).length;
 if(count)await notifyWorksheetAdmin('worksheet_published',{
  worksheetId:count+' worksheets (bulk)',actorId:a.user.id
 });
 return Response.json({published:count,results},{headers:{'Cache-Control':'private, no-store'}});
}
