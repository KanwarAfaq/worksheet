import {requireOwner} from '@/lib/admin-server';
import {deliverPrivateFile} from '@/lib/file-response';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const a=await requireOwner(request);
 if(!a.ok)return Response.json({error:'Owner only'},{status:a.status});
 const {id}=await params;
 if(!uuid.test(id))return new Response('Not found',{status:404});
 const {data:worksheet}=await a.db.from('worksheets').select('id')
  .eq('id',id).not('tags','cs','{removed-by-author}').maybeSingle();
 if(!worksheet)return new Response('Not found',{status:404});
 const {data,error}=await a.db.from('worksheet_files')
  .select('id,object_key,r2_bucket,mime_type,variant')
  .eq('worksheet_id',id).eq('role','student').eq('upload_status','verified')
  .order('is_primary',{ascending:false}).limit(1).maybeSingle();
 if(error||!data)return new Response('No verified student file',{status:404});
 try{return await deliverPrivateFile(data,true);}
 catch{return new Response('Preview temporarily unavailable',{status:503});}
}
