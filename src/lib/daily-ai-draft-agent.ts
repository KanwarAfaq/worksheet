import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL} from '@/lib/supabase-public';
import {generateVisualPlan} from '@/lib/visual-agent-content';
import {renderVisualWorksheet,type VisualSubject} from '@/lib/visual-worksheet-design';
import {r2Client,r2Bucket,r2Configured} from '@/lib/r2-server';

const subjects:readonly VisualSubject[]=['math','reading','colors','math','reading'];
type RunResult={created:number;skipped:number;failed:number;ids:string[];errors:string[]};
const VERSION='visual2';

/** One owner-triggered slot per request, or all five for a scheduled run.
 * The visual-v2 slug intentionally leaves the older text-heavy drafts untouched.
 */
export async function runDailyAiDrafts(day:string,slots:number[]=[0,1,2,3,4]):Promise<RunResult>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new Error('Invalid daily date');
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!r2Configured())
  throw new Error('Missing Supabase or private R2 configuration');
 if(!slots.length||slots.length>5||new Set(slots).size!==slots.length||
  slots.some(slot=>!Number.isInteger(slot)||slot<0||slot>4))
  throw new Error('Invalid AI generation slots');
 const db=createClient(SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{
  auth:{persistSession:false,autoRefreshToken:false}
 });
 const {data:owner,error:ownerError}=await db.from('admin_profiles')
  .select('user_id').eq('role','owner').eq('enabled',true).limit(1).maybeSingle();
 if(ownerError||!owner)throw new Error('No enabled owner');
 const store=r2Client(),bucket=r2Bucket();
 const result:RunResult={created:0,skipped:0,failed:0,ids:[],errors:[]};
 for(const slot of slots){
  const grade=((Number(day.replace(/-/g,''))+slot-1)%6)+1;
  const subject=subjects[slot];
  const slug='daily-ai-'+VERSION+'-'+day+'-'+(slot+1);
  const {data:existing,error:checkError}=await db.from('worksheets')
   .select('id').eq('slug',slug).maybeSingle();
  if(checkError){result.failed++;result.errors.push('Slot '+(slot+1)+': lookup failed');continue;}
  if(existing){result.skipped++;result.ids.push(existing.id);continue;}
  let id:string|undefined;
  const storedKeys:string[]=[];
  try{
   const {plan,provider}=await generateVisualPlan(subject,grade,slot,day);
   const rendered=renderVisualWorksheet(plan);
   const {data:category}=await db.from('categories').select('id')
    .eq('slug',subject).eq('status','active').maybeSingle();
   const {data:level}=await db.from('grades').select('id').eq('slug','grade-'+grade).maybeSingle();
   if(!category||!level)throw new Error('Missing subject or grade setup');
   const {data:created,error:insertError}=await db.from('worksheets').insert({
    title:rendered.title,slug,summary:rendered.summary,description:rendered.instructions,
    category_id:category.id,grade_id:level.id,
    status:'draft',created_by:owner.user_id,source:'generator',language:'en',
    difficulty:grade<=2?'beginner':'intermediate',
    tags:['ai-review','illustrated',rendered.layout,'daily-'+day],available_formats:[]
   }).select('id').single();
   if(insertError||!created)throw new Error('Unable to save visual draft');
   id=created.id;
   for(const file of [
    {role:'student' as const,suffix:'worksheet',bytes:rendered.student,primary:true},
    {role:'answer' as const,suffix:'teacher-key',bytes:rendered.teacher,primary:false}
   ]){
    const objectKey='daily-ai-visual/'+day+'/'+id+'/'+randomUUID()+'-'+file.suffix+'.pdf';
    const checksum=createHash('sha256').update(file.bytes).digest('hex');
    await store.send(new PutObjectCommand({Bucket:bucket,Key:objectKey,Body:file.bytes,
     ContentType:'application/pdf',Metadata:{sha256:checksum}}));
    storedKeys.push(objectKey);
    const response=await store.send(new GetObjectCommand({Bucket:bucket,Key:objectKey}));
    const verified=response.Body?Buffer.from(await response.Body.transformToByteArray()):Buffer.alloc(0);
    if(verified.length!==file.bytes.length||
      createHash('sha256').update(verified).digest('hex')!==checksum)
     throw new Error('R2 PDF integrity check failed');
    const {error:fileError}=await db.from('worksheet_files').insert({
     worksheet_id:id,role:file.role,variant:'pdf',original_name:slug+'-'+file.suffix+'.pdf',
     mime_type:'application/pdf',size_bytes:file.bytes.length,sha256:checksum,
     r2_bucket:bucket,object_key:objectKey,is_primary:file.primary,upload_status:'verified',
     checksum_verified_at:new Date().toISOString(),license_basis:'original',
     license_note:'Original AI-planned and programmatically illustrated worksheet. Provider: '+provider,
     uploaded_by:owner.user_id
    });
    if(fileError)throw new Error('Could not register '+file.role+' PDF');
   }
   result.created++;result.ids.push(id);
  }catch(error){
   result.failed++;
   result.errors.push('Slot '+(slot+1)+': '+(error instanceof Error?error.message:'failed').slice(0,160));
   for(const key of storedKeys)
    await store.send(new DeleteObjectCommand({Bucket:bucket,Key:key})).catch(()=>{});
   if(id)await db.from('worksheets').delete().eq('id',id).eq('status','draft');
  }
 }
 return result;
}
