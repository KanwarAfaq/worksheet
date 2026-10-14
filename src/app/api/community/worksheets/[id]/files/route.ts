import {GetObjectCommand,PutObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {randomUUID,createHash} from 'node:crypto';
import {requireContributor,json} from '@/lib/community-server';
import {r2Client,r2Bucket,r2Configured,MAX_UPLOAD_BYTES} from '@/lib/r2-server';
import {checkWorksheetFile} from '@/lib/file-validation';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Context){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required.'},a.status);
 const {id}=await params;if(!uuid.test(id))return json({error:'Invalid ID'},400);
 const {data:owner}=await a.db.from('worksheets').select('id').eq('id',id).eq('created_by',a.user.id).maybeSingle();
 if(!owner)return json({error:'Not found.'},404);
 const {data,error}=await a.db.from('worksheet_files').select('id,role,variant,original_name,size_bytes,upload_status')
 .eq('worksheet_id',id).order('created_at',{ascending:false}).limit(10);
 if(error)return json({error:'Unable to load files.'},500);
 return json({files:data||[]});
}
export async function POST(request:Request,{params}:Context){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in and verify your email.'},a.status);
 if(!r2Configured())return json({error:'Uploads are not configured yet.'},503);
 const {id}=await params;if(!uuid.test(id))return json({error:'Invalid ID.'},400);
 const {data:w}=await a.db.from('worksheets').select('id,status').eq('id',id).eq('created_by',a.user.id).maybeSingle();
 if(!w||w.status!=='draft')return json({error:'Only your own saved drafts accept files.'},403);
 const requested=Number(request.headers.get('content-length'));
 if(Number.isFinite(requested)&&requested>MAX_UPLOAD_BYTES+200_000)return json({error:'Max 3 MB per file.'},413);
 let data:FormData;
 try{data=await request.formData();}catch{return json({error:'Invalid upload.'},400);}
 const f=data.get('file'),confirmed=data.get('rights_confirmed');
 if(!(f instanceof File)||confirmed!=='yes')return json({error:'Choose a file and confirm you have redistribution rights.'},400);
 if(f.size>MAX_UPLOAD_BYTES||f.size<64)return json({error:'File must be less than 3 MB.'},413);
 const {data:existing,error:fetchError}=await a.db.from('worksheet_files').select('id')
  .eq('worksheet_id',id).eq('role','student').limit(6);
 if(fetchError)return json({error:'Unable to check upload quota.'},500);
 if((existing||[]).length>=5)return json({error:'Maximum 5 files per worksheet.'},409);
 // Public library prioritizes PDF/Word. Other legacy formats are not accepted for new community submissions.
 let verified:ReturnType<typeof checkWorksheetFile>;
 const body=Buffer.from(await f.arrayBuffer());
 try{verified=checkWorksheetFile(f.name,body);}
 catch(e){return json({error:e instanceof Error?e.message:'Invalid file.'},400);}
 if(!['pdf','docx'].includes(verified.type))return json({error:'Community uploads currently support PDF or Word (.docx).'},400);
 const client=r2Client(),bucket=r2Bucket(),key='community/'+a.user.id+'/'+id+'/'+randomUUID()+'.'+verified.type;
 try{
  await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:body,ContentType:verified.mime,Metadata:{sha256:verified.sha256}}));
  const obj=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
  if(!obj.Body)throw new Error('Missing object');
  const read=Buffer.from(await obj.Body.transformToByteArray());
  if(read.length!==body.length||createHash('sha256').update(read).digest('hex')!==verified.sha256)throw new Error('Checksum mismatch');
 }catch{
  try{await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}catch{}
  return json({error:'Private upload verification failed.'},502);
 }
 const {data:record,error}=await a.db.from('worksheet_files')
 .insert({worksheet_id:id,role:'student',variant:verified.type,original_name:f.name.slice(0,160),
  mime_type:verified.mime,size_bytes:body.length,sha256:verified.sha256,
  r2_bucket:bucket,object_key:key,is_primary:true,license_basis:'original',
  upload_status:'verified',checksum_verified_at:new Date().toISOString(),uploaded_by:a.user.id})
 .select('id,variant,original_name').single();
 if(error){try{await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}catch{}
  return json({error:'Could not register file. Duplicate or quota exceeded.'},409);}
 return json({file:record},201);
}
