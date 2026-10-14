import 'server-only';
import {createHash,randomUUID} from 'node:crypto';
import {PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {jsPDF} from 'jspdf';
import {Document,Packer,Paragraph,TextRun,HeadingLevel} from 'docx';
import {createClient} from '@supabase/supabase-js';
import {r2Client,r2Bucket,r2Configured} from '@/lib/r2-server';
import {SUPABASE_URL} from '@/lib/supabase-public';

type Lesson={slug:string;title:string;summary:string;subject:string;grade:string;instruction:string;questions:string[];answers:string[]};
type StoredVariant='pdf'|'docx';
function pdfLesson(item:Lesson):Buffer{
 const pdf=new jsPDF({unit:'mm',format:'a4'});
 pdf.setFont('helvetica','bold');pdf.setFontSize(13);pdf.setTextColor(39,99,69);
 pdf.text('WORKSHEET STUDIO',18,19);
 pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.setTextColor(50);
 pdf.text('Name: ____________________     Date: __________',18,30);
 pdf.setFont('helvetica','bold');pdf.setFontSize(21);
 pdf.text(item.title,18,47,{maxWidth:172});
 pdf.setFont('helvetica','normal');pdf.setFontSize(11);
 pdf.text(pdf.splitTextToSize(item.instruction,172),18,57);
 let y=77;
 item.questions.forEach((question,index)=>{
  pdf.setFontSize(12);
  pdf.text((index+1)+'. '+question,20,y);
  pdf.setDrawColor(145);
  pdf.line(110,y+2,185,y+2);
  y+=13;
 });
 // The student PDF must never contain the answers.
 // Teacher keys are stored separately under the admin-only 'answer' role.
 return Buffer.from(pdf.output('arraybuffer'));
}
async function docxLesson(item:Lesson):Promise<Buffer>{
 const children=[
  new Paragraph({text:'WORKSHEET STUDIO · ORIGINAL PRACTICE',heading:HeadingLevel.HEADING_2}),
  new Paragraph({text:'Name: _______________________   Date: ______________'}),
  new Paragraph({text:item.title,heading:HeadingLevel.HEADING_1}),
  new Paragraph({children:[new TextRun({text:item.instruction,italics:true})]}),
  ...item.questions.map((q,i)=>new Paragraph({text:(i+1)+'.  '+q+'     ______________________',spacing:{after:160}}))
 ];
 const document=new Document({sections:[{properties:{},children}]});
 return Buffer.from(await Packer.toBuffer(document));
}
function buildOriginals(day:string):Lesson[]{
 const numeral=Number(day.replace(/-/g,''))%15;
 const pairs:Array<[number,number]>=[];
 for(let i=0;i<12;i++){
  const a=(i*7+numeral)%17+1;
  const b=(i*3+numeral)%Math.max(1,20-a)+1;
  if(pairs.some(([x,y])=>x===a&&y===b)){pairs.push([i+1,(numeral+i)%8+1]);}else pairs.push([a,b]);
 }
 const words=['rabbit','garden','pencil','planet','banana','monkey','window','purple','winter','orange','school','flower'];
 return [
  {slug:'auto-math-addition-'+day,title:'Daily Addition Practice — Grade 1 — '+day,
   summary:'Twelve original addition problems that build number confidence for Grade 1 learners.',
   subject:'math',grade:'grade-1',instruction:'Solve each addition problem. Show your working if needed.',
   questions:pairs.map(([a,b])=>a+' + '+b+' ='),answers:pairs.map(([a,b])=>String(a+b))},
  {slug:'auto-spelling-'+day,title:'Missing Letters Challenge — Grade 2 — '+day,
   summary:'Twelve original missing-letter spelling exercises using familiar elementary vocabulary.',
   subject:'spelling',grade:'grade-2',instruction:'Fill in the missing letters and write each completed word.',
   questions:words.map((w,i)=>w.split('').map((c,j)=>j===1||j===Math.min(w.length-1,3)+(i%2===0?0:1)&&j<w.length?'_':c).join(' ')),
   answers:words}
 ];
}
function validateLesson(w:Lesson){
 if(w.questions.length<10||w.answers.length!==w.questions.length||!w.summary||w.title.length<6)throw new Error('Template quality gate failed.');
 if(new Set(w.questions).size!==w.questions.length)throw new Error('Repeated questions detected.');
 if(w.questions.some(q=>q.length<3)||w.answers.some(a=>!a))throw new Error('Empty exercise detected.');
}
export async function runOriginalAgent(day:string){
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!r2Configured())throw new Error('R2 or Supabase server configuration missing.');
 const db=createClient(SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{
  auth:{persistSession:false,autoRefreshToken:false}
 });
 const {data:owner,error:ownerError}=await db.from('admin_profiles')
   .select('user_id').eq('role','owner').eq('enabled',true).limit(1).maybeSingle();
 if(ownerError||!owner)throw new Error('No active owner account.');
 const bucket=r2Bucket(),client=r2Client();
 let created=0,skipped=0,errors=0;
 const templates=buildOriginals(day);
 for(const worksheet of templates){
  try{
   validateLesson(worksheet);
   const {data:category}=await db.from('categories').select('id').eq('slug',worksheet.subject).single();
   const {data:grade}=await db.from('grades').select('id').eq('slug',worksheet.grade).single();
   if(!category||!grade)throw new Error('Missing taxonomy seed');
   const {data:existing}=await db.from('worksheets').select('id,status')
      .eq('slug',worksheet.slug).maybeSingle();
   if(existing?.status==='published'){skipped++;continue;}
   let id=existing?.id;
   if(!id){
    const {data:insert,error}=await db.from('worksheets').insert({
      title:worksheet.title,summary:worksheet.summary,description:worksheet.instruction,
      slug:worksheet.slug,category_id:category.id,grade_id:grade.id,status:'draft',
      created_by:owner.user_id,source:'generator',language:'en',difficulty:'beginner'
    }).select('id').single();
    if(error||!insert)throw new Error('Unable to create original worksheet');
    id=insert.id;
   }
   for(const type of ['pdf','docx'] as StoredVariant[]){
    const {data:found}=await db.from('worksheet_files').select('id')
      .eq('worksheet_id',id).eq('variant',type).eq('role','student').eq('upload_status','verified').limit(1);
    if(found?.length)continue;
    const bytes=type==='pdf'?pdfLesson(worksheet):await docxLesson(worksheet);
    const sha=createHash('sha256').update(bytes).digest('hex');
    const key='original-agent/'+day+'/'+id+'/'+randomUUID()+'.'+type;
    try{
     await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:bytes,ContentType:
       type==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       Metadata:{sha256:sha}
     }));
     const remote=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));
     const actual=remote.Body?Buffer.from(await remote.Body.transformToByteArray()):Buffer.alloc(0);
     if(actual.length!==bytes.length||createHash('sha256').update(actual).digest('hex')!==sha)
        throw new Error('Private upload integrity check failed');
    }catch(e){
     await client.send(new DeleteObjectCommand({Bucket:bucket,Key:key})).catch(()=>{});
     throw e;
    }
    const {error:regError}=await db.from('worksheet_files').insert({
      worksheet_id:id,role:'student',variant:type,
      original_name:worksheet.slug+'.'+type,mime_type:
        type==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size_bytes:bytes.length,sha256:sha,r2_bucket:bucket,object_key:key,
      is_primary:type==='pdf',upload_status:'verified',checksum_verified_at:new Date().toISOString(),
      license_basis:'original',license_note:'Original deterministic worksheet generated from project-owned templates',
      uploaded_by:owner.user_id
    });
    if(regError)throw new Error('Database file registration failed');
   }
   const {data:answerExists}=await db.from('worksheet_files').select('id')
      .eq('worksheet_id',id).eq('role','answer').eq('variant','pdf').eq('upload_status','verified').limit(1);
   if(!answerExists?.length){
     const teacher=new jsPDF({unit:'mm',format:'a4'});
     teacher.setFont('helvetica','bold');teacher.setFontSize(18);
     teacher.text('Teacher answer key: '+worksheet.title,17,24,{maxWidth:180});
     teacher.setFont('helvetica','normal');teacher.setFontSize(12);
     worksheet.answers.forEach((answer,index)=>teacher.text((index+1)+'. '+answer,19,52+index*14));
     const keyBytes=Buffer.from(teacher.output('arraybuffer'));
     const keySha=createHash('sha256').update(keyBytes).digest('hex');
     const answerKey='original-agent/'+day+'/'+id+'/'+randomUUID()+'-teacher.pdf';
     await client.send(new PutObjectCommand({Bucket:bucket,Key:answerKey,Body:keyBytes,ContentType:'application/pdf',Metadata:{sha256:keySha}}));
     const confirm=await client.send(new GetObjectCommand({Bucket:bucket,Key:answerKey}));
     const received=confirm.Body?Buffer.from(await confirm.Body.transformToByteArray()):Buffer.alloc(0);
     if(createHash('sha256').update(received).digest('hex')!==keySha)throw new Error('Teacher key SHA-256 verification failed');
     const {error:keyError}=await db.from('worksheet_files').insert({
       worksheet_id:id,role:'answer',variant:'pdf',original_name:worksheet.slug+'-teacher.pdf',
       mime_type:'application/pdf',size_bytes:keyBytes.length,sha256:keySha,
       r2_bucket:bucket,object_key:answerKey,is_primary:false,upload_status:'verified',
       checksum_verified_at:new Date().toISOString(),license_basis:'original',
       license_note:'Original answer key generated from validated template',uploaded_by:owner.user_id
     });
     if(keyError)throw new Error('Teacher answer key registration failed');
   }
   const {data:files}=await db.from('worksheet_files').select('variant')
     .eq('worksheet_id',id).eq('role','student').eq('upload_status','verified');
   const variants=[...new Set((files||[]).map(x=>x.variant))];
   if(!variants.includes('pdf')||!variants.includes('docx'))throw new Error('Incomplete formats');
   const {error:pubError}=await db.from('worksheets').update({
     status:'published',published_at:new Date().toISOString(),available_formats:variants
   }).eq('id',id).eq('status','draft');
   if(pubError)throw new Error('Publish failed');
   await db.from('audit_logs').insert({actor_id:owner.user_id,action:'agent.original.published',
     resource_type:'worksheet',resource_id:id,safe_diff:{template:worksheet.subject,formats:variants}});
   created++;
  }catch{errors++;}
 }
 return {created,skipped,errors,templates:templates.length};
}
export async function reviewCommunityQueue(){
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Missing database service key.');
 const db=createClient(SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{
  auth:{persistSession:false,autoRefreshToken:false}
 });
 const {data:pending}=await db.from('community_moderation').select('worksheet_id')
   .eq('state','pending').order('created_at').limit(20);
 let checked=0;
 for(const item of pending||[]){
  const {data:w}=await db.from('worksheets').select('id,title,summary,status')
    .eq('id',item.worksheet_id).maybeSingle();
  const {data:files}=await db.from('worksheet_files').select('variant,upload_status,sha256,license_basis')
    .eq('worksheet_id',item.worksheet_id).eq('role','student');
  const checks={
   metadata:!!w&&w.status==='review'&&w.title.length>=3&&(w.summary?.length||0)>=10,
   supported:(files||[]).length>0&&(files||[]).every(f=>['pdf','docx'].includes(f.variant)),
   checksums:(files||[]).every(f=>f.upload_status==='verified'&&/^[a-f0-9]{64}$/.test(f.sha256)),
   licenseAttested:(files||[]).every(f=>f.license_basis==='original'||f.license_basis==='licensed'),
   contentsScreened:false,
   copyrightVerified:false
  };
  await db.from('community_moderation').update({
    state:'needs_review',last_checks:checks,reviewed_at:new Date().toISOString()
  }).eq('worksheet_id',item.worksheet_id).eq('state','pending');
  checked++;
 }
 return {checked,requiresHumanReview:checked};
}
