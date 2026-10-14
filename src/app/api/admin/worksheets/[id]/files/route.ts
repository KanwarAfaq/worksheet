import {NextResponse} from 'next/server';
import {GetObjectCommand,PutObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {createHash,randomUUID} from 'node:crypto';
import {requireOwner} from '@/lib/admin-server';
import {r2Client,r2Bucket,r2Configured,MAX_UPLOAD_BYTES} from '@/lib/r2-server';
import {checkWorksheetFile} from '@/lib/file-validation';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const reply=(payload:object,status:number)=>NextResponse.json(payload,{
  status,headers:{'Cache-Control':'private, no-store'}
});
type Context={params:Promise<{id:string}>};

export async function GET(request:Request,{params}:Context){
  const a=await requireOwner(request);
  if(!a.ok)return reply({error:'Access denied.'},a.status);
  const {id}=await params;
  if(!uuid.test(id))return reply({error:'Invalid worksheet ID.'},400);
  const {data,error}=await a.db.from('worksheet_files')
    .select('id,role,variant,original_name,mime_type,size_bytes,sha256,license_basis,license_note,upload_status,checksum_verified_at,created_at')
    .eq('worksheet_id',id).order('created_at',{ascending:false}).limit(60);
  if(error)return reply({error:'Could not load worksheet files.'},500);
  return reply({files:data||[]},200);
}

export async function POST(request:Request,{params}:Context){
  const a=await requireOwner(request);
  if(!a.ok)return reply({error:'Access denied.'},a.status);
  if(!r2Configured())return reply({error:'R2 storage is not configured on the server.'},503);
  const {id}=await params;
  if(!uuid.test(id))return reply({error:'Invalid worksheet ID.'},400);
  const declared=Number(request.headers.get('content-length'));
  if(Number.isFinite(declared)&&declared>MAX_UPLOAD_BYTES+250_000)
    return reply({error:'Upload exceeds the 3 MB preview limit.'},413);
  const {data:worksheet}=await a.db.from('worksheets').select('status')
    .eq('id',id).maybeSingle();
  if(!worksheet)return reply({error:'Worksheet not found.'},404);
  if(worksheet.status!=='draft')return reply({error:'Only draft worksheets accept uploads.'},409);

  let form:FormData;
  try{form=await request.formData();}catch{return reply({error:'Invalid upload form.'},400);}
  const file=form.get('file');
  const role=form.get('role');
  const basis=form.get('license_basis');
  const note=String(form.get('license_note')||'').trim();
  if(!(file instanceof File)||!['student','answer'].includes(String(role))
    || !['original','licensed'].includes(String(basis))
    || form.get('rights_confirmed')!=='yes'||note.length>600)
    return reply({error:'Choose a student/answer file and confirm original authorship or license.'},400);
  if(file.size>MAX_UPLOAD_BYTES || file.size<64)
    return reply({error:'Choose a PDF, DOCX or PPTX smaller than 3 MB.'},413);

  const input=Buffer.from(await file.arrayBuffer());
  let verified:ReturnType<typeof checkWorksheetFile>;
  try{verified=checkWorksheetFile(file.name,input);}
  catch(e){return reply({error:e instanceof Error?e.message:'Invalid file type.'},400);}
  if(role==='answer'&&verified.type!=='pdf')
    return reply({error:'Teacher answer key uploads must be PDF.'},400);
  const {data:duplicate,error:dupError}=await a.db.from('worksheet_files')
    .select('id,worksheet_id').eq('sha256',verified.sha256)
    .eq('size_bytes',input.length).eq('upload_status','verified').limit(1);
  if(dupError)return reply({error:'Unable to check file duplicates.'},500);
  if(duplicate?.length)return reply({error:'This exact file was already uploaded. Please use a different version.',duplicate:true},409);

  const s3=r2Client(),bucket=r2Bucket();
  const key='worksheets/'+id+'/'+randomUUID()+'.'+verified.type;
  try{
    await s3.send(new PutObjectCommand({
      Bucket:bucket,Key:key,Body:input,ContentType:verified.mime,
      Metadata:{sha256:verified.sha256}
    }));
    const remote=await s3.send(new GetObjectCommand({Bucket:bucket,Key:key}));
    if(!remote.Body)throw new Error('Unable to verify uploaded R2 object.');
    const uploaded=Buffer.from(await remote.Body.transformToByteArray());
    const digest=createHash('sha256').update(uploaded).digest('hex');
    if(uploaded.length!==input.length||digest!==verified.sha256)
      throw new Error('R2 checksum verification failed.');
  }catch{
    try{await s3.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}catch{}
    return reply({error:'Unable to store and verify this file in R2. Check bucket access permissions.'},502);
  }

  const {data,error}=await a.db.from('worksheet_files').insert({
    worksheet_id:id,role,variant:verified.type,original_name:file.name.slice(0,180),
    mime_type:verified.mime,size_bytes:input.length,sha256:verified.sha256,
    r2_bucket:bucket,object_key:key,upload_status:'verified',
    checksum_verified_at:new Date().toISOString(),is_primary:role==='student',
    license_basis:basis,license_note:note||null,uploaded_by:a.user.id
  }).select('id,role,variant,original_name,size_bytes,sha256,license_basis,upload_status').single();
  if(error){
    try{await s3.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));}catch{}
    return reply({error:'File stored but database registration failed. Upload rolled back.'},500);
  }
  return reply({file:data,verified:true},201);
}
