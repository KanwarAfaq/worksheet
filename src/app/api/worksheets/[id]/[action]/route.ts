import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL} from '@/lib/supabase-public';
import {deliverPrivateFile} from '@/lib/file-response';
import {r2Configured} from '@/lib/r2-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(_request:Request,{params}:{params:Promise<{id:string;action:string}>}){
  const {id,action}=await params;
  if(!uuid.test(id)||!['download','preview','print','answer-key'].includes(action))
    return new Response('Not found',{status:404});
  // A server-only privileged key is needed to fetch private object keys.
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!r2Configured())
    return new Response('Private file delivery is being configured',{status:503});
  const db=createClient(SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{
    auth:{persistSession:false,autoRefreshToken:false}
  });
  const {data:worksheet,error}=await db.from('worksheets')
    .select('id,status,answer_key_visibility').eq('id',id).eq('status','published').maybeSingle();
  if(error||!worksheet)return new Response('Not found',{status:404});
  if(action==='answer-key'&&worksheet.answer_key_visibility!=='public')
    return new Response('Answer key is restricted',{status:404});
  const role=action==='answer-key'?'answer':'student';
  const {data:files,error:fileError}=await db.from('worksheet_files')
    .select('id,object_key,r2_bucket,mime_type,variant')
    .eq('worksheet_id',id).eq('role',role).eq('upload_status','verified')
    .eq('variant','pdf').order('created_at',{ascending:false}).limit(1);
  if(fileError||!files?.length)return new Response('Not found',{status:404});
  try{return await deliverPrivateFile(files[0],action==='preview'||action==='print');}
  catch{return new Response('File temporarily unavailable',{status:502});}
}
