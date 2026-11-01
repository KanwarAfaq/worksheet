'use client';
import { useEffect, useState, type FormEvent } from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import {
  BookOpen, LayoutDashboard, LogOut, LockKeyhole, ShieldCheck, FileText,
  Plus, Clock3, AlertCircle, CheckCircle2, ArrowRight, RefreshCcw, Pencil, Search, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import AdminQuickUpload from '@/components/admin-quick-upload';
import AdminBulkTools from '@/components/admin-bulk-tools';

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
  const [activeTab,setActiveTab]=useState<'overview'|'worksheets'|'agent'|'system'>('overview');
  const [selected,setSelected]=useState<string[]>([]);
  const [rowQuery, setRowQuery] = useState('');
  const [listPage,setListPage]=useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categories, setCategories] = useState<Option[]>([]);
  const [grades, setGrades] = useState<Option[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [metrics,setMetrics] = useState<Record<string,number|null>|null>(null);
  const [diagnostics,setDiagnostics] = useState<Record<string,{ok?:boolean;httpStatus?:number;reason?:string;model?:string}>|null>(null);
  const [testing,setTesting] = useState(false);
  const [seo,setSeo]=useState<{origin:string;indexable:boolean;published:number;sitemap:string;robots:string;warnings:string[]}|null>(null);
  const [agentRunning,setAgentRunning] = useState(false);
  const [agentStep,setAgentStep] = useState(0);
  const [agentTotal,setAgentTotal] = useState(5);
  const [agentSubjects,setAgentSubjects] = useState({math:2,reading:2,colors:1});
  const [agentGrade,setAgentGrade] = useState(2);
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
      void fetch('/api/admin/seo-status',{headers:{Authorization:'Bearer '+session.access_token},
       cache:'no-store'}).then(response=>response.ok?response.json():null)
       .then(value=>{if(!cancelled&&value)setSeo(value);}).catch(()=>{});
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
    if(!session)return;
    if(!window.confirm('Remove "'+row.title+'"? '+
      (row.status==='published'?'This removes it from the PUBLIC library. ':'')+
      'Private file deletion will be queued. This cannot be undone.'))return;
    setNotice({});
    try{
     const res=await fetch('/api/admin/worksheets/'+row.id,
      {method:'DELETE',headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
     const result=await res.json();
     if(!res.ok)throw new Error(result.error||'Delete failed');
     setNotice({info:result.cleanupPending?'Worksheet removed; R2 cleanup queued.':'Worksheet removed.'});
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

  async function runFiveAiDrafts(manual=false){
    if(!session||agentRunning)return;
    const total=manual?agentSubjects.math+agentSubjects.reading+agentSubjects.colors:5;
    if(total<1||total>10){setNotice({error:'Choose 1–10 worksheets in total.'});return;}
    if(!window.confirm('Create '+total+' PRIVATE illustrated worksheets and teacher keys? They require owner review before publishing.'))return;
    const jobs=manual?([
      ...Array.from({length:agentSubjects.reading},()=> 'reading' as const),
      ...Array.from({length:agentSubjects.colors},()=> 'colors' as const),
      ...Array.from({length:agentSubjects.math},()=> 'math' as const)
    ]):(['math','reading','colors','math','reading'] as const);
    setAgentRunning(true);setAgentStep(0);setAgentTotal(total);setAgentReports([]);setNotice({});
    const results:Array<{slot:number;status:'created'|'existing'|'failed';id?:string;error?:string}>=[];
    try{
     for(const [index,subject] of jobs.entries()){
      const slot=index%5+1;
      setAgentStep(index+1);
      try{
       const response=await fetch('/api/admin/automation/test',{
        method:'POST',cache:'no-store',
        headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},
        body:JSON.stringify({slot,...(manual?{
          subject,grade:agentGrade,requestId:crypto.randomUUID()
         }:{})})
       });
       const data=await response.json();
       const report=data.generated as {created?:number;skipped?:number;failed?:number;ids?:string[];errors?:string[]} | undefined;
       const error=(!response.ok?data.error:report?.errors?.[0]) as string|undefined;
       results.push({slot:index+1,status:report?.created?'created':report?.skipped?'existing':'failed',
        id:report?.ids?.[0],error:(manual?subject+': ':'')+(error||'')});
      }catch{
       results.push({slot:index+1,status:'failed',error:subject+': request timed out'});
      }
      setAgentReports([...results]);
     }
     await loadRows(session);
     setStatusFilter('review');
     setRowQuery('');
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

  const visibleRows = rows.filter(row => (statusFilter === 'all' || row.status === statusFilter ||
    (statusFilter==='review'&&row.status==='draft'&&
     (row.slug.startsWith('daily-ai-')||row.slug.startsWith('manual-ai-')))) &&
    (row.title + ' ' + row.slug).toLowerCase().includes(rowQuery.toLowerCase()));
  const listPages=Math.max(1,Math.ceil(visibleRows.length/12));
  const activeListPage=Math.min(listPage,listPages);
  const currentRows=visibleRows.slice((activeListPage-1)*12,activeListPage*12);
  const pagination=<nav className="admin-list-pagination" aria-label="Admin worksheet pages">
    <span>{visibleRows.length?((activeListPage-1)*12+1)+'–'+Math.min(activeListPage*12,visibleRows.length):'0'} of {visibleRows.length}</span>
    <div className="admin-list-pagination-pages">
      <button type="button" disabled={activeListPage<=1} aria-label="Previous page"
       onClick={()=>setListPage(activeListPage-1)}><ChevronLeft size={18}/></button>
      {Array.from({length:listPages},(_,i)=>i+1).filter(p=>listPages<=7||p===1||p===listPages||Math.abs(p-activeListPage)<=1)
       .map((p,i,arr)=><span key={p}>
        {i>0&&p>arr[i-1]+1&&<span className="admin-page-ellipsis">…</span>}
        <button type="button" onClick={()=>setListPage(p)} aria-current={activeListPage===p?'page':undefined}
         className={activeListPage===p?'current':''}>{p}</button>
       </span>)}
      <button type="button" disabled={activeListPage>=listPages} aria-label="Next page"
       onClick={()=>setListPage(activeListPage+1)}><ChevronRight size={18}/></button>
    </div>
  </nav>;
  const published = rows.filter(row=>row.status==='published').length;
  const drafts = rows.filter(row=>row.status==='draft').length;
  const reviewCount=rows.filter(row=>row.status==='review'||(row.status==='draft'&&row.slug.startsWith('daily-ai-'))||
    (row.status==='draft'&&row.slug.startsWith('manual-ai-'))).length;
  const archivedCount=rows.filter(row=>row.status==='archived').length;
  return <div className="admin-area"><div className="container">
    <div className="admin-topbar"><div><div className="section-kicker">WORKSHEET STUDIO / ADMIN</div><h1>Your <em>worksheets.</em></h1><p>{session.user.email}</p></div>
      <button onClick={()=>supabaseBrowser.auth.signOut()} type="button" className="button button-outline"><LogOut size={16}/> Sign out</button></div>
    <nav className="admin-dashboard-tabs" aria-label="Admin sections">
     {([
      ['overview','Overview',LayoutDashboard],
      ['worksheets','Worksheets',FileText],
      ['agent','AI Agent',BookOpen],
      ['system','System',ShieldCheck]
     ] as const).map(([key,label,Icon])=>
      <button type="button" key={key} className={activeTab===key?'active':''}
       aria-current={activeTab===key?'page':undefined}
       onClick={()=>setActiveTab(key)}><Icon size={18}/>{label}</button>)}
    </nav>
    {activeTab==='overview'&&<>
    <div className="admin-stats">
      <div><LayoutDashboard size={22}/><small>Total worksheets</small><strong>{rows.length}</strong></div>
      <div><Clock3 size={22}/><small>Unpublished drafts</small><strong>{drafts}</strong></div>
      <div><FileText size={22}/><small>Published</small><strong>{published}</strong></div>
      <div><ShieldCheck size={22}/><small>Needs review</small><strong>{reviewCount}</strong></div>
    </div>
    {metrics&&<div className="admin-stats" aria-label="Live system metrics"><div><BookOpen size={22}/><small>Registered users</small><strong>{metrics.users??"—"}</strong></div><div><FileText size={22}/><small>Verified PDF files</small><strong>{metrics.pdfFiles??"—"}</strong></div><div><LayoutDashboard size={22}/><small>Verified image files</small><strong>{metrics.imageFiles??"—"}</strong></div><div><Clock3 size={22}/><small>All private drafts</small><strong>{metrics.drafts??"—"}</strong></div></div>}
    </>}
    {activeTab==='system'&&<>
    <section className="admin-seo-panel" aria-label="Search and SEO configuration">
     <div><strong>SEO & search</strong><span>{seo?.indexable?'Indexing ready':'Indexing needs attention'}</span></div>
     <div><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">Sitemap</a>
      <a href="/robots.txt" target="_blank" rel="noopener noreferrer">Robots</a>
      <a href="/worksheets" target="_blank" rel="noopener noreferrer">Test search</a></div>
     {seo?.warnings?.length?<small>{seo.warnings.join(' ')}</small>:
      <small>{seo?seo.published+' published worksheets · '+seo.origin:'Checking indexing…'}</small>}
    </section>
    <section className="admin-safety"><ShieldCheck size={22}/><div><strong>Production integration diagnostics</strong><p>Test CGU, Groq, NVIDIA, private R2 upload/read/delete, and send a test LINE message. Only the signed-in owner can start these checks.</p><button type="button" className="button button-outline" onClick={()=>testProduction('all')} disabled={testing}>{testing?'Testing integrations…':'Run production tests'}</button>
 <button type="button" className="button button-outline" onClick={()=>testProduction('ai')} disabled={testing}>Retest AI only</button>{diagnostics&&<div role="status">{Object.entries(diagnostics).map(([name,value])=><p key={name}><strong>{name}:</strong> {value.ok?'PASS':'FAIL'}{value.httpStatus?' (HTTP '+value.httpStatus+')':''}{value.model?' — '+value.model:''}{value.reason?' — '+value.reason:''}</p>)}</div>}</div></section>
    </>}
    {activeTab==='agent'&&<>
    <section className="admin-agent-test" aria-label="AI worksheet generator">
      <div className="admin-agent-intro"><h2>AI worksheet agent</h2>
       <p>Create illustrated PDF drafts. Review before publishing.</p></div>
      <div className="agent-count-selector" aria-label="Choose subject counts">
       {([
        {name:'Math',key:'math' as const},
        {name:'English',key:'reading' as const},
        {name:'Color',key:'colors' as const}
       ]).map(subject=><label key={subject.key}>{subject.name}
        <input type="number" min="0" max="10" value={agentSubjects[subject.key]}
         onChange={e=>setAgentSubjects(old=>({...old,[subject.key]:Math.min(10,Math.max(0,Number(e.target.value)||0))}))}
         disabled={agentRunning}/></label>)}
       <label>Grade<select value={agentGrade} disabled={agentRunning}
         onChange={e=>setAgentGrade(Number(e.target.value))}>
         {[1,2,3,4,5,6].map(n=><option key={n} value={n}>Grade {n}</option>)}
       </select></label>
       <button className="button button-dark" type="button"
        disabled={agentRunning||!Object.values(agentSubjects).some(n=>n>0)||
          Object.values(agentSubjects).reduce((sum,n)=>sum+n,0)>10}
        onClick={()=>runFiveAiDrafts(true)}>{agentRunning?
          'Generating '+agentStep+'/'+agentTotal+'…':'Generate '+Object.values(agentSubjects).reduce((s,n)=>s+n,0)+' drafts'}
       </button>
      </div>
      <details className="agent-default-test"><summary>Daily default: 5 worksheets</summary>
       <button className="button button-outline" type="button" disabled={agentRunning}
        onClick={()=>runFiveAiDrafts(false)}>Test standard 5 worksheets</button>
      </details>
      {agentReports.length>0&&<div className="admin-agent-results" role="status">
       {agentReports.map(report=><div key={report.slot} className="admin-agent-result">
        <strong>{report.slot}/{agentTotal} — {report.status==='created'?'Created':report.status==='existing'?'Existing':'Failed'}</strong>
        {report.id&&<Link href={'/admin/worksheets/'+report.id+'?review=1'}>Preview PDF <ArrowRight size={15}/></Link>}
        {report.error&&<small>{report.error}</small>}
       </div>)}
      </div>}
    </section>
    </>}
    {activeTab==='overview'&&<>
    <div className="admin-quick-actions" aria-label="Admin quick filters">
     <button type="button" onClick={()=>{setStatusFilter('review');setActiveTab('worksheets');}}>Review queue <strong>{reviewCount}</strong></button>
     <button type="button" onClick={()=>{setStatusFilter('draft');setActiveTab('worksheets');}}>Drafts <strong>{drafts}</strong></button>
     <button type="button" onClick={()=>{setStatusFilter('published');setActiveTab('worksheets');}}>Published <strong>{published}</strong></button>
     <button type="button" onClick={()=>{setStatusFilter('archived');setActiveTab('worksheets');}}>Archived <strong>{archivedCount}</strong></button>
     <button type="button" onClick={()=>{setStatusFilter('all');setActiveTab('worksheets');}}>All records <strong>{rows.length}</strong></button>
     <Link href="/create/templates" className="admin-quick-create">Create printable template <ArrowRight size={16}/></Link>
    </div>
    </>}
    {notice.error&&<p role="alert" className="admin-alert error"><AlertCircle size={17}/>{notice.error}</p>}
    {notice.info&&<p role="status" className="admin-alert good"><CheckCircle2 size={17}/>{notice.info}</p>}
    {activeTab==='worksheets'&&<>
    <AdminBulkTools session={session} categories={categories} grades={grades}
     rows={rows} selected={selected} onClear={()=>setSelected([])} onChange={()=>void loadRows(session)}/>
    <div className="admin-content">
      <section className="admin-list">
        <div className="admin-panel-heading"><div><h2>Worksheet manager</h2></div><button type="button" className="admin-icon-button" onClick={()=>loadRows(session)} disabled={loadingRows} aria-label="Refresh worksheets"><RefreshCcw size={18}/></button></div>
        <div className="admin-filters"><label className="admin-search"><Search size={16}/><input type="search" aria-label="Search worksheet records" value={rowQuery} onChange={e=>{setRowQuery(e.target.value);setListPage(1);}} placeholder="Search by title…"/></label><select aria-label="Filter worksheet status" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setListPage(1);}}><option value="all">All statuses</option><option value="draft">Draft</option><option value="archived">Archived</option><option value="published">Published</option><option value="review">Needs review</option></select></div>
        <div className="admin-select-all"><label><input type="checkbox" checked={currentRows.length>0&&currentRows.every(x=>selected.includes(x.id))}
         onChange={e=>setSelected(e.target.checked?[...new Set([...selected,...currentRows.map(x=>x.id)])]:
          selected.filter(id=>!currentRows.some(row=>row.id===id)))}/> Select visible</label>
         <small>{visibleRows.length} results · 12 per page</small></div>
        {visibleRows.length>12&&pagination}
        {loadingRows?<p className="admin-empty">Loading worksheet records…</p>:rows.length===0?<div className="admin-empty"><FileText size={34}/><strong>No worksheets yet</strong><p>Click “New worksheet” to start.</p></div>:
          <div className="admin-rows">{visibleRows.length === 0 ? <p className="admin-empty">No worksheets match your filters.</p> : currentRows.map(row=><div key={row.id} className="admin-row">
            <input type="checkbox" className="admin-row-check" aria-label={'Select '+row.title}
             checked={selected.includes(row.id)}
             onChange={e=>setSelected(previous=>e.target.checked?[...new Set([...previous,row.id])]:previous.filter(id=>id!==row.id))}/>
            <div className="admin-row-info"><strong>{row.title}</strong><small>{new Date(row.created_at).toLocaleDateString()} ·
             {row.file_count||0} file(s){row.status==='draft'&&(row.file_count||0)===0?' · Upload incomplete':''}</small></div>
            <div className="admin-row-actions">
             <span className={'admin-status '+row.status}>{row.status}</span>
             <a href={'/admin/worksheets/'+row.id} className="admin-edit-link"><Pencil size={14}/> Review / Open</a>
             <button type="button" className="draft-delete-button" onClick={()=>deleteDraft(row)}
              aria-label={'Remove '+row.title}><Trash2 size={16}/> Delete</button>
            </div>
          </div>)}</div>}
        {visibleRows.length>12&&pagination}
      </section>
      <div>
       <AdminQuickUpload session={session} categories={categories} grades={grades}/>
       <button type="button" className="button button-outline admin-advanced-draft"
        onClick={createDraft} disabled={creating||!categories.length}>
        <Plus size={16}/> {creating?'Creating…':'Start an empty draft'}
       </button>
      </div>
    </div>
    </>}
  </div></div>;
}
