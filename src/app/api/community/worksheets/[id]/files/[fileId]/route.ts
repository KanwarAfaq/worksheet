import {requireContributor} from '@/lib/community-server';
import {deliverPrivateFile} from '@/lib/file-response';
import {r2Configured} from '@/lib/r2-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request:Request,{params}:{params:Promise<{id:string;fileId:string}>}){
 const a=await requireContributor(request);if(!a.ok)return new Response('Access denied',{status:a.status});
 const {id,fileId}=await params;
 if(!uuid.test(id)||!uuid.test(fileId)||!r2Configured())return new Response('Not found',{status:404});
 const {data:w}=await a.db.from('worksheets').select('id').eq('id',id).eq('created_by',a.user.id).not('tags','cs','{removed-by-author}').maybeSingle();
 if(!w)return new Response('Not found',{status:404});
 const {data:file}=await a.db.from('worksheet_files').select('id,object_key,r2_bucket,mime_type,variant')
 .eq('id',fileId).eq('worksheet_id',id).eq('upload_status','verified').maybeSingle();
 if(!file)return new Response('Not found',{status:404});
 try{return await deliverPrivateFile(file,new URL(request.url).searchParams.get('preview')==='1');}
 catch{return new Response('File unavailable',{status:502});}
}
