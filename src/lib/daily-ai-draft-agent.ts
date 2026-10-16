import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {createClient} from '@supabase/supabase-js';
import {jsPDF} from 'jspdf';
import {SUPABASE_URL} from '@/lib/supabase-public';
import {generateAIWorksheet} from '@/lib/ai-worksheet';
import {r2Client,r2Bucket,r2Configured} from '@/lib/r2-server';

const subjects=['math','reading','colors','math','reading'] as const;
const names:Record<string,string>={math:'Math',reading:'English',colors:'Color and Shapes'};
type RunResult={created:number;skipped:number;failed:number;ids:string[];errors:string[]};

// PDF layout is capped at one A4 page. The teacher answers are never in the student file.
function renderOnePage(title:string,instructions:string,questions:string[]):Buffer{
 const pdf=new jsPDF({format:'a4',unit:'mm'});
 pdf.setFont('helvetica','bold');pdf.setFontSize(11);
 pdf.text('WORKSHEET STUDIO',16,15);
 pdf.setFontSize(17);
 const heading=pdf.splitTextToSize(title,176).slice(0,2);
 pdf.text(heading,16,27);
 let y=27+heading.length*8;
 pdf.setFont('helvetica','normal');pdf.setFontSize(10);
 const intro=pdf.splitTextToSize(instructions,176).slice(0,3);
 pdf.text(intro,16,y);y+=intro.length*5+9;
 pdf.text('Name: _______________________   Date: ______________',16,y);y+=12;
 for(let i=0;i<questions.length;i++){
  const lines=pdf.splitTextToSize((i+1)+'. '+questions[i],174);
  if(y+lines.length*5+11>274)throw new Error('One-page quality gate: content overflows');
  pdf.setFontSize(11);pdf.text(lines,17,y);y+=lines.length*5+11;
  pdf.setDrawColor(190);pdf.line(20,y-7,188,y-7);
 }
 if(pdf.getNumberOfPages()!==1)throw new Error('Page count must equal one');
 return Buffer.from(pdf.output('arraybuffer'));
}
export async function runDailyAiDrafts(day:string):Promise<RunResult>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw new Error('Invalid daily date');
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!r2Configured())throw new Error('Missing Supabase or private R2 configuration');
 const db=createClient(SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:owner,error:ownerError}=await db.from('admin_profiles').select('user_id').eq('role','owner').eq('enabled',true).limit(1).maybeSingle();
 if(ownerError||!owner)throw new Error('No enabled owner');
 const result:RunResult={created:0,skipped:0,failed:0,ids:[],errors:[]};
 const client=r2Client(),bucket=r2Bucket();
 for(let i=0;i<5;i++){
  const grade=((Number(day.replace(/-/g,''))+i-1)%6)+1;
  const subject=subjects[i];
  const slug='daily-ai-'+day+'-'+(i+1);
  const {data:existing,error:checkError}=await db.from('worksheets').select('id').eq('slug',slug).maybeSingle();
  if(checkError){result.failed++;result.errors.push('Slot '+(i+1)+': lookup failed');continue;}
  if(existing){result.skipped++;continue;}
  const topic=subject==='colors'?'Recognize, count and color shapes':subject==='math'?'Grade '+grade+' number sense and arithmetic':'Grade '+grade+' English reading and vocabulary';
  let key:string|undefined,worksheetId:string|undefined;
  try{
   const ai=await generateAIWorksheet(topic,subject,grade,'easy');
   // Keep layout legible: at most eight concise exercises on one page.
   const questions=ai.questions.slice(0,8).map(q=>q.question);
   if(questions.length<5||new Set(questions.map(q=>q.toLowerCase())).size!==questions.length)throw new Error('Question quality gate');
   const title=(names[subject]+' Practice — Grade '+grade+' — '+day).slice(0,90);
   const bytes=renderOnePage(title,ai.instructions,questions);
   const summary=('Original one-page Grade '+grade+' '+names[subject].toLowerCase()+' practice covering '+topic.toLowerCase()+'. Generated as a private draft for administrator review.');
   const {data:cat}=await db.from('categories').select('id').eq('slug',subject).eq('status','active').maybeSingle();
   const {data:level}=await db.from('grades').select('id').eq('slug','grade-'+grade).maybeSingle();
   if(!cat||!level)throw new Error('Missing category/grade mapping');
   const {data:insert,error:insertError}=await db.from('worksheets').insert({
    title,slug,summary,description:ai.instructions,category_id:cat.id,grade_id:level.id,
    status:'draft',created_by:owner.user_id,source:'generator',language:'en',difficulty:'beginner',
    tags:['ai-review','daily-'+day],available_formats:[]
   }).select('id').single();
   if(insertError||!insert)throw new Error('Draft database insert failed');
   worksheetId=insert.id;
   key='daily-ai/'+day+'/'+worksheetId+'/'+randomUUID()+'.pdf';
   const sha=createHash('sha256').update(bytes).digest('hex');
   await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:bytes,ContentType:'application/pdf',Metadata:{sha256:sha}}));
   const remote=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
   const verified=remote.Body?Buffer.from(await remote.Body.transformToByteArray()):Buffer.alloc(0);
   if(createHash('sha256').update(verified).digest('hex')!==sha)throw new Error('Storage verification failed');
   const {error:fileError}=await db.from('worksheet_files').insert({
    worksheet_id:worksheetId,role:'student',variant:'pdf',original_name:slug+'.pdf',
    mime_type:'application/pdf',size_bytes:bytes.length,sha256:sha,r2_bucket:bucket,object_key:key,
    is_primary:true,upload_status:'verified',checksum_verified_at:new Date().toISOString(),
    license_basis:'original',license_note:'AI-assisted original exercises; pending owner review',uploaded_by:owner.user_id
   });
   if(fileError)throw new Error('File registration failed');
   result.created++;result.ids.push(worksheetId);
  }catch(e){
   result.failed++;result.errors.push('Slot '+(i+1)+': '+(e instanceof Error?e.message:'failed').slice(0,90));
   if(key)await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key})).catch(()=>{});
   if(worksheetId)await db.from('worksheets').delete().eq('id',worksheetId).eq('status','draft');
  }
 }
 return result;
}
