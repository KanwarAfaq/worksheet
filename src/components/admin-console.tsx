'use client';
import { useEffect, useState, type FormEvent } from 'react';
import {useRouter} from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import {
  BookOpen, LayoutDashboard, LogOut, LockKeyhole, ShieldCheck, FileText,
  Plus, Clock3, AlertCircle, CheckCircle2, ArrowRight, RefreshCcw, Pencil, Search
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type WorksheetRow = {
  id: string; title: string; slug: string; summary: string | null;
  status: string; created_at: string; category_id: string; grade_id: string | null;
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
  return <div className="admin-area"><div className="container">
    <div className="admin-topbar"><div><div className="section-kicker">WORKSHEET STUDIO / ADMIN</div><h1>Your <em>worksheets.</em></h1><p>Manage drafts and published worksheets · Signed in as {session.user.email}</p></div>
      <button onClick={()=>supabaseBrowser.auth.signOut()} type="button" className="button button-outline"><LogOut size={16}/> Sign out</button></div>
    <div className="admin-stats">
      <div><LayoutDashboard size={22}/><small>Total worksheets</small><strong>{rows.length}</strong></div>
      <div><Clock3 size={22}/><small>Unpublished drafts</small><strong>{drafts}</strong></div>
      <div><FileText size={22}/><small>Published</small><strong>{published}</strong></div>
      <div><ShieldCheck size={22}/><small>Account</small><strong className="admin-owner-label">Owner</strong></div>
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
            <div><strong>{row.title}</strong><small>{row.slug} · {new Date(row.created_at).toLocaleDateString()}</small></div>
            <div className="admin-row-actions"><span className={'admin-status '+row.status}>{row.status}</span><a href={'/admin/worksheets/'+row.id} className="admin-edit-link"><Pencil size={14}/> Open</a></div>
          </div>)}</div>}
      </section>
      <section className="admin-new-draft dashboard-create-card">
        <div className="dashboard-create-icon"><Plus size={31}/></div>
        <h2>Create a worksheet</h2>
        <p>Start with a private draft and finish it on one guided page.</p>
        <div className="dashboard-flow-mini"><span>1. Upload</span><span>2. Metadata</span><span>3. Preview & publish</span></div>
        <button type="button" className="button button-dark admin-submit" onClick={createDraft} disabled={creating||!categories.length}>
          <Plus size={17}/>{creating?'Creating…':'New worksheet'}
        </button>
        <small>Your draft is saved even if you leave before publishing.</small>
      </section>
    </div>
  </div></div>;
}
