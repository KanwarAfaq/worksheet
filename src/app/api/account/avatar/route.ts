import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {randomUUID,createHash} from 'node:crypto';
import {requireContributor,json} from '@/lib/community-server';
import {r2Client,r2Bucket,r2Configured} from '@/lib/r2-server';
import {checkWorksheetFile} from '@/lib/file-validation';
export const runtime='nodejs';export const dynamic='force-dynamic';
const accepted=['png','jpg','webp'];
export async function GET(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 if(!r2Configured())return json({error:'Avatar storage unavailable'},503);
 const {data}=await a.db.from('worksheet_user_profiles').select('avatar_object_key,avatar_mime').eq('user_id',a.user.id).maybeSingle();
 if(!data?.avatar_object_key||!data.avatar_mime)return json({error:'No avatar'},404);
 try{
  const object=await r2Client().send(new GetObjectCommand({Bucket:r2Bucket(),Key:data.avatar_object_key}));
  if(!object.Body)return json({error:'Avatar missing'},404);
  const bytes=await object.Body.transformToByteArray();
  return new Response(Buffer.from(bytes),{headers:{'Content-Type':data.avatar_mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'Unable to load avatar'},502);}
}
export async function POST(request:Request){
 const a=await requireContributor(request);if(!a.ok)return json({error:'Sign in required'},a.status);
 if(!r2Configured())return json({error:'Cloudflare storage is not configured'},503);
 let form:FormData;
 try{form=await request.formData();}catch{return json({error:'Invalid upload'},400);}
 const file=form.get('file');
 if(!(file instanceof File)||file.size>2*1024*1024||file.size<64)return json({error:'Choose an image below 2 MB'},400);
 const bytes=Buffer.from(await file.arrayBuffer());
 let checked:ReturnType<typeof checkWorksheetFile>;
 try{checked=checkWorksheetFile(file.name,bytes);}catch{return json({error:'Use a valid PNG, JPG or WebP image'},400);}
 if(!accepted.includes(checked.type))return json({error:'Only PNG, JPG and WebP profile images are allowed'},400);
 const old=await a.db.from('worksheet_user_profiles').select('avatar_object_key,display_name').eq('user_id',a.user.id).maybeSingle();
 const key='profile-photos/'+a.user.id+'/'+randomUUID()+'.'+checked.type;
 try{
  await r2Client().send(new PutObjectCommand({Bucket:r2Bucket(),Key:key,Body:bytes,ContentType:checked.mime,Metadata:{sha256:checked.sha256}}));
  const object=await r2Client().send(new GetObjectCommand({Bucket:r2Bucket(),Key:key}));
  const received=object.Body?Buffer.from(await object.Body.transformToByteArray()):null;
  if(!received||received.length!==bytes.length||createHash('sha256').update(received).digest('hex')!==checked.sha256)throw new Error('Checksum failed');
 }catch{
  try{await r2Client().send(new DeleteObjectCommand({Bucket:r2Bucket(),Key:key}));}catch{}
  return json({error:'Cloudflare upload verification failed'},502);
 }
 const {error}=await a.db.from('worksheet_user_profiles').upsert({
  user_id:a.user.id,display_name:old.data?.display_name||'',avatar_object_key:key,avatar_sha256:checked.sha256,
  avatar_mime:checked.mime,avatar_updated_at:new Date().toISOString(),updated_at:new Date().toISOString()
 },{onConflict:'user_id'});
 if(error){
  try{await r2Client().send(new DeleteObjectCommand({Bucket:r2Bucket(),Key:key}));}catch{}
  return json({error:'Unable to save avatar hash'},500);
 }
 if(old.data?.avatar_object_key){try{await r2Client().send(new DeleteObjectCommand({Bucket:r2Bucket(),Key:old.data.avatar_object_key}));}catch{}}
 return json({sha256:checked.sha256,mime:checked.mime});
}
