'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CopyPlus, Archive, ArchiveRestore, Save, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';
import AdminFileManager from '@/components/admin-file-manager';

type Row = { id:string; title:string; summary:string|null; description:string|null; category_id:string;
  grade_id:string|null; difficulty:string|null; language:string;tags:string[];seo_title:string|null;
  seo_description:string|null; featured:boolean; status:string;slug:string;updated_at:string };
type Option={id:string;name?:string;display_name?:string};
export default function WorksheetEditor({id}:{id:string}) {
  const router=useRouter();
  const [session,setSession]=useState<Session|null>(null);
  const [row,setRow]=useState<Row|null>(null);
  const [categories,setCategories]=useState<Option[]>([]);
  const [grades,setGrades]=useState<Option[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [tags,setTags]=useState('');
  const request=useCallback(async(path:string,init?:RequestInit,token?:string)=>{
    const bearer=token||session?.access_token;
    const res=await fetch(path,{...init,cache:'no-store',headers:{Authorization:'Bearer '+bearer,'Content-Type':'application/json',...init?.headers}});
    const json=await res.json();if(!res.ok)throw new Error(json.error||'Request failed');
    return json;
  },[session?.access_token]);
  useEffect(()=>{
    let active=true;
    supabaseBrowser.auth.getSession().then(async ({data})=>{
      if(!data.session){router.replace('/admin');return;}
      if(!active)return;
      setSession(data.session);
      try {
        const [w,c,g]=await Promise.all([
          request('/api/admin/worksheets/'+encodeURIComponent(id),undefined,data.session.access_token),
          supabaseBrowser.from('categories').select('id,name').eq('status','active').order('sort_order'),
          supabaseBrowser.from('grades').select('id,display_name').order('sort_order')
        ]);
        if(!active)return;
        setRow(w.worksheet);setTags((w.worksheet.tags||[]).join(', '));
        setCategories(c.data||[]);setGrades(g.data||[]);
      }catch(e){if(active)setError(e instanceof Error?e.message:'Unable to load worksheet');}
      finally{if(active)setLoading(false);}
    });
    return ()=>{active=false;};
  },[id,router,request]);
  async function save(event?:FormEvent<HTMLFormElement>,status?:'draft'|'archived') {
    event?.preventDefault();if(!row || !session || saving)return;
    if(status==='archived' && !window.confirm('Archive this worksheet? It will remain private and can be restored.'))return;
    setSaving(true);setError('');setMessage('');
    try {
      const {worksheet}=await request('/api/admin/worksheets/'+id,{
        method:'PATCH',body:JSON.stringify({
          ...row,status:status||row.status,
          tags:tags.split(',').map(s=>s.trim()).filter(Boolean)
        })
      });
      setRow(worksheet);setTags((worksheet.tags||[]).join(', '));setMessage('Worksheet saved successfully.');
    }catch(e){setError(e instanceof Error?e.message:'Could not save worksheet.');}
    finally{setSaving(false);}
  }
  async function duplicate(){
    if(!row || saving)return;setSaving(true);setMessage('');setError('');
    try {
      const {worksheet}=await request('/api/admin/worksheets',{method:'POST',body:JSON.stringify({
        ...row,title:row.title+' (Copy)',status:'draft',tags:tags.split(',').map(s=>s.trim()).filter(Boolean)
      })});
      router.push('/admin/worksheets/'+worksheet.id);
    } catch(e){setError(e instanceof Error?e.message:'Unable to duplicate worksheet');setSaving(false);}
  }
  if(loading)return <div className="container admin-loading">Loading private worksheet editor…</div>;
  if(!row)return <div className="container inner-page"><p role="alert">{error||'Worksheet not found.'}</p><Link href="/admin">Back to dashboard</Link></div>;
  const locked=!['draft','archived'].includes(row.status);
  return <section className="admin-area"><div className="container">
    <Link className="back-link" href="/admin"><ArrowLeft size={16}/> Back to dashboard</Link>
    <div className="admin-topbar"><div><div className="section-kicker">ADMIN / WORKSHEET EDITOR</div><h1>Edit <em>worksheet.</em></h1><p>Manage content, educational metadata, search appearance and lifecycle.</p></div><span className={'admin-status '+row.status}>{row.status}</span></div>
    {locked&&<p className="admin-safety"><Lock size={17}/> This worksheet is locked. Published content requires a review workflow to change.</p>}
    {error&&<p className="admin-alert error" role="alert"><AlertCircle size={17}/>{error}</p>}
    {message&&<p className="admin-alert good" role="status"><CheckCircle2 size={17}/>{message}</p>}
    <div className="editor-meta"><span>Private ID: {row.id}</span><span>Slug: {row.slug}</span><span>Updated: {new Date(row.updated_at).toLocaleString()}</span></div>
    <form className="worksheet-editor-layout" onSubmit={e=>save(e)}>
      <div className="worksheet-editor-main">
        <div className="worksheet-editor-panel"><h2><BookOpen size={21}/> Worksheet details</h2>
          <label htmlFor="edit-title">Title *</label><input id="edit-title" required minLength={3} maxLength={140} disabled={locked} value={row.title} onChange={e=>setRow({...row,title:e.target.value})}/>
          <label htmlFor="edit-summary">Short summary</label><textarea id="edit-summary" maxLength={700} rows={3} disabled={locked} value={row.summary||''} onChange={e=>setRow({...row,summary:e.target.value})}/>
          <label htmlFor="edit-description">Full description and learning objectives</label><textarea id="edit-description" maxLength={8000} rows={7} disabled={locked} value={row.description||''} onChange={e=>setRow({...row,description:e.target.value})}/>
          <div className="editor-two"><div><label htmlFor="edit-category">Subject *</label><select id="edit-category" disabled={locked} value={row.category_id} onChange={e=>setRow({...row,category_id:e.target.value})}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="edit-grade">Grade</label><select id="edit-grade" disabled={locked} value={row.grade_id||''} onChange={e=>setRow({...row,grade_id:e.target.value||null})}><option value="">All grades</option>{grades.map(g=><option key={g.id} value={g.id}>{g.display_name}</option>)}</select></div></div>
          <div className="editor-two"><div><label htmlFor="edit-difficulty">Difficulty</label><select id="edit-difficulty" disabled={locked} value={row.difficulty||''} onChange={e=>setRow({...row,difficulty:e.target.value||null})}><option value="">Not specified</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
          <div><label htmlFor="edit-language">Worksheet language</label><input id="edit-language" maxLength={6} disabled={locked} value={row.language} onChange={e=>setRow({...row,language:e.target.value})} placeholder="en"/></div></div>
          <label htmlFor="edit-tags">Keywords / skills (comma-separated, up to 12)</label><input id="edit-tags" disabled={locked} value={tags} onChange={e=>setTags(e.target.value)} placeholder="addition, numbers, practice"/>
          <label className="check-field"><input type="checkbox" disabled={locked} checked={row.featured} onChange={e=>setRow({...row,featured:e.target.checked})}/> Mark as featured once published</label>
        </div>
        <div className="worksheet-editor-panel"><h2>SEO and search appearance</h2>
          <label htmlFor="edit-seo-title">SEO title (up to 70 characters)</label><input id="edit-seo-title" maxLength={70} disabled={locked} value={row.seo_title||''} onChange={e=>setRow({...row,seo_title:e.target.value})}/>
          <label htmlFor="edit-seo-desc">Meta description (up to 180 characters)</label><textarea id="edit-seo-desc" maxLength={180} rows={3} disabled={locked} value={row.seo_description||''} onChange={e=>setRow({...row,seo_description:e.target.value})}/>
          <div className="seo-preview"><span>Search preview · Not indexable until published</span><strong>{row.seo_title||row.title||'Worksheet title'}</strong><small>worksheetstudio / worksheets / {row.slug}</small><p>{row.seo_description||row.summary||'Add a short description to explain the learning goals.'}</p></div>
        </div>
      </div>
      <aside className="worksheet-editor-side">
        <div className="worksheet-editor-panel"><h2>Manage worksheet</h2>
          <p>Save changes to your private draft. Creating, editing and archiving records never makes a worksheet publicly downloadable.</p>
          <button className="button button-dark admin-submit" type="submit" disabled={locked||saving}><Save size={17}/>{saving?'Saving…':'Save changes'}</button>
          <button className="button button-outline admin-submit" type="button" onClick={duplicate} disabled={saving}><CopyPlus size={17}/> Duplicate as draft</button>
          {row.status==='draft'&&<button className="button button-outline admin-submit" type="button" disabled={saving} onClick={()=>save(undefined,'archived')}><Archive size={17}/> Archive draft</button>}
          {row.status==='archived'&&<button className="button button-outline admin-submit" type="button" disabled={saving} onClick={()=>save(undefined,'draft')}><ArchiveRestore size={17}/> Restore draft</button>}
        </div>
        <AdminFileManager id={id} status={row.status} session={session}
 onStatusChanged={status=>setRow(current=>current?{...current,status}:current)}/>
      </aside>
    </form>
  </div></section>;
}
