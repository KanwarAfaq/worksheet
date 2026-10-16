'use client';
import { useEffect, useState, type FormEvent } from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import {
  BookOpen, LayoutDashboard, LogOut, LockKeyhole, ShieldCheck, FileText,
  Plus, Clock3, AlertCircle, CheckCircle2, ArrowRight, RefreshCcw, Pencil, Search, Trash2
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import AdminQuickUpload from '@/components/admin-quick-upload';

type WorksheetRow = {
  id: string; title: string; slug: string; summary: string | null;
  status: string; created_at: string; category_id: string; grade_id: string | null; file_count?:number;
};
type Option = { id: string; name?: string; display_name?: string };
type Alert = { error?: string; info?: string };
const accountEmail = 'kmafaq2@gmail.com';

async function ownerFetch(session: Session, init?: RequestInit) {
  return fetch('/api/admin/worksheets', {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + session.access_token,
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });
}

export default function AdminConsole() {
  const router=useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<'owner' | 'denied' | null>(null);
  const [email, setEmail] = useState(accountEmail);
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<Alert>({});
  const [authBusy, setAuthBusy] = useState(false);
  const [rows, setRows] = useState<WorksheetRow[]>([]);
  const [rowQuery, setRowQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<Option[]>([]);
  const [grades, setGrades] = useState<Option[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [metrics,setMetrics] = useState<Record<string,number|null>|null>(null);
  const [diagnostics,setDiagnostics] = useState<Record<string,{ok?:boolean;httpStatus?:number;reason?:string;model?:string}>|null>(null);
  const [testing,setTesting] = useState(false);
  const [agentRunning,setAgentRunning] = useState(false);
  const [agentStep,setAgentStep] = useState(0);
  const [agentReports,setAgentReports] = useState<Array<{slot:number;status:'created'|'existing'|'failed';id?:string;error?:string}>>([]);

  const [creating, setCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSummary, setDraftSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [gradeId, setGradeId] = useState('');

  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (mounted) { setSession(session); setChecking(false); }
    });
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, next) => {
      if (mounted) { setSession(next); setChecking(false); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); setRows([]); return; }
    let cancelled = false;
    const check = async () => {
      setRole(null);
      const { data, error } = await supabaseBrowser.from('admin_profiles')
        .select('role,enabled').eq('user_id', session.user.id).maybeSingle();
      if (cancelled) return;
      if (error || !data?.enabled || data.role !== 'owner') {
        setRole('denied'); return;
      }
      setRole('owner');
      const [cats, level] = await Promise.all([
        supabaseBrowser.from('categories').select('id,name').eq('status', 'active').order('sort_order'),
        supabaseBrowser.from('grades').select('id,display_name').order('sort_order')
      ]);
      if (cancelled) return;
      setCategories(cats.data || []); setGrades(level.data || []);
      if (cats.data?.length) setCategoryId(old => old || cats.data![0].id);
      await loadRows(session);
      void fetch('/api/admin/stats',{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'}).then(x=>x.ok?x.json():null).then(x=>{if(!cancelled&&x?.stats)setMetrics(x.stats);}).catch(()=>{});
    };
    void check();
    return () => { cancelled = true; };
  // React to the authenticated user's identity, not to token refresh frequency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  async function loadRows(current: Session) {
    setLoadingRows(true);
    try {
      const res = await ownerFetch(current);
      const json = await res.json();
      if (!res.ok) { setNotice({ error: json.error || 'Could not load drafts.' }); return; }
      setRows(json.worksheets || []);
    } catch { setNotice({ error: 'Unable to reach the admin API.' }); }
    finally { setLoadingRows(false); }
  }

  async function deleteDraft(row:WorksheetRow){
    if(!session||row.status!=='draft')return;
    if(!window.confirm('Delete draft and all attached private files? '+row.title))return;
    setNotice({});
    try{
     const res=await fetch('/api/admin/worksheets/'+row.id,
      {method:'DELETE',headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
     const result=await res.json();
     if(!res.ok)throw new Error(result.error||'Delete failed');
     setNotice({info:result.cleanupPending?'Draft deleted; private file cleanup queued.':'Draft deleted.'});
     await loadRows(session);
    }catch(e){setNotice({error:e instanceof Error?e.message:'Delete failed.'});}
  }

  async function rejectAiDraft(id:string,title:string){
    if(!session||!window.confirm('Permanently delete AI draft and its files? '+title))return;
    setNotice({});
    try{
      const res=await fetch('/api/admin/worksheets/'+id+'/reject',{method:'DELETE',headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Rejection failed');
      setNotice({info:'AI draft deleted. Audit event recorded.'});
      await loadRows(session);
    }catch(e){setNotice({error:e instanceof Error?e.message:'Rejection failed'});}
  }

  async function runFiveAiDrafts(){
    if(!session||agentRunning)return;
    if(!window.confirm('Create up to 5 private AI worksheet PDFs for review? This uses real AI API quota and R2 storage. Nothing will be published.'))return;
    setAgentRunning(true);setAgentStep(0);setAgentReports([]);setNotice({});
    const results:Array<{slot:number;status:'created'|'existing'|'failed';id?:string;error?:string}>=[];
    try{
     for(let slot=1;slot<=5;slot++){
      setAgentStep(slot);
      try{
       const response=await fetch('/api/admin/automation/test',{
        method:'POST',cache:'no-store',
        headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
        body:JSON.stringify({slot})
       });
       const data=await response.json();
       const report=data.generated as {created?:number;skipped?:number;failed?:number;ids?:string[];errors?:string[]} | undefined;
       const error=(!response.ok?data.error:report?.errors?.[0]) as string|undefined;
       results.push({slot,status:report?.created?'created':report?.skipped?'existing':'failed',
        id:report?.ids?.[0],error:error||undefined});
      }catch{
       results.push({slot,status:'failed',error:'Request timed out or could not reach Vercel.'});
      }
      setAgentReports([...results]);
     }
     await loadRows(session);
     setStatusFilter('draft');
     setRowQuery('Practice');
    }finally{setAgentRunning(false);}
  }

  async function testProduction(scope:'all'|'ai'='all'){
    if(!session||testing)return;
    setTesting(true);setNotice({});
    try{
      const response=await fetch('/api/admin/diagnostics'+(scope==='ai'?'?scope=ai':''),{method:'POST',headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Diagnostics failed');
      setDiagnostics(data.checks);
    }catch(e){setNotice({error:e instanceof Error?e.message:'Diagnostics failed'});}
    finally{setTesting(false);}
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAuthBusy(true); setNotice({});
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setNotice({ error: error.message });
    setPassword(''); setAuthBusy(false);
  }

  async function sendReset() {
    setAuthBusy(true); setNotice({});
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/admin/reset-password'
    });
    setNotice(error
      ? { error: error.message }
      : { info: 'If this address has an account, password reset instructions have been sent. Check your inbox.' });
    setAuthBusy(false);
  }

  async function createDraft() {
    if (!session || role!=='owner' || creating)return;
    if(!categories.length){setNotice({error:'Please wait until categories load.'});return;}
    setCreating(true);setNotice({});
    try{
      const response=await ownerFetch(session,{method:'POST',body:JSON.stringify({
        title:'Untitled worksheet',summary:'',category_id:categories[0].id,grade_id:null
      })});
      const json=await response.json();
      if(!response.ok)throw new Error(json.error||'Cannot create draft.');
      router.push('/admin/worksheets/'+json.worksheet.id);
    }catch(e){setNotice({error:e instanceof Error?e.message:'Could not create draft.'});setCreating(false);}
  }

  if (checking) return <div className="container admin-loading"><RefreshCcw className="admin-spin" /> Checking admin session…</div>;
  if (!session) return <section className="admin-auth"><div className="admin-login">
    <div className="admin-login-brand"><span className="brand-icon"><BookOpen size={20}/></span> worksheet<span>studio.</span></div>
    <div className="admin-login-symbol"><LockKeyhole size={26}/></div>
    <p className="section-kicker">OWNER ACCESS ONLY</p>
    <h1>Welcome <em>back.</em></h1>
    <p>Sign in to manage your worksheet library. Administrator accounts are invite-only.</p>
    <form onSubmit={signIn}>
      <label htmlFor="admin-email">Email address</label>
      <input id="admin-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required />
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required />
      {notice.error&&<p role="alert" className="admin-alert error"><AlertCircle size={17}/>{notice.error}</p>}
      {notice.info&&<p role="status" className="admin-alert good"><CheckCircle2 size={17}/>{notice.info}</p>}
      <button className="button button-dark admin-submit" type="submit" disabled={authBusy}>{authBusy?'Signing in…':'Sign in'} <ArrowRight size={16}/></button>
    </form>
    <button className="admin-reset-link" type="button" onClick={sendReset} disabled={authBusy}>Forgot your password?</button>
    <p className="admin-footnote"><ShieldCheck size={15}/> Protected with Supabase Authentication and database policies.</p>
  </div></section>;

  if (role === null) return <div className="container admin-loading"><RefreshCcw className="admin-spin"/> Verifying administrator permissions…</div>;
  if (role === 'denied') return <div className="container admin-denied"><LockKeyhole size={35}/>
    <h1>Access restricted</h1>
    <p>Your account does not have an enabled owner role for this project.</p>
    <button className="button button-outline" onClick={()=>supabaseBrowser.auth.signOut()}>Sign out</button>
  </div>;

  const visibleRows = rows.filter(row => (statusFilter === 'all' || row.status === statusFilter) &&
    (row.title + ' ' + row.slug).toLowerCase().includes(rowQuery.toLowerCase()));
  const published = rows.filter(row=>row.status==='published').length;
  const drafts = rows.filter(row=>row.status==='draft').length;
  const reviewCount=rows.filter(row=>row.status==='review').length;
  const archivedCount=rows.filter(row=>row.status==='archived').length;
  return <div className="admin-area"><div className="container">
    <div className="admin-topbar"><div><div className="section-kicker">WORKSHEET STUDIO / ADMIN</div><h1>Your <em>worksheets.</em></h1><p>Manage drafts and published worksheets · Signed in as {session.user.email}</p></div>
      <button onClick={()=>supabaseBrowser.auth.signOut()} type="button" className="button button-outline"><LogOut size={16}/> Sign out</button></div>
    <div className="admin-stats">
      <div><LayoutDashboard size={22}/><small>Total worksheets</small><strong>{rows.length}</strong></div>
      <div><Clock3 size={22}/><small>Unpublished drafts</small><strong>{drafts}</strong></div>
      <div><FileText size={22}/><small>Published</small><strong>{published}</strong></div>
      <div><ShieldCheck size={22}/><small>Needs review</small><strong>{reviewCount}</strong></div>
    </div>
    {metrics&&<div className="admin-stats" aria-label="Live system metrics"><div><BookOpen size={22}/><small>Registered users</small><strong>{metrics.users??"—"}</strong></div><div><FileText size={22}/><small>Verified PDF files</small><strong>{metrics.pdfFiles??"—"}</strong></div><div><LayoutDashboard size={22}/><small>Verified image files</small><strong>{metrics.imageFiles??"—"}</strong></div><div><Clock3 size={22}/><small>All private drafts</small><strong>{metrics.drafts??"—"}</strong></div></div>}
    <section className="admin-safety"><ShieldCheck size={22}/><div><strong>Production integration diagnostics</strong><p>Test CGU, Groq, NVIDIA, private R2 upload/read/delete, and send a test LINE message. Only the signed-in owner can start these checks.</p><button type="button" className="button button-outline" onClick={()=>testProduction('all')} disabled={testing}>{testing?'Testing integrations…':'Run production tests'}</button>
 <button type="button" className="button button-outline" onClick={()=>testProduction('ai')} disabled={testing}>Retest AI only</button>{diagnostics&&<div role="status">{Object.entries(diagnostics).map(([name,value])=><p key={name}><strong>{name}:</strong> {value.ok?'PASS':'FAIL'}{value.httpStatus?' (HTTP '+value.httpStatus+')':''}{value.model?' — '+value.model:''}{value.reason?' — '+value.reason:''}</p>)}</div>}</div></section>
    <section className="admin-agent-test" aria-label="Five AI worksheet test">
      <div>
       <h2>AI worksheet test</h2>
       <p>Create five private PDF drafts and review them before publishing.</p>
      </div>
      <button className="button button-dark" type="button" disabled={agentRunning}
       onClick={runFiveAiDrafts}>
       {agentRunning?'Generating '+agentStep+' / 5…':'Run 5 AI worksheet test'}
      </button>
      {agentReports.length>0&&<div className="admin-agent-results" role="status">
       {agentReports.map(report=><div key={report.slot} className="admin-agent-result">
        <strong>{report.slot}/5 — {report.status==='created'?'Created':report.status==='existing'?'Already exists':'Failed'}</strong>
        {report.id&&<Link href={'/admin/worksheets/'+report.id+'?review=1'}>Review PDF <ArrowRight size={15}/></Link>}
        {report.error&&<small>{report.error}</small>}
       </div>)}
       {!agentRunning&&<p>Finished. Open a draft below to preview its PDF. Nothing was published.</p>}
      </div>}
    </section>
    <div className="admin-quick-actions" aria-label="Admin quick filters">
     <button type="button" onClick={()=>setStatusFilter('review')}>Review queue <strong>{reviewCount}</strong></button>
     <button type="button" onClick={()=>setStatusFilter('draft')}>Drafts <strong>{drafts}</strong></button>
     <button type="button" onClick={()=>setStatusFilter('published')}>Published <strong>{published}</strong></button>
     <button type="button" onClick={()=>setStatusFilter('archived')}>Archived <strong>{archivedCount}</strong></button>
     <button type="button" onClick={()=>setStatusFilter('all')}>All records <strong>{rows.length}</strong></button>
     <Link href="/create/templates" className="admin-quick-create">Create printable template <ArrowRight size={16}/></Link>
    </div>
    <div className="admin-safety"><ShieldCheck size={22}/><div><strong>One workflow for admin and community</strong><p>Create original worksheets in a draft or review community submissions. Files remain private until the owner publishes them.</p></div></div>
    {notice.error&&<p role="alert" className="admin-alert error"><AlertCircle size={17}/>{notice.error}</p>}
    {notice.info&&<p role="status" className="admin-alert good"><CheckCircle2 size={17}/>{notice.info}</p>}
    <div className="admin-content">
      <section className="admin-list">
        <div className="admin-panel-heading"><div><h2>Worksheet manager</h2><p>Manage drafts, published work and community review submissions</p></div><button type="button" className="admin-icon-button" onClick={()=>loadRows(session)} disabled={loadingRows} aria-label="Refresh worksheets"><RefreshCcw size={18}/></button></div>
        <div className="admin-filters"><label className="admin-search"><Search size={16}/><input type="search" aria-label="Search worksheet records" value={rowQuery} onChange={e=>setRowQuery(e.target.value)} placeholder="Search by title…"/></label><select aria-label="Filter worksheet status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="archived">Archived</option><option value="published">Published</option><option value="review">Needs review</option></select></div>
        {loadingRows?<p className="admin-empty">Loading worksheet records…</p>:rows.length===0?<div className="admin-empty"><FileText size={34}/><strong>No worksheets yet</strong><p>Click “New worksheet” to start.</p></div>:
          <div className="admin-rows">{visibleRows.length === 0 ? <p className="admin-empty">No worksheets match your filters.</p> : visibleRows.map(row=><div key={row.id} className="admin-row">
            <div><strong>{row.title}</strong><small>{new Date(row.created_at).toLocaleDateString()} ·
             {row.file_count||0} file(s){row.status==='draft'&&(row.file_count||0)===0?' · Upload incomplete':''}</small></div>
            <div className="admin-row-actions">
             <span className={'admin-status '+row.status}>{row.status}</span>
             <a href={'/admin/worksheets/'+row.id} className="admin-edit-link"><Pencil size={14}/> Review / Open</a>
             {row.status==='draft'&&
               (row.slug.startsWith('daily-ai-')?
                <button type="button" className="draft-delete-button" onClick={()=>rejectAiDraft(row.id,row.title)}>
                 <Trash2 size={16}/> Reject &amp; delete</button>:
                <button type="button" className="draft-delete-button" onClick={()=>deleteDraft(row)}>
                 <Trash2 size={16}/> Delete draft</button>)}
            </div>
          </div>)}</div>}
      </section>
      <div>
       <AdminQuickUpload session={session} categories={categories} grades={grades}/>
       <button type="button" className="button button-outline admin-advanced-draft"
        onClick={createDraft} disabled={creating||!categories.length}>
        <Plus size={16}/> {creating?'Creating…':'Start an empty draft'}
       </button>
      </div>
    </div>
  </div></div>;
}
