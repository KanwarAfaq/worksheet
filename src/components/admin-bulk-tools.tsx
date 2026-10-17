'use client';
import {useEffect,useState,type DragEvent} from 'react';
import type {Session} from '@supabase/supabase-js';
import {UploadCloud,CheckCheck,Eye,ChevronLeft,ChevronRight,X,FileText,Trash2} from 'lucide-react';
type Row={id:string;title:string;status:string;file_count?:number};
type Option={id:string;name?:string;display_name?:string};
type Props={session:Session;categories:Option[];grades:Option[];rows:Row[];
 selected:string[];onClear:()=>void;onChange:()=>void};
export default function AdminBulkTools({session,categories,grades,rows,selected,onClear,onChange}:Props){
 const [files,setFiles]=useState<File[]>([]);
 const [subject,setSubject]=useState('');
 const [grade,setGrade]=useState('');
 const [rights,setRights]=useState(false);
 const [license,setLicense]=useState<'original'|'licensed'>('original');
 const [uploading,setUploading]=useState(false);
 const [status,setStatus]=useState('');
 const [report,setReport]=useState<string[]>([]);
 const [reviewIndex,setReviewIndex]=useState(-1);
 const [filePreview,setFilePreview]=useState<{url:string;variant:string}|null>(null);
 const [previewError,setPreviewError]=useState('');
 useEffect(()=>{if(categories.length&&!subject)setSubject(categories[0].id);},[categories,subject]);
 const headers={Authorization:'Bearer '+session.access_token};
 function choose(next:FileList|null){
  setStatus('');if(!next)return;
  const acceptable=[...next].filter(f=>/\.(pdf|png|jpe?g|webp)$/i.test(f.name)&&f.size>=64&&f.size<=3*1024*1024).slice(0,15);
  setFiles(acceptable);
  if(acceptable.length!==next.length)setStatus('Some files were skipped (PDF/images, 3 MB each, maximum 15).');
 }
 async function upload(){
  if(uploading||!rights||!files.length||!subject)return;
  if(!window.confirm('Upload '+files.length+' original or licensed worksheets as PRIVATE drafts?'))return;
  setUploading(true);setReport([]);setStatus('');
  const messages:string[]=Array(files.length).fill('');
  let completed=0;
  let cursor=0;
  async function uploadOne(index:number){
   const file=files[index];
   let id='';
   try{
    const title=file.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').trim().slice(0,140)||'Worksheet';
    const meta=await fetch('/api/admin/worksheets',{method:'POST',headers:{...headers,'Content-Type':'application/json'},
     body:JSON.stringify({title,summary:'Original printable worksheet: '+title+'. Pending editorial review.',category_id:subject,grade_id:grade||null})});
    const data=await meta.json();if(!meta.ok)throw new Error(data.error||'Could not create draft');
    id=data.worksheet.id;
    const uploadData=new FormData();uploadData.set('file',file);uploadData.set('role','student');
    uploadData.set('rights_confirmed','yes');uploadData.set('license_basis',license);
    const stored=await fetch('/api/admin/worksheets/'+id+'/files',{method:'POST',headers,body:uploadData});
    const saved=await stored.json();if(!stored.ok)throw new Error(saved.error||'File upload failed');
    messages[index]='✓ '+file.name;
   }catch(e){
    messages[index]='× '+file.name+': '+(e instanceof Error?e.message:'Failed')+
      (id?' (private draft '+id.slice(0,8)+')':'');
   }
   completed++;setStatus('Uploaded '+completed+' / '+files.length+' files');
   setReport(messages.filter(Boolean));
  }
  // Two uploads in parallel balance speed with Vercel/R2 request pressure.
  const workers=Array.from({length:Math.min(2,files.length)},async()=>{
   while(cursor<files.length){
    const index=cursor++;
    await uploadOne(index);
   }
  });
  await Promise.all(workers);
  setUploading(false);setFiles([]);setStatus('Upload finished — open drafts to review.');
  onChange();
 }
 const eligible=selected.map(id=>rows.find(row=>row.id===id))
  .filter((r):r is Row=>!!r&&['draft','review'].includes(r.status)&&(r.file_count||0)>0);
 async function approve(){
  if(uploading||!eligible.length)return;
  if(!window.confirm('Publish '+eligible.length+' selected worksheets? Only verified student files with complete metadata can publish.'))return;
  setUploading(true);setStatus('Publishing selected worksheets…');
  try{
   const response=await fetch('/api/admin/worksheets/bulk',{method:'POST',
    headers:{...headers,'Content-Type':'application/json'},
    body:JSON.stringify({ids:eligible.map(x=>x.id),action:'publish'})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Bulk publication failed');
   setReport((result.results||[]).map((r:{id:string;ok:boolean;error?:string})=>
    (r.ok?'✓ ':'× ')+(rows.find(x=>x.id===r.id)?.title||r.id)+
    (r.error?' — '+r.error:'')));
   setStatus('Published '+result.published+' / '+eligible.length);
   onClear();onChange();
  }catch(e){setStatus(e instanceof Error?e.message:'Bulk publish failed');}
  finally{setUploading(false);}
 }
 async function deleteSelected(){
  const targets=selected.filter(id=>rows.some(row=>row.id===id));
  if(uploading||!targets.length)return;
  const published=rows.filter(row=>targets.includes(row.id)&&row.status==='published').length;
  if(!window.confirm('Delete '+targets.length+' selected worksheets? '+
   (published?published+' PUBLIC worksheet(s) will be removed from search and downloads. ':'')+
   'Files will be queued for deletion. This cannot be undone.'))return;
  setUploading(true);setStatus('Removing selected worksheets…');setReport([]);
  try{
   const response=await fetch('/api/admin/worksheets/bulk',{method:'POST',
    headers:{...headers,'Content-Type':'application/json'},
    body:JSON.stringify({ids:targets,action:'delete'})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Bulk deletion failed');
   setReport((result.results||[]).map((r:{id:string;ok:boolean;error?:string})=>
    (r.ok?'✓ ':'× ')+(rows.find(x=>x.id===r.id)?.title||r.id)+(r.error?' — '+r.error:'')));
   setStatus('Removed '+result.deleted+' / '+targets.length);
   onClear();onChange();
  }catch(e){setStatus(e instanceof Error?e.message:'Removal failed');}
  finally{setUploading(false);}
 }
 const targets=selected.map(id=>rows.find(row=>row.id===id)).filter((r):r is Row=>!!r);
 const active=reviewIndex>=0?targets[reviewIndex]:null;
 useEffect(()=>{
  if(!active){setFilePreview(null);return;}
  let live=true;let objectUrl:string|null=null;const controller=new AbortController();
  setPreviewError('');setFilePreview(null);
  async function fetchFile(){
   try{
    const binary=await fetch('/api/admin/worksheets/'+active!.id+'/preview',{
     headers:{Authorization:'Bearer '+session.access_token},cache:'no-store',signal:controller.signal});
    if(!binary.ok)throw new Error('Private preview unavailable');
    const blob=await binary.blob();if(!live)return;
    const mime=binary.headers.get('content-type')||blob.type;
    objectUrl=URL.createObjectURL(blob);
    setFilePreview({url:objectUrl,variant:mime.includes('pdf')?'pdf':'image'});
   }catch(e){if(live)setPreviewError(e instanceof Error?e.message:'Preview failed');}
  }
  void fetchFile();
  return()=>{live=false;controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
 },[active?.id,session.access_token]);
 return <section className="admin-bulk-tools" aria-label="Bulk worksheets">
   <div className="bulk-actions-heading"><div><h2>Bulk actions</h2></div>
    <div className="bulk-selection-actions">
     <strong>{selected.length} selected</strong>
     <button type="button" onClick={()=>setReviewIndex(0)} disabled={!selected.length||uploading}><Eye size={17}/> Preview</button>
     <button type="button" className="bulk-approve" onClick={approve} disabled={!eligible.length||uploading}>
      <CheckCheck size={17}/> Approve {eligible.length}</button>
     <button type="button" className="admin-bulk-delete" disabled={!selected.length||uploading}
      onClick={deleteSelected}><Trash2 size={17}/> Delete {selected.length}</button>
     <button type="button" disabled={!selected.length||uploading} onClick={onClear}>Clear</button>
    </div>
   </div>
   <details className="bulk-upload-dropdown">
    <summary><UploadCloud size={21}/> Upload multiple PDFs or images</summary>
    <div className="bulk-upload-fields">
     <label>Files (up to 15)
      <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={e=>choose(e.target.files)}/></label>
     <label>Subject<select value={subject} onChange={e=>setSubject(e.target.value)}>
      {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
     <label>Grade<select value={grade} onChange={e=>setGrade(e.target.value)}>
      <option value="">All grades</option>{grades.map(g=><option key={g.id} value={g.id}>{g.display_name}</option>)}</select></label>
     <label>File rights<select value={license} onChange={e=>setLicense(e.target.value as 'original'|'licensed')}>
      <option value="original">Original work</option><option value="licensed">Redistribution license</option>
     </select></label>
     <label className="bulk-rights"><input type="checkbox" checked={rights}
      onChange={e=>setRights(e.target.checked)}/> I own or have redistribution rights for all selected files.</label>
     <button type="button" className="button button-dark" disabled={!files.length||!rights||uploading}
      onClick={upload}>{uploading?'Working…':'Upload '+files.length+' files as drafts'}</button>
    </div>
   </details>
   {(status||report.length>0)&&<div className="bulk-results" role="status">
    {status&&<strong>{status}</strong>}{report.map((line,i)=><p key={i}>{line}</p>)}
   </div>}
   {active&&<div className="admin-preview-overlay" role="dialog" aria-modal="true"
      aria-label={'Preview '+active.title}>
     <div className="admin-preview-modal">
      <header><div><strong>{active.title}</strong><small>{reviewIndex+1} / {targets.length} · {active.status}</small></div>
       <button type="button" aria-label="Close preview" onClick={()=>setReviewIndex(-1)}><X size={23}/></button></header>
      <div className="admin-preview-content">
       {!filePreview?<div className="admin-preview-loading"><FileText size={33}/>{previewError||'Loading preview…'}</div>:
        filePreview.variant==='pdf'?<iframe title="Worksheet PDF" src={filePreview.url+'#toolbar=0&navpanes=0'}/>:
        <img src={filePreview.url} alt={'Worksheet '+active.title}/>}
      </div>
      <footer>
       <button type="button" disabled={reviewIndex===0} onClick={()=>setReviewIndex(i=>i-1)}><ChevronLeft/> Previous</button>
       <a href={'/admin/worksheets/'+active.id+'?review=1'} target="_blank" rel="noopener noreferrer">Open details</a>
       <button type="button" disabled={reviewIndex===targets.length-1} onClick={()=>setReviewIndex(i=>i+1)}>
        Next <ChevronRight/></button>
      </footer>
     </div>
    </div>}
 </section>;
}
