'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({data})=>setReady(!!data.session));
    const {data:{subscription}} = supabaseBrowser.auth.onAuthStateChange((_event, session)=>setReady(!!session));
    return ()=>subscription.unsubscribe();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const { error } = await supabaseBrowser.auth.updateUser({password});
    setMessage(error?.message || 'Password updated. You can now open your admin dashboard.');
    setPassword(''); setBusy(false);
  }
  return <div className="admin-auth"><div className="admin-login">
    <LockKeyhole size={32}/><h1>Reset your <em>password.</em></h1>
    {!ready?<p>Open this page from your Supabase password-recovery email. If the link expired, request another reset from the sign-in page.</p>:
      <form onSubmit={submit}><label htmlFor="new-secret">New password (at least 12 characters)</label>
      <input id="new-secret" type="password" minLength={12} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="button button-dark admin-submit" disabled={busy}>{busy?'Updating…':'Update password'}</button></form>}
    {message&&<p role="status" className="admin-alert good">{message}</p>}
    <p className="admin-footnote"><ShieldCheck size={14}/> <Link href="/admin">Return to admin sign-in</Link></p>
  </div></div>;
}
