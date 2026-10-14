import {NextResponse} from 'next/server';
import {requireOwner} from '@/lib/admin-server';
import {deliverPrivateFile} from '@/lib/file-response';
import {r2Configured} from '@/lib/r2-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request:Request,{params}:{params:Promise<{id:string;fileId:string}>}){
  const a=await requireOwner(request);
  if(!a.ok)return NextResponse.json({error:'Access denied.'},{status:a.status});
  const {id,fileId}=await params;
  if(!uuid.test(id)||!uuid.test(fileId))return new Response('Not found',{status:404});
  if(!r2Configured())return new Response('Private storage unavailable',{status:503});
  const {data,error}=await a.db.from('worksheet_files')
    .select('id,object_key,r2_bucket,mime_type,variant')
    .eq('worksheet_id',id).eq('id',fileId).eq('upload_status','verified').maybeSingle();
  if(error||!data)return new Response('Not found',{status:404});
  try{return await deliverPrivateFile(data,new URL(request.url).searchParams.get('preview')==='1');}
  catch{return new Response('Private file temporarily unavailable',{status:502});}
}
