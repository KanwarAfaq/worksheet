'use client';

import {useCallback,useEffect,useRef,useState,type ChangeEvent,type FormEvent} from 'react';
import type {Session} from '@supabase/supabase-js';
import {Archive,CheckCircle2,Download,Eye,FileText,LockKeyhole,ShieldCheck,UploadCloud,AlertCircle,ExternalLink,RefreshCw} from 'lucide-react';

type StoredFile={
 id:string;role:'student'|'answer';variant:'pdf'|'docx'|'pptx';
 original_name:string;size_bytes:number;sha256:string;license_basis:string;
 license_note:string|null;upload_status:string;checksum_verified_at:string|null;created_at:string
};
type StorageStatus={storageConfigured:boolean;publicationConfigured:boolean;maxUploadBytes:number;bucket:string};
type Props={id:string;status:string;session:Session|null;onStatusChanged:(status:string)=>void};
const sizes=(n:number)=>n<1024*1024?(n/1024).toFixed(0)+' KB':(n/1024/1024).toFixed(2)+' MB';

export default function AdminFileManager({id,status,session,onStatusChanged}:Props){
 const [config,setConfig]=useState<StorageStatus|null>(null);
 const [files,setFiles]=useState<StoredFile[]>([]);
 const [file,setFile]=useState<File|null>(null);
 const [role,setRole]=useState<'student'|'answer'>('student');
 const [license,setLicense]=useState<'original'|'licensed'>('original');
 const [licenseNote,setLicenseNote]=useState('');
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [error,setError]=useState('');
 const [preview,setPreview]=useState<{url:string;name:string}|null>(null);
 const previewRef=useRef<string|null>(null);
 const root='/api/admin/worksheets/'+encodeURIComponent(id);
 const token=session?.access_token;
 const api=useCallback(async(path:string,options?:RequestInit)=>{
   if(!token)throw new Error('Sign in to continue.');
   const res=await fetch(path,{
     ...options,cache:'no-store',
     headers:{Authorization:'Bearer '+token,...options?.headers}
   });
   const payload=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(payload.error||'Private storage request failed.');
   return payload;
 },[token]);
 const refresh=useCallback(async()=>{
   if(!token)return;
   const [state,results]=await Promise.all([api('/api/admin/storage/status'),api(root+'/files')]);
   setConfig(state);setFiles(results.files||[]);
 },[api,root,token]);
 useEffect(()=>{let mounted=true;(async()=>{
   try{await refresh();}catch(e){if(mounted)setError(e instanceof Error?e.message:'Unable to check private file storage.');}
 })();return()=>{mounted=false;};},[refresh]);
 useEffect(()=>()=>{if(previewRef.current)URL.revokeObjectURL(previewRef.current);},[]);
 async function upload(event:FormEvent<HTMLFormElement>){
   event.preventDefault();
   if(!file||!token||!confirmed||status!=='draft'||busy)return;
   if(file.size>(config?.maxUploadBytes||3_000_000)){
     setError('The file exceeds the 3 MB limit. Choose a smaller PDF, DOCX or PPTX.');return;
   }
   if(role==='answer'&&!file.name.toLowerCase().endsWith('.pdf')){
     setError('Answer keys must be uploaded as PDFs.');return;
   }
   setBusy(true);setNotice('');setError('');
   const data=new FormData();
   data.append('file',file);data.append('role',role);data.append('license_basis',license);
   data.append('license_note',licenseNote);data.append('rights_confirmed','yes');
   try{
     await api(root+'/files',{method:'POST',body:data});
     setFile(null);setConfirmed(false);setLicenseNote('');
     const input=document.getElementById('private-file-input') as HTMLInputElement|null;
     if(input)input.value='';
     setNotice('File uploaded and re-read from private R2 with matching SHA-256 checksum.');
     await refresh();
   }catch(e){setError(e instanceof Error?e.message:'Upload failed.');}
   finally{setBusy(false);}
 }
 async function openFile(entry:StoredFile,download:boolean){
   setBusy(true);setError('');
   try{
     if(!token)throw new Error('Not authenticated.');
     const res=await fetch(root+'/files/'+entry.id+(download?'':'?preview=1'),{
       headers:{Authorization:'Bearer '+token},cache:'no-store'
     });
     if(!res.ok)throw new Error(res.status===503?'Storage is not configured.':'Unable to retrieve private file.');
     const blob=await res.blob();
     const url=URL.createObjectURL(blob);
     if(download){
       const anchor=document.createElement('a');anchor.href=url;
       anchor.download='worksheet-'+entry.id.slice(0,8)+'.'+entry.variant;
       document.body.appendChild(anchor);anchor.click();anchor.remove();
       window.setTimeout(()=>URL.revokeObjectURL(url),30_000);
     } else {
       if(previewRef.current)URL.revokeObjectURL(previewRef.current);
       previewRef.current=url;
       setPreview({url,name:entry.original_name});
     }
   }catch(e){setError(e instanceof Error?e.message:'File access failed.');}
   finally{setBusy(false);}
 }
 async function changePublication(action:'publish'|'unpublish'){
   if(!token||busy)return;
   if(action==='publish'&&!window.confirm('Publish this worksheet? Its verified student PDF will be available for visitors to download.'))return;
   if(action==='unpublish'&&!window.confirm('Unpublish this worksheet and disable public file access?'))return;
   setBusy(true);setError('');setNotice('');
   try{
     const r=await api(root+'/publication',{method:'POST',
       headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});
     onStatusChanged(r.status);
     setNotice(action==='publish'?'Worksheet published. Only its verified student PDF can be downloaded publicly.':'Worksheet unpublished. Public file access is disabled.');
   }catch(e){setError(e instanceof Error?e.message:'Could not update publication status.');}
   finally{setBusy(false);}
 }
 const hasStudentPdf=files.some(f=>f.role==='student'&&f.variant==='pdf'&&f.upload_status==='verified');
 const canPublish=!!config?.storageConfigured&&!!config?.publicationConfigured&&hasStudentPdf&&status==='draft';
 return <div className="worksheet-editor-panel admin-file-manager">
  <h2><UploadCloud size={22}/> Private files & publication</h2>
  <p className="admin-files-note">Upload PDFs, Word or PowerPoint files to the private Cloudflare R2 bucket. Files are verified with a SHA-256 checksum and never served through public R2 URLs.</p>
  <div className="r2-indicator">
   <ShieldCheck size={18}/>
   <span>{config===null?'Checking private storage…':config.storageConfigured?'R2 credentials detected in Vercel':'R2 credentials missing from Vercel'}</span>
  </div>
  {config&&!config.publicationConfigured&&<p className="r2-warning">To enable public downloads, set the server-only SUPABASE_SERVICE_ROLE_KEY in Vercel. Never expose it to client code.</p>}
  {error&&<p role="alert" className="admin-alert error"><AlertCircle size={17}/>{error}</p>}
  {notice&&<p role="status" className="admin-alert good"><CheckCircle2 size={17}/>{notice}</p>}
  <div className="private-file-list">
   <strong>Attached files ({files.length})</strong>
   {files.length===0?<p>No files uploaded yet.</p>:files.map(entry=><div className="private-file-row" key={entry.id}>
    <FileText size={18}/><div className="private-file-summary"><strong>{entry.original_name}</strong><small>{entry.role==='student'?'Student':'Answer key'} · {entry.variant.toUpperCase()} · {sizes(entry.size_bytes)} · SHA-256 verified</small></div>
    <div className="private-file-buttons">
      {entry.variant==='pdf'&&<button type="button" onClick={()=>openFile(entry,false)} disabled={busy} title="Preview private PDF"><Eye size={16}/></button>}
      <button type="button" onClick={()=>openFile(entry,true)} disabled={busy} title="Download private file"><Download size={16}/></button>
    </div>
   </div>)}
  </div>
  {preview&&<div className="admin-pdf-preview"><div><span>{preview.name}</span><button type="button" onClick={()=>{if(previewRef.current)URL.revokeObjectURL(previewRef.current);previewRef.current=null;setPreview(null);}}>Close</button></div><iframe src={preview.url} title={'Private preview: '+preview.name}/></div>}
  {status==='draft'&&config?.storageConfigured&&<form onSubmit={upload} className="private-upload-form">
    <h3>Attach a document</h3>
    <label htmlFor="private-file-input">Select PDF, Word (.docx) or PowerPoint (.pptx), max 3 MB</label>
    <input id="private-file-input" type="file" accept=".pdf,.docx,.pptx" required onChange={(e:ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0]||null)}/>
    <div className="editor-two">
     <div><label htmlFor="private-file-role">File role</label><select id="private-file-role" value={role} onChange={e=>setRole(e.target.value as 'student'|'answer')}><option value="student">Student worksheet</option><option value="answer">Teacher answer key (PDF)</option></select></div>
     <div><label htmlFor="private-file-license">Copyright basis</label><select id="private-file-license" value={license} onChange={e=>setLicense(e.target.value as 'original'|'licensed')}><option value="original">My original content</option><option value="licensed">Licensed for redistribution</option></select></div>
    </div>
    <label htmlFor="private-license-note">License / attribution note (optional)</label>
    <textarea id="private-license-note" maxLength={600} rows={2} value={licenseNote} onChange={e=>setLicenseNote(e.target.value)} placeholder="e.g. Created by our team; commercial redistribution allowed"/>
    <label className="check-field"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I confirm I have the right to upload and distribute this file.</label>
    <button type="submit" className="button button-dark" disabled={!file||!confirmed||busy}><UploadCloud size={17}/>{busy?'Verifying…':'Upload and verify file'}</button>
  </form>}
  <div className="publication-box">
   <strong>Publish worksheet</strong><p>Publication requires a verified student PDF, working private R2 access, the server-only database delivery key, and owner approval.</p>
   {status==='published'?<button type="button" className="button button-outline" disabled={busy} onClick={()=>changePublication('unpublish')}><Archive size={16}/> Unpublish</button>:
    <button type="button" className="button button-dark" disabled={!canPublish||busy} onClick={()=>changePublication('publish')}><ExternalLink size={16}/> Publish verified PDF</button>}
   {!hasStudentPdf&&status==='draft'&&<small>Upload a student PDF first. Word and PowerPoint files can remain attached as private originals.</small>}
  </div>
  <button type="button" className="private-refresh" disabled={busy} onClick={()=>refresh().catch(e=>setError(String(e)))}><RefreshCw size={15}/> Refresh file list</button>
 </div>;
}
