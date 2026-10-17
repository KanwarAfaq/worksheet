import 'server-only';
import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {after} from 'next/server';
import {r2Bucket,r2Client,r2Configured} from '@/lib/r2-server';
import {SUPABASE_URL} from '@/lib/supabase-public';

type CleanupFile={id:string;bucket:string;key:string};
/**
 * Transactionally delete the authorized private draft in Postgres and enqueue
 * its R2 keys, then attempt object cleanup. The queue stays if R2 is offline;
 * never return the keys to clients or delete other accounts' drafts.
 */
export async function deletePrivateDraft(db:SupabaseClient,id:string){
 const {data,error}=await db.rpc('delete_worksheet_draft',{p_worksheet_id:id});
 if(error)throw new Error(error.message);
 const files=Array.isArray(data?.files)?data.files as CleanupFile[]:[];
 if(!files.length)return{deleted:true,cleanupPending:0};
 // Reply after the authorized DB transaction commits; R2 deletions and
 // queue acknowledgement are awaited by Next.js after(), not by the browser.
 after(async()=>{try{await clearR2QueuedFiles(files);}catch(e){
  console.error('Background R2 cleanup deferred',e instanceof Error?e.name:'unknown');
 }});
 return{deleted:true,cleanupPending:files.length};
}
async function clearR2QueuedFiles(files:CleanupFile[]){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const service=key?createClient(SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
 const store=r2Configured()?r2Client():null;
 const configuredBucket=store?r2Bucket():null;
 for(const item of files){
  if(!store||!configuredBucket||item.bucket!==configuredBucket||typeof item.key!=='string'){
   continue;
  }
  try{
   await store.send(new DeleteObjectCommand({Bucket:configuredBucket,Key:item.key}));
   if(service){
    const {error:ackError}=await service.from('draft_r2_cleanup_queue').delete().eq('id',item.id);
    if(ackError)console.error('Draft cleanup acknowledgement failed:',ackError.code);
   }
  }catch(e){
   console.error('Deferred R2 draft cleanup',e instanceof Error?e.name:'unknown');
  }
 }
}
