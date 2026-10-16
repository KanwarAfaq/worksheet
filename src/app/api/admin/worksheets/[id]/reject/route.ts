import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import {requireOwner} from '@/lib/admin-server';
import {r2Bucket,r2Client,r2Configured} from '@/lib/r2-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 const a=await requireOwner(request);
 if(!a.ok)return Response.json({error:'Access denied'},{status:a.status});
 const {id}=await params;
 if(!uuid.test(id))return Response.json({error:'Invalid ID'},{status:400});
 if(!r2Configured())return Response.json({error:'Private storage not configured'},{status:503});
 const {data:w}=await a.db.from('worksheets').select('id,status,source').eq('id',id).maybeSingle();
 if(!w||w.status!=='draft'||w.source!=='generator')
  return Response.json({error:'Only private AI/agent drafts can be rejected'},{status:409});
 const {data:files,error}=await a.db.from('worksheet_files').select('r2_bucket,object_key').eq('worksheet_id',id);
 if(error)return Response.json({error:'Cannot load draft file manifest'},{status:500});
 const client=r2Client();
 try{
  for(const file of files||[]){
   if(!file.object_key||file.r2_bucket!==r2Bucket())throw new Error('Unrecognized storage target');
   await client.send(new DeleteObjectCommand({Bucket:r2Bucket(),Key:file.object_key}));
  }
 }catch{return Response.json({error:'Storage cleanup failed; draft remains for retry'},{status:502});}
 const {error:deleteError}=await a.db.rpc('reject_ai_worksheet',{p_worksheet_id:id});
 if(deleteError)return Response.json({error:'Database rejection failed; check migration and retry'},{status:500});
 return Response.json({deleted:true},{headers:{'Cache-Control':'private, no-store'}});
}
