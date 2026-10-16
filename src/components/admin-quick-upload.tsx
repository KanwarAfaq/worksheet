'use client';
import {useEffect,useState,type DragEvent,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import type {Session} from '@supabase/supabase-js';
import {UploadCloud,FileText} from 'lucide-react';
type Option={id:string;name?:string;display_name?:string};
export default function AdminQuickUpload({session,categories,grades}:{session:Session;categories:Option[];grades:Option[]}){
 const router=useRouter();
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState<string|null>(null);
 const [drag,setDrag]=useState(false);
 const [title,setTitle]=useState('');
 const [subject,setSubject]=useState('');
 const [grade,setGrade]=useState('');
 const [page,setPage]=useState(1);
 const [basis,setBasis]=useState<'original'|'licensed'>('original');
 const [rights,setRights]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{if(!subject&&categories.length)setSubject(categories[0].id);},[categories,subject]);
 useEffect(()=>{
  if(!file){setPreview(null);return;}
  const url=URL.createObjectURL(file);
  setPreview(url);
  return()=>URL.revokeObjectURL(url);
 },[file]);
 function pick(f:File|null){
  setError('');
  if(!f){setFile(null);return;}
  if(!/\.(pdf|png|jpe?g|webp)$/i.test(f.name)){setError('Use PDF, PNG, JPG or WebP.');return;}
  if(f.size>3*1024*1024||f.size<64){setError('File must be between 64 bytes and 3 MB.');return;}
  setFile(f);setPage(1);
  const generated=f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
  setTitle((generated.length>=3?generated:'My worksheet').slice(0,140));
 }
 function drop(e:DragEvent<HTMLDivElement>){
  e.preventDefault();setDrag(false);
  if(e.dataTransfer.files?.[0])pick(e.dataTransfer.files[0]);
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(busy||!file||!subject||!rights||title.trim().length<3)return;
  setBusy(true);setError('');
  let id='';
  let fileVerified=false;
  try{
   const headers={Authorization:'Bearer '+session.access_token};
   const description='Printable worksheet titled "'+title.trim()+'", submitted for editorial review.';
   const created=await fetch('/api/admin/worksheets',{method:'POST',cache:'no-store',
    headers:{...headers,'Content-Type':'application/json'},
    body:JSON.stringify({title:title.trim(),summary:description,category_id:subject,
     grade_id:grade||null,preview_page:file.name.toLowerCase().endsWith('.pdf')?page:1})});
   const result=await created.json();
   if(!created.ok)throw new Error(result.error||'Could not create private draft');
   id=result.worksheet.id;
   const form=new FormData();form.set('file',file);form.set('role','student');
   form.set('rights_confirmed','yes');form.set('license_basis',basis);
   const stored=await fetch('/api/admin/worksheets/'+id+'/files',{method:'POST',cache:'no-store',
    headers,body:form});
   const response=await stored.json();
   if(!stored.ok)throw new Error(response.error||'File verification failed');
   fileVerified=true;
   router.push('/admin/worksheets/'+id+'?review=1');
  }catch(err){
   let retained=fileVerified;
   if(id&&!fileVerified){
    try{
     const res=await fetch('/api/admin/worksheets/'+id,{method:'DELETE',cache:'no-store',
      headers:{Authorization:'Bearer '+session.access_token}});
     if(!res.ok)retained=true;
    }catch{retained=true;}
   }
   setError((err instanceof Error?err.message:'Upload failed')+
    (retained?' Draft saved; open it to finish.':' Please try again.'));
  }finally{setBusy(false);}
 }
 return <section className="admin-new-draft dashboard-create-card admin-one-click">
  <h2><UploadCloud size={27}/> Upload worksheet</h2>
  <form onSubmit={submit} className="simple-upload-form">
   <div className={'simple-upload-drop '+(drag?'dragging':'')} onDragEnter={e=>{e.preventDefault();setDrag(true);}}
    onDragLeave={e=>{e.preventDefault();setDrag(false);}} onDragOver={e=>e.preventDefault()} onDrop={drop}>
    <UploadCloud size={35}/>
    <strong>{file?file.name:'Drop a PDF or image'}</strong>
    <span>or click to choose · max 3 MB</span>
    <input aria-label="Choose PDF or image to upload" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
     onChange={e=>pick(e.target.files?.[0]||null)} disabled={busy}/>
   </div>
   {file&&preview&&<div className="simple-upload-preview">
    {file.name.toLowerCase().endsWith('.pdf')?<iframe key={page+preview} title="Admin PDF preview" src={preview+'#page='+page+'&toolbar=0'}/>:
     <img src={preview} alt="Worksheet preview"/>}
   </div>}
   <label htmlFor="admin-quick-title">Title</label>
   <input id="admin-quick-title" required minLength={3} maxLength={140} value={title}
    onChange={e=>setTitle(e.target.value)} placeholder="Worksheet title" disabled={busy}/>
   <label htmlFor="admin-quick-subject">Subject</label>
   <select id="admin-quick-subject" value={subject} onChange={e=>setSubject(e.target.value)} disabled={busy}>
    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
   </select>
   <details className="simple-upload-optional"><summary>More options</summary>
    <label htmlFor="admin-quick-grade">Grade (optional)</label>
    <select id="admin-quick-grade" value={grade} onChange={e=>setGrade(e.target.value)}>
     <option value="">All grades</option>{grades.map(g=><option key={g.id} value={g.id}>{g.display_name}</option>)}
    </select>
    {file?.name.toLowerCase().endsWith('.pdf')&&<>
     <label htmlFor="admin-quick-page">Public PDF cover page</label>
     <input id="admin-quick-page" type="number" min={1} max={200} value={page}
      onChange={e=>setPage(Math.min(200,Math.max(1,Number(e.target.value)||1)))}/>
    </>}
    <label htmlFor="admin-quick-license">Rights</label>
    <select id="admin-quick-license" value={basis} onChange={e=>setBasis(e.target.value as 'original'|'licensed')}>
     <option value="original">Original work</option><option value="licensed">Redistribution license</option>
    </select>
   </details>
   <label className="check-field simple-upload-rights"><input type="checkbox" checked={rights}
    onChange={e=>setRights(e.target.checked)} disabled={busy}/>
    I created this file or have permission to share it.</label>
   {error&&<p role="alert" className="admin-alert error">{error}</p>}
   <button type="submit" className="button button-dark simple-upload-submit"
    disabled={busy||!rights||!file||!subject||title.trim().length<3}>
    {busy?'Uploading…':<> <FileText size={18}/> Upload and review </>}
   </button>
  </form>
 </section>;
}
