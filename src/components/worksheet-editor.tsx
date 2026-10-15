'use client';
import {useEffect,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft,ArrowRight,BookOpen,Save,CheckCircle2,AlertCircle,LockKeyhole,Archive,ArchiveRestore} from 'lucide-react';
import type {Session} from '@supabase/supabase-js';
import {supabaseBrowser} from '@/lib/supabase-browser';
import AdminFileManager from '@/components/admin-file-manager';

type Row={
 id:string;title:string;summary:string|null;description:string|null;category_id:string;
 grade_id:string|null;difficulty:string|null;language:string;tags:string[];
 seo_title:string|null;seo_description:string|null;featured:boolean;preview_page:number;
 status:string;slug:string;updated_at:string
};
type Option={id:string;name?:string;display_name?:string};
type Step=0|1|2;
export default function WorksheetEditor({id}:{id:string}){
 const router=useRouter();
 const [session,setSession]=useState<Session|null>(null);
 const [row,setRow]=useState<Row|null>(null);
 const [categories,setCategories]=useState<Option[]>([]);
 const [grades,setGrades]=useState<Option[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [step,setStep]=useState<Step>(0);
 const [fileCount,setFileCount]=useState(0);
 const [tags,setTags]=useState('');
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const root='/api/admin/worksheets/'+encodeURIComponent(id);
 useEffect(()=>{
   let alive=true;
   supabaseBrowser.auth.getSession().then(async({data})=>{
     if(!data.session){router.replace('/admin');return;}
     if(!alive)return;
     setSession(data.session);
     try{
       const [res,cats,levels]=await Promise.all([
         fetch(root,{cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token}}),
         supabaseBrowser.from('categories').select('id,name').eq('status','active').order('sort_order'),
         supabaseBrowser.from('grades').select('id,display_name').order('sort_order')
       ]);
       const result=await res.json();
       if(!res.ok)throw new Error(result.error||'Cannot open worksheet.');
       if(!alive)return;
       setRow(result.worksheet);
       setTags((result.worksheet.tags||[]).join(', '));
       setCategories(cats.data||[]);
       setGrades(levels.data||[]);
       if(['published','review'].includes(result.worksheet.status))setStep(2);
     }catch(e){if(alive)setError(e instanceof Error?e.message:'Worksheet unavailable.');}
     finally{if(alive)setLoading(false);}
   });
   return()=>{alive=false;};
 },[root,router]);
 async function save(event:FormEvent<HTMLFormElement>){
   event.preventDefault();
   if(!session||!row||saving)return;
   setSaving(true);setError('');setMessage('');
   try{
     const res=await fetch(root,{method:'PATCH',headers:{
       Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'
     },body:JSON.stringify({...row,tags:tags.split(',').map(x=>x.trim()).filter(Boolean)})});
     const data=await res.json();
     if(!res.ok)throw new Error(data.error||'Could not save your draft.');
     setRow(data.worksheet);setTags((data.worksheet.tags||[]).join(', '));
     setMessage('Draft saved. Review your worksheet before publishing.');
     setStep(2);
   }catch(e){setError(e instanceof Error?e.message:'Could not save.');}
   finally{setSaving(false);}
 }
 async function archive(){
   if(!session||!row||saving)return;
   const next=row.status==='archived'?'draft':'archived';
   if(next==='archived'&&!window.confirm('Archive this private worksheet?'))return;
   setSaving(true);setError('');
   try{
     const res=await fetch(root,{method:'PATCH',headers:{
       Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'
     },body:JSON.stringify({...row,status:next,tags:tags.split(',').map(x=>x.trim()).filter(Boolean)})});
     const data=await res.json();if(!res.ok)throw new Error(data.error||'Cannot update draft.');
     setRow(data.worksheet);setMessage(next==='archived'?'Draft archived.':'Draft restored.');
   }catch(e){setError(e instanceof Error?e.message:'Cannot update draft.');}
   finally{setSaving(false);}
 }
 if(loading)return <div className="container admin-loading">Loading private worksheet…</div>;
 if(!row)return <div className="container inner-page"><p role="alert">{error||'Worksheet not found.'}</p><Link href="/admin">Back to dashboard</Link></div>;
 const editable=row.status==='draft';
 return <section className="admin-area simplified-editor"><div className="container">
   <Link href="/admin" className="back-link"><ArrowLeft size={16}/> Worksheet dashboard</Link>
   <div className="admin-topbar"><div><div className="section-kicker">ADMIN / WORKSHEET</div>
    <h1>{row.title==='Untitled worksheet'?'New worksheet':row.title}</h1>
    <p>Upload a file → Add metadata → Preview and publish. Everything stays on this page.</p></div>
    <span className={'admin-status '+row.status}>{row.status}</span>
   </div>
   <div className="worksheet-wizard-steps">
    {(['Upload files','Worksheet details','Preview & publish'] as const).map((name,i)=>
      <button key={name} type="button" className={'worksheet-wizard-tab '+(step===i?'selected':'')}
        onClick={()=>setStep(i as Step)} disabled={row.status==='archived'||(i===2&&editable&&(row.title==='Untitled worksheet'||!row.summary))}>
        <span>{i+1}</span>{name}</button>
    )}
   </div>
   {error&&<p className="admin-alert error" role="alert"><AlertCircle size={17}/>{error}</p>}
   {message&&<p className="admin-alert good" role="status"><CheckCircle2 size={17}/>{message}</p>}
   {row.status==='archived'?<div className="worksheet-editor-panel">
     <h2>Archived draft</h2><p>Your files and metadata are kept safely.</p>
     <button type="button" className="button button-outline" onClick={archive} disabled={saving}><ArchiveRestore size={17}/> Restore draft</button>
   </div>:<>
    {step===0&&<div className="wizard-stage">
      <div className="wizard-stage-intro"><h2>1. Upload your worksheet</h2>
        <p>No compulsory PDF. Supported formats: PDF, DOCX, PPTX, PNG, JPG, and WebP (up to 3 MB per file).</p></div>
      <AdminFileManager mode="upload" id={id} status={row.status} session={session}
        onFileCountChange={setFileCount} onStatusChanged={status=>setRow(old=>old?{...old,status}:old)}/>
      <div className="wizard-step-footer"><span>{fileCount} file(s) attached. Draft saved.</span>
        <button type="button" className="button button-dark" onClick={()=>setStep(1)}>Next: metadata <ArrowRight size={17}/></button></div>
    </div>}
    {step===1&&<div className="wizard-stage">
      <div className="wizard-stage-intro"><h2>2. Write worksheet metadata</h2><p>Fill in the title and description, then save. Other details are optional.</p></div>
      <form onSubmit={save} className="wizard-details-form">
       <div className="worksheet-editor-panel"><h2><BookOpen size={20}/> Worksheet information</h2>
        <label htmlFor="edit-title">Title *</label>
        <input id="edit-title" required minLength={3} maxLength={140} disabled={!editable}
          value={row.title==='Untitled worksheet'?'':row.title} placeholder="e.g. Grade 2 addition"
          onChange={e=>setRow({...row,title:e.target.value})}/>
        <label htmlFor="edit-summary">Short description * (at least 10 characters)</label>
        <textarea id="edit-summary" required minLength={10} maxLength={700} rows={3} disabled={!editable}
          value={row.summary||''} onChange={e=>setRow({...row,summary:e.target.value})}
          placeholder="What does this worksheet help students learn?"/>
        <div className="editor-two">
         <div><label htmlFor="edit-category">Subject</label><select id="edit-category" disabled={!editable} value={row.category_id} onChange={e=>setRow({...row,category_id:e.target.value})}>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
         <div><label htmlFor="edit-grade">Grade</label><select id="edit-grade" disabled={!editable} value={row.grade_id||''} onChange={e=>setRow({...row,grade_id:e.target.value||null})}>
          <option value="">All grades</option>{grades.map(g=><option key={g.id} value={g.id}>{g.display_name}</option>)}</select></div>
        </div>
        <div className="editor-two">
         <div><label htmlFor="edit-difficulty">Difficulty</label><select id="edit-difficulty" disabled={!editable} value={row.difficulty||''} onChange={e=>setRow({...row,difficulty:e.target.value||null})}>
          <option value="">Any</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
         <div><label htmlFor="edit-language">Language</label><input id="edit-language" maxLength={6} disabled={!editable} value={row.language} onChange={e=>setRow({...row,language:e.target.value})}/></div>
        </div>
        <label htmlFor="edit-description">Full description (optional)</label>
        <textarea id="edit-description" rows={4} maxLength={8000} disabled={!editable} value={row.description||''} onChange={e=>setRow({...row,description:e.target.value})}/>
        <label htmlFor="edit-tags">Tags separated by commas</label>
        <input id="edit-tags" disabled={!editable} value={tags} onChange={e=>setTags(e.target.value)} placeholder="math, practice, subtraction"/>
        <label htmlFor="cover-preview-page">Preview cover page (PDF)</label>
        <input id="cover-preview-page" type="number" min={1} max={200} disabled={!editable}
         value={row.preview_page||1} onChange={e=>setRow({...row,preview_page:Math.min(200,Math.max(1,Number(e.target.value)||1))})}/>
        <label className="check-field"><input type="checkbox" disabled={!editable} checked={row.featured} onChange={e=>setRow({...row,featured:e.target.checked})}/> Featured worksheet</label>
       </div>
       <details className="wizard-more"><summary>Advanced SEO options (optional)</summary><div className="worksheet-editor-panel">
         <label htmlFor="edit-seo-title">SEO title</label><input id="edit-seo-title" disabled={!editable} maxLength={70} value={row.seo_title||''} onChange={e=>setRow({...row,seo_title:e.target.value})}/>
         <label htmlFor="edit-seo-desc">SEO description</label><textarea id="edit-seo-desc" disabled={!editable} maxLength={180} rows={2} value={row.seo_description||''} onChange={e=>setRow({...row,seo_description:e.target.value})}/>
       </div></details>
       <div className="wizard-step-footer"><button type="button" className="button button-outline" onClick={()=>setStep(0)}>Back to upload</button>
        <button type="submit" className="button button-dark" disabled={saving||!editable}><Save size={17}/>{saving?'Saving…':'Save draft & preview'}</button></div>
      </form>
    </div>}
    {step===2&&<div className="wizard-stage">
      <div className="wizard-stage-intro"><h2>3. Final preview & publish</h2><p>Check your title, description and uploaded files. Word and PowerPoint files are downloadable for review.</p></div>
      <div className="wizard-review-summary"><div><small>TITLE</small><h3>{row.title}</h3><p>{row.summary}</p></div>
       <div><small>DESCRIPTION</small><p>{row.description||'No extra description.'}</p></div>
       {editable&&<button type="button" className="button button-outline" onClick={()=>setStep(1)}>Edit metadata</button>}
      </div>
      <AdminFileManager mode="review" id={id} status={row.status} session={session}
        onFileCountChange={setFileCount} onStatusChanged={status=>setRow(old=>old?{...old,status}:old)}/>
      {editable&&<div className="wizard-step-footer"><button type="button" className="button button-outline" onClick={()=>setStep(0)}>Back to files</button>
       <button type="button" className="button button-outline" onClick={archive} disabled={saving}><Archive size={16}/> Archive draft</button></div>}
    </div>}
   </>}
   <p className="wizard-draft-note"><LockKeyhole size={16}/> You can leave and reopen your saved draft from the dashboard.</p>
 </div></section>;
}
