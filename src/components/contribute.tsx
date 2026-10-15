'use client';
import {useCallback,useEffect,useState,type FormEvent} from 'react';
import Link from 'next/link';
import type {Session} from '@supabase/supabase-js';
import {UploadCloud,LockKeyhole,BookOpen,FileText,Plus,CheckCircle2,AlertCircle,LogOut,ArrowLeft,ArrowRight,Download,FilePenLine,ShieldCheck} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase-browser';

type Item={id:string;slug:string;title:string;summary:string|null;status:string;category_id:string;grade_id:string|null;created_at:string};
type Category={id:string;name:string};type Grade={id:string;display_name:string};
type Attached={id:string;original_name:string;variant:string;role:string;size_bytes:number};
const root='/api/community/worksheets';
export default function Contribute(){
 const [session,setSession]=useState<Session|null>(null);
 const [initializing,setInitializing]=useState(true);
 const [tab,setTab]=useState<'signin'|'signup'>('signup');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [otp,setOtp]=useState('');const [otpPending,setOtpPending]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');const [error,setError]=useState('');
 const [items,setItems]=useState<Item[]>([]);
 const [categories,setCategories]=useState<Category[]>([]);
 const [grades,setGrades]=useState<Grade[]>([]);
 const [active,setActive]=useState<Item|null>(null);
 const [step,setStep]=useState<0|1|2>(0);
 const [file,setFile]=useState<File|null>(null);
 const [agree,setAgree]=useState(false);
 const [rightsBasis,setRightsBasis]=useState<'original'|'licensed'>('original');
 const [attachments,setAttachments]=useState<Attached[]>([]);
 const [title,setTitle]=useState('');const [summary,setSummary]=useState('');
 const [subject,setSubject]=useState('');const [grade,setGrade]=useState('');
 const [signedPolicy,setSignedPolicy]=useState(false);
 useEffect(()=>{
  let mounted=true;
  supabaseBrowser.auth.getSession().then(({data})=>{if(mounted){setSession(data.session);setInitializing(false);}});
  const {data:{subscription}}=supabaseBrowser.auth.onAuthStateChange((_event,next)=>{if(mounted){setSession(next);setInitializing(false);}});
  return()=>{mounted=false;subscription.unsubscribe();};
 },[]);
 const api=useCallback(async(path:string,init?:RequestInit)=>{
   const {data}=await supabaseBrowser.auth.getSession();
   if(!data.session)throw new Error('Please sign in.');
   const r=await fetch(path,{cache:'no-store',...init,headers:{Authorization:'Bearer '+data.session.access_token,...init?.headers}});
   const obj=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(obj.error||'Request failed.');
   return obj;
 },[]);
 const load=useCallback(async()=>{
   const result=await api(root);
   setItems(result.items||[]);
 },[api]);
 useEffect(()=>{
   let mounted=true;
   supabaseBrowser.from('categories').select('id,name').eq('status','active').order('sort_order').then(({data})=>{
     if(mounted){setCategories(data||[]);if(data?.length)setSubject(old=>old||data[0].id);}
   });
   supabaseBrowser.from('grades').select('id,display_name').order('sort_order').then(({data})=>{if(mounted)setGrades(data||[]);});
   return()=>{mounted=false;};
 },[]);
 useEffect(()=>{if(session){load().catch(e=>setError(e.message));}else{setItems([]);setActive(null);}},[session?.user.id,load]);
 async function authenticate(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   if(tab==='signup'){
    if(password.length<12)throw new Error('Use at least 12 characters for your password.');
    const {error}=await supabaseBrowser.auth.signUp({email:email.trim(),password,options:{
       emailRedirectTo:window.location.origin+'/contribute'
    }});
    if(error)throw error;
    setNotice('Registration submitted. Check your email and follow the confirmation link, then sign in.');
    setTab('signin');
   }else{
    const {error}=await supabaseBrowser.auth.signInWithPassword({email:email.trim(),password});
    if(error)throw error;
    setNotice('Signed in successfully.');
   }
   setPassword('');
  }catch(e){setError(e instanceof Error?e.message:'Authentication failed.');}
  finally{setBusy(false);}
 }
 async function googleSignIn(){
  setBusy(true);setError('');setNotice('');
  try{
   const {error}=await supabaseBrowser.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+'/contribute'}});
   if(error)throw error;
  }catch(e){setError(e instanceof Error?e.message:'Google sign-in failed.');setBusy(false);}
 }
 async function sendOtp(){
  if(!email.trim()){setError('Enter your email address first.');return;}
  setBusy(true);setError('');setNotice('');
  try{
   const {error}=await supabaseBrowser.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:false}});
   if(error)throw error;
   setOtpPending(true);setNotice('Check your email for a one-time code. Enter the code from your email below.');
  }catch(e){setError(e instanceof Error?e.message:'Could not send the sign-in code.');}
  finally{setBusy(false);}
 }
 async function verifyOtp(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');
  try{
   const {error}=await supabaseBrowser.auth.verifyOtp({email:email.trim(),token:otp.trim(),type:'email'});
   if(error)throw error;
   setOtpPending(false);setOtp('');setNotice('Signed in successfully.');
  }catch(e){setError(e instanceof Error?e.message:'Invalid or expired code.');}
  finally{setBusy(false);}
 }
 async function sendPasswordReset(){
  if(!email.trim()){setError('Enter your account email address first.');return;}
  setBusy(true);setError('');setNotice('');
  try{
   const {error}=await supabaseBrowser.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/account/reset-password'});
   if(error)throw error;
   setNotice('If this email has an account, you will receive a password reset link.');
  }catch(e){setError(e instanceof Error?e.message:'Could not request password reset.');}
  finally{setBusy(false);}
 }
 async function start(){
  if(busy||!subject)return;setBusy(true);setError('');setNotice('');
  try{
   const response=await api(root,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category_id:subject,grade_id:grade||null})});
   const created={id:response.id,slug:'',title:'Untitled worksheet',summary:null,status:'draft',category_id:subject,grade_id:grade||null,created_at:new Date().toISOString()};
   setActive(created);setTitle('');setSummary('');setFile(null);setAttachments([]);setStep(0);setAgree(false);setSignedPolicy(false);
   await load();setNotice('Your private draft is saved.');
  }catch(e){setError(e instanceof Error?e.message:'Unable to create a draft.');}
  finally{setBusy(false);}
 }
 async function open(item:Item){
  setActive(item);setStep(item.status==='draft'?0:2);
  setTitle(item.title==='Untitled worksheet'?'':item.title);
  setSummary(item.summary||'');setSubject(item.category_id);setGrade(item.grade_id||'');
  setError('');setNotice('');setAgree(false);setSignedPolicy(false);
  try{const response=await api(root+'/'+item.id+'/files');setAttachments(response.files||[]);}
  catch(e){setError(e instanceof Error?e.message:'Could not load your files.');}
 }
 async function upload(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!active||!file||!agree||busy)return;
  setBusy(true);setError('');setNotice('');
  try{
   const data=new FormData();data.set('file',file);data.set('rights_confirmed','yes');data.set('license_basis',rightsBasis);
   await api(root+'/'+active.id+'/files',{method:'POST',body:data});
   const latest=await api(root+'/'+active.id+'/files');
   setAttachments(latest.files||[]);setFile(null);setAgree(false);setNotice('File securely uploaded and verified.');
  }catch(e){setError(e instanceof Error?e.message:'Upload failed.');}
  finally{setBusy(false);}
 }
 async function saveMetadata(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!active||busy)return;
  setBusy(true);setError('');setNotice('');
  try{
   const result=await api(root+'/'+active.id,{method:'PATCH',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({title,summary,category_id:subject,grade_id:grade||null})});
   setActive({...active,...result.worksheet});setNotice('Draft saved. Review your details and submit.');
   setStep(2);await load();
  }catch(e){setError(e instanceof Error?e.message:'Could not save metadata.');}
  finally{setBusy(false);}
 }
 async function submit(){
  if(!active||!signedPolicy||busy)return;
  setBusy(true);setError('');setNotice('');
  try{
   await api(root+'/'+active.id+'/submit',{method:'POST'});
   setActive({...active,status:'review'});setNotice('Submitted. It will become public only after safety and copyright review.');
   await load();
  }catch(e){setError(e instanceof Error?e.message:'Unable to submit.');}
  finally{setBusy(false);}
 }
 async function download(entry:Attached,inline=false){
  if(!active)return;setBusy(true);setError('');
  try{
   const {data}=await supabaseBrowser.auth.getSession();
   const response=await fetch(root+'/'+active.id+'/files/'+entry.id+(inline?'?preview=1':''),
    {headers:{Authorization:'Bearer '+data.session?.access_token}});
   if(!response.ok)throw new Error('File unavailable.');
   const blob=await response.blob(),url=URL.createObjectURL(blob);
   if(inline){window.open(url,'_blank','noopener,noreferrer');window.setTimeout(()=>URL.revokeObjectURL(url),120000);}
   else{const anchor=document.createElement('a');anchor.href=url;anchor.download=entry.original_name;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);}
  }catch(e){setError(e instanceof Error?e.message:'Unable to open document.');}
  finally{setBusy(false);}
 }
 if(initializing)return <div className="container inner-page">Loading your account…</div>;
 if(!session)return <div className="community-page"><div className="container community-login-grid">
  <div className="community-benefits"><div className="section-kicker">SHARE LEARNING, FREE</div>
   <h1>Your worksheets can help <em>other learners.</em></h1>
   <p>Make and upload up to five free PDF or Word worksheets per account. Submissions are reviewed before becoming public.</p>
   <div className="community-benefit"><CheckCircle2 size={19}/> 5 free saved worksheets</div>
   <div className="community-benefit"><CheckCircle2 size={19}/> PDF or Word uploads</div>
   <div className="community-benefit"><ShieldCheck size={19}/> Copyright and file safety review</div>
   <p className="community-future">Private sharing and subscription plans are planned for later, not available yet.</p>
   <Link href="/create" className="text-link">Make a printable anonymously <ArrowRight size={16}/></Link>
  </div>
  <section className="community-auth-box">
   <div className="community-auth-tabs"><button className={tab==='signup'?'active':''} onClick={()=>setTab('signup')}>Create account</button>
   <button className={tab==='signin'?'active':''} onClick={()=>setTab('signin')}>Sign in</button></div>
   <h2>{tab==='signup'?'Join Worksheet Studio':'Welcome back'}</h2>
   <button className="button button-outline auth-google" type="button" onClick={googleSignIn} disabled={busy}>Continue with Google</button>
   <p className="auth-divider">or use your email</p>
   <form onSubmit={authenticate}>
    <label htmlFor="community-email">Email address</label><input id="community-email" required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <label htmlFor="community-password">Password</label><input id="community-password" required type="password" minLength={tab==='signup'?12:1}
      autoComplete={tab==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/>
    {error&&<p className="admin-alert error" role="alert"><AlertCircle size={17}/>{error}</p>}
    {notice&&<p className="admin-alert good" role="status"><CheckCircle2 size={17}/>{notice}</p>}
    <button className="button button-dark" disabled={busy} type="submit">{busy?'Please wait…':tab==='signup'?'Create free account':'Sign in'}</button>
   </form>
   {tab==='signin'&&<button type="button" className="auth-otp-link" disabled={busy} onClick={sendPasswordReset}>Forgot password?</button>}
   <button type="button" className="auth-otp-link" disabled={busy} onClick={sendOtp}>Sign in with email one-time code</button>
   {otpPending&&<form className="auth-otp-form" onSubmit={verifyOtp}><label htmlFor="community-otp">Email verification code</label><input id="community-otp" value={otp} onChange={e=>setOtp(e.target.value)} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" required/><button type="submit" className="button button-dark" disabled={busy}>Verify code</button></form>}
   <p>For adults, parents and educators. Do not upload student personal information.</p>
  </section></div></div>;
 const count=items.length;
 return <section className="community-page"><div className="container community-logged">
  <div className="community-top"><div><div className="section-kicker">COMMUNITY WORKSHEETS</div>
   <h1>My <em>worksheets.</em></h1><p>{session.user.email} · {count}/5 free worksheet slots used</p></div>
   <button className="button button-outline" type="button" onClick={()=>supabaseBrowser.auth.signOut()}><LogOut size={16}/> Sign out</button>
  </div>
  <div className="community-quota"><div><strong>{Math.max(0,5-count)} free slots remaining</strong><small>Free worksheets are public after review. Private subscriptions are coming later.</small></div>
   <div className="quota-tracks">{[0,1,2,3,4].map(n=><span className={n<count?'used':''} key={n}/>)}</div></div>
  {error&&<p className="admin-alert error" role="alert"><AlertCircle size={16}/>{error}</p>}
  {notice&&<p className="admin-alert good" role="status"><CheckCircle2 size={16}/>{notice}</p>}
  {!active?<div className="community-main">
   <div className="community-list"><h2>My saved and submitted worksheets</h2>
    {items.length===0?<p>No worksheets yet. Start with an original learning resource.</p>:
      items.map(item=><button type="button" key={item.id} onClick={()=>open(item)} className="community-item">
       <FileText size={23}/><span><strong>{item.title}</strong><small>{item.status==='review'?'Submitted for review':item.status==='published'?'Published':'Private draft'}</small></span><ArrowRight size={18}/>
      </button>)}
   </div>
   <div className="community-start"><div className="dashboard-create-icon"><UploadCloud size={29}/></div>
    <h2>Share a worksheet</h2><p>Upload an original PDF or Word worksheet, describe it, and send it for automated checks.</p>
    <label htmlFor="new-subject">Subject</label><select id="new-subject" value={subject} onChange={e=>setSubject(e.target.value)}>
     {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <label htmlFor="new-grade">Grade</label><select id="new-grade" value={grade} onChange={e=>setGrade(e.target.value)}>
     <option value="">All grades</option>{grades.map(g=><option key={g.id} value={g.id}>{g.display_name}</option>)}</select>
    <button className="button button-dark" type="button" disabled={busy||count>=5||!subject} onClick={start}><Plus size={16}/> New worksheet</button>
    {count>=5&&<p className="community-limit">You have used your five free slots. Paid/private plans are not active yet.</p>}
   </div>
  </div>:<div className="community-editor">
   <button type="button" className="community-back" onClick={()=>setActive(null)}><ArrowLeft size={16}/> Back to my worksheets</button>
   <h2>{active.title==='Untitled worksheet'?'New worksheet':active.title}</h2>
   <p>Status: <strong>{active.status==='review'?'Awaiting checks':active.status==='published'?'Public':'Private draft'}</strong></p>
   <div className="community-steps"><button className={step===0?'active':''} onClick={()=>setStep(0)}>1 Upload</button><button className={step===1?'active':''} onClick={()=>setStep(1)}>2 Metadata</button><button className={step===2?'active':''} onClick={()=>setStep(2)}>3 Review</button></div>
   {step===0&&<div className="community-form-panel">
    <h3>Upload PDF or Word</h3>
    <p>Files are private while you prepare your draft. Max 3 MB each, five files per worksheet. Do not submit copyrighted material without permission.</p>
    {attachments.map(f=><div className="community-attachment" key={f.id}><FileText size={18}/><span>{f.original_name}</span>
      <button onClick={()=>download(f,f.variant==='pdf')} type="button">{f.variant==='pdf'?'Preview':'Download'} <Download size={15}/></button></div>)}
    {active.status==='draft'&&<form onSubmit={upload}><label htmlFor="community-upload">Choose document</label>
     <input type="file" id="community-upload" accept=".pdf,.docx" required onChange={e=>setFile(e.target.files?.[0]||null)}/>
     <label htmlFor="community-rights">Copyright and redistribution rights</label>
    <select id="community-rights" value={rightsBasis} onChange={e=>setRightsBasis(e.target.value as 'original'|'licensed')}>
      <option value="original">I created this worksheet</option>
      <option value="licensed">I have a redistribution license</option>
    </select>
    <label className="check-field"><input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}/> I created or have redistribution rights to this worksheet.</label>
     <button className="button button-dark" type="submit" disabled={!file||!agree||busy}><UploadCloud size={16}/>{busy?'Uploading…':'Upload and verify'}</button></form>}
    <button className="button button-outline" type="button" onClick={()=>setStep(1)}>Next: Metadata <ArrowRight size={15}/></button>
   </div>}
   {step===1&&<form className="community-form-panel" onSubmit={saveMetadata}>
     <h3>Add worksheet details</h3><label htmlFor="community-title">Title *</label><input required minLength={3} maxLength={140} id="community-title" disabled={active.status!=='draft'} value={title} onChange={e=>setTitle(e.target.value)}/>
     <label htmlFor="community-summary">Description *</label><textarea required minLength={10} maxLength={700} id="community-summary" disabled={active.status!=='draft'} value={summary} onChange={e=>setSummary(e.target.value)} rows={4}/>
     <label htmlFor="community-subject">Subject</label><select id="community-subject" disabled={active.status!=='draft'} value={subject} onChange={e=>setSubject(e.target.value)}>
       {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
     <label htmlFor="community-grade">Grade</label><select id="community-grade" disabled={active.status!=='draft'} value={grade} onChange={e=>setGrade(e.target.value)}>
       <option value="">All grades</option>{grades.map(g=><option key={g.id} value={g.id}>{g.display_name}</option>)}</select>
     <button className="button button-dark" type="submit" disabled={active.status!=='draft'||busy}><CheckCircle2 size={16}/> Save and review</button>
   </form>}
   {step===2&&<div className="community-form-panel">
    <h3>Check and submit</h3>
    <p><strong>{active.title}</strong></p><p>{active.summary||'Add a description in Step 2.'}</p>
    <p>Files: {attachments.length}</p>
    {attachments.map(f=><div className="community-attachment" key={f.id}><FilePenLine size={16}/>{f.original_name}<button type="button" onClick={()=>download(f,f.variant==='pdf')}>Review</button></div>)}
    {active.status==='draft'&&<><label className="check-field"><input type="checkbox" checked={signedPolicy} onChange={e=>setSignedPolicy(e.target.checked)}/> I confirm this file is safe, appropriate for children, and I hold permission to share it publicly.</label>
      <button className="button button-dark" type="button" disabled={!signedPolicy||!attachments.length||!active.summary||busy} onClick={submit}>Submit for automated review <ArrowRight size={16}/></button></>}
    {active.status==='review'&&<p className="admin-alert good"><ShieldCheck size={16}/> Submission queued for moderation. It is not publicly visible yet.</p>}
    {active.status==='published'&&<Link className="button button-dark" href={'/worksheets/'+active.slug}>View public worksheet</Link>}
   </div>}
  </div>}
 </div></section>;
}
